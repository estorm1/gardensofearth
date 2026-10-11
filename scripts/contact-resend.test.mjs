import assert from "node:assert/strict";
import { test } from "node:test";
import { createResendDelivery, createResendHandler, issueSubmission, validSubmission, submissionLifetime } from "../lib/contact-resend.ts";
import { contactConfiguration, contactSubmission, handleContact } from "../lib/contact-config.ts";

const origin = "https://gardensofearth.com";
const secret = "fictional-test-secret-only-at-least-32-characters";
const time = 1791699000000;
const mailConfig = { from: "sender@example.invalid", to: "private@example.invalid", apiKey: "re_fictional_token_only_never_a_real_key" };
const data = () => ({ name: "Synthetic Visitor", email: "visitor@example.invalid", message: "This is a synthetic contact test only.", website: "", ...issueSubmission(secret, time) });
const request = (body, headers = {}) => new Request(origin + "/api/contact", {
  method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(body),
});
function fixture(overrides = {}) {
  let now = time; const sent = [];
  const deps = { enabled: true, testMode: false, origins: [origin], secret, now: () => now,
    clientIP: () => "203.0.113.7", verifyBot: async () => true,
    checkRate: async () => ({ rateLimited: false }), deliver: async (message, key) => { sent.push({ message, key }); }, ...overrides };
  return { handler: createResendHandler(deps), sent, advance: (ms) => { now += ms; } };
}

test("Resend configuration requires no SMTP or Redis; incomplete, preview and development configs stay disabled", () => {
  const config = { NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "production", CONTACT_ENABLED: "true",
    CONTACT_PROVIDER: "resend", CONTACT_TO: mailConfig.to, CONTACT_FROM: mailConfig.from,
    CONTACT_RESEND_API_KEY: mailConfig.apiKey, CONTACT_HASH_SECRET: secret };
  assert.equal(contactConfiguration(config).mode, "resend");
  for (const key of ["CONTACT_TO", "CONTACT_FROM", "CONTACT_RESEND_API_KEY", "CONTACT_HASH_SECRET"])
    assert.equal(contactConfiguration({ ...config, [key]: "" }).mode, "disabled");
  assert.equal(contactConfiguration({ ...config, NODE_ENV: "development" }).mode, "disabled");
  assert.equal(contactConfiguration({ ...config, VERCEL_ENV: "preview" }).mode, "disabled");
  assert.equal(contactConfiguration({ ...config, CONTACT_PROVIDER: "unknown" }).mode, "disabled");
});
test("signed submissions bind id and deadline; altered, future and 20-hour-old tickets cannot send", async () => {
  const message = data();
  assert.equal(validSubmission(message, secret, time), true);
  assert.equal(validSubmission({ ...message, id: issueSubmission(secret, time).id }, secret, time), false);
  assert.equal(validSubmission(message, secret + "changed", time), false);
  for (const delta of [-1, submissionLifetime, 86400000]) {
    const f = fixture({ now: () => time + delta });
    assert.equal((await f.handler(request(message))).status, 410); assert.equal(f.sent.length, 0);
  }
  const f = fixture();
  for (const ticket of [undefined, message.ticket.slice(0, -1) + "z", message.ticket.replace(String(time), String(time + 1))]) {
    assert.equal((await f.handler(request({ ...message, ticket }))).status, 410);
  }
  assert.equal(f.sent.length, 0);
});
test("bots, missing rules, unexpected guard responses, blocked SDK rules and protection outages never send", async () => {
  const checks = [
    { verifyBot: async () => false }, { verifyBot: async () => { throw new Error("private guard details"); } },
    { checkRate: async () => ({ rateLimited: false, error: "not-found" }) },
    { checkRate: async () => ({ rateLimited: true, error: "blocked" }) },
    { checkRate: async () => ({}) }, { checkRate: async () => { throw new Error("private rule metadata"); } },
  ];
  for (const overrides of checks) {
    const f = fixture(overrides); const response = await f.handler(request(data()));
    assert.ok([403, 503].includes(response.status)); assert.equal(f.sent.length, 0);
    assert.doesNotMatch(await response.text(), /private guard|private rule/);
  }
});
test("the distributed rate key contains no raw IP or message and a limit returns a retry deadline", async () => {
  let key;
  const f = fixture({ checkRate: async (_request, value) => { key = value; return { rateLimited: true }; } });
  const result = await f.handler(request(data()));
  assert.equal(result.status, 429); assert.equal(result.headers.get("retry-after"), "600");
  assert.match(key, /^[0-9a-f]{64}$/); assert.equal(f.sent.length, 0);
});
test("fresh handler instances retry a lost provider response with the exact same key and body, sending once", async () => {
  const receipts = new Map(); let deliveries = 0; let lost = true; const attempts = [];
  const send = async (url, options) => {
    assert.equal(url, "https://api.resend.com/emails");
    const key = options.headers["Idempotency-Key"]; attempts.push({ key, body: options.body });
    if (!receipts.has(key)) { deliveries++; receipts.set(key, options.body); }
    assert.equal(receipts.get(key), options.body);
    if (lost) { lost = false; throw new Error("private provider timeout details"); }
    return Response.json({ id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" });
  };
  const deliver = createResendDelivery(mailConfig, send);
  const message = data();
  const first = await fixture({ deliver }).handler(request(message));
  assert.equal(first.status, 502); assert.equal((await first.json()).code, "unconfirmed");
  const retry = await fixture({ deliver }).handler(request(message));
  assert.equal(retry.status, 202); assert.equal(deliveries, 1); assert.deepEqual(attempts[0], attempts[1]);
});
test("provider concurrency and changed-payload errors remain distinct; no automatic retry is attempted", async () => {
  for (const [name, expected] of [["concurrent_idempotent_requests", "pending"], ["invalid_idempotent_request", "conflict"]]) {
    let attempts = 0;
    const deliver = createResendDelivery(mailConfig, async () => { attempts++; return Response.json({ name, message: "private recipient" }, { status: 409 }); });
    const response = await fixture({ deliver }).handler(request(data()));
    assert.equal(response.status, 409); const body = await response.json(); assert.equal(body.code, expected);
    assert.doesNotMatch(JSON.stringify(body), /private recipient/); assert.equal(attempts, 1);
  }
});
test("acceptance requires a provider id; malformed success, 5xx, redirects and timeouts remain unconfirmed", async () => {
  for (const send of [async () => Response.json({}), async () => new Response("bad json"),
    async () => Response.json({ message: "private key" }, { status: 503 }), async () => { throw new Error("private key"); }]) {
    const response = await fixture({ deliver: createResendDelivery(mailConfig, send) }).handler(request(data()));
    assert.equal(response.status, 502); assert.doesNotMatch(await response.text(), /private key/);
  }
});
test("provider quotas and known rejection preserve safe same-submission retry and disclose no provider body", async () => {
  for (const [status, name, expected] of [[429, "daily_quota_exceeded", "rate"], [429, "rate_limit_exceeded", "rate"],
    [403, "validation_error", "unavailable"]]) {
    const response = await fixture({ deliver: createResendDelivery(mailConfig, async () =>
      Response.json({ name, message: mailConfig.to + " " + mailConfig.apiKey }, { status })) }).handler(request(data()));
    assert.equal((await response.clone().json()).code, expected);
    assert.doesNotMatch(await response.text(), /private@example|re_fictional/);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
  }
});
test("provider requests fix From and To, validate Reply-To, send plain text and disable redirects", async () => {
  const f = fixture({ deliver: createResendDelivery(mailConfig, async (_url, options) => {
    const body = JSON.parse(options.body);
    assert.deepEqual(body.to, [mailConfig.to]); assert.equal(body.from, "Gardens of Earth <" + mailConfig.from + ">");
    assert.equal(body.reply_to, "visitor@example.invalid"); assert.equal(body.subject, "Gardens of Earth website message");
    assert.equal(body.html, undefined); assert.equal(body.attachments, undefined); assert.equal(body.ticket, undefined);
    assert.equal(options.redirect, "error"); assert.equal(options.cache, "no-store");
    assert.equal(options.headers.Authorization, "Bearer " + mailConfig.apiKey);
    assert.match(options.headers["Idempotency-Key"], /^goe-contact\/[0-9a-f]{64}$/);
    return Response.json({ id: "49a3999c-0ce1-4ea6-ab68-afcd6dc2e794" });
  }) });
  const response = await f.handler(request({ ...data(), to: "attacker@example.invalid", from: "attacker@example.invalid" }));
  assert.equal(response.status, 202); assert.doesNotMatch(await response.text(), /private@example|re_fictional|49a399/);
});
test("Resend shares body, origin, honeypot and header-injection validation before any provider call", async () => {
  for (const [fields, headers] of [[{ website: "spam" }, {}], [{ email: "one@example.invalid,two@example.invalid" }, {}],
    [{ name: "Name\r\nBcc: attacker@example.invalid" }, {}], [{ message: "x".repeat(5001) }, {}], [{}, { origin: "https://other.example" }]]) {
    const f = fixture(); assert.ok([400, 403].includes((await f.handler(request({ ...data(), ...fields }, headers))).status));
    assert.equal(f.sent.length, 0);
  }
});
test("invalid UTF-8 cannot silently change a submitted message", async () => {
  const f = fixture(); const content = JSON.stringify(data());
  const body = Buffer.from(content.replace("synthetic contact", "invalid XX contact"));
  body[body.indexOf("XX")] = 0xc0;
  const response = await f.handler(new Request(origin + "/api/contact", {
    method: "POST", headers: { origin, "content-type": "application/json" }, body,
  }));
  assert.equal(response.status, 400); assert.equal(f.sent.length, 0);
});
test("local mock ticket endpoint requires the form header and loopback; production/mock gates send no email", async () => {
  const changes = { NODE_ENV: "development", CONTACT_LOCAL_MOCK: "true", CONTACT_PROVIDER: "resend", VERCEL: undefined };
  const previous = Object.fromEntries(Object.keys(changes).map(key => [key, process.env[key]]));
  try {
    for (const [key, value] of Object.entries(changes)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
    const local = "http://127.0.0.1:3428/api/contact";
    const response = contactSubmission(new Request(local, { headers: { "x-contact-form": "1", "sec-fetch-site": "same-origin" } }));
    assert.equal(response.status, 200); assert.equal(response.headers.get("cache-control"), "no-store");
    const ticket = await response.json(); assert.ok(ticket.id && ticket.ticket && ticket.expiresAt);
    assert.equal(contactSubmission(new Request(local)).status, 403);
    assert.equal(contactSubmission(new Request(local, { headers: { "x-contact-form": "1", "sec-fetch-site": "cross-site" } })).status, 403);
    assert.equal(contactSubmission(new Request(origin + "/api/contact", { headers: { "x-contact-form": "1" } })).status, 503);
    assert.equal((await handleContact(request(data()))).status, 503);
  } finally { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
});
