import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { createContactHandler, DeliveryError, validEmail } from "../lib/contact-handler.ts";
import { createMemoryStore, createRedisStore, createRestCommand } from "../lib/contact-store.ts";
import { contactConfiguration } from "../lib/contact-config.ts";
import { contactMail, createSmtpDelivery, smtpOptions } from "../lib/contact-delivery.ts";

const origin = "https://gardensofearth.com";
const message = () => ({ name: "Test Visitor", email: "visitor@example.invalid", message: "A local mocked contact test.", website: "", id: randomUUID() });
const request = (data, headers = {}) => new Request(origin + "/api/contact", {
  method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body: JSON.stringify(data),
});
function fixture(overrides = {}) {
  const sent = [];
  let now = 1_000_000_000_000;
  const deps = {
    enabled: true, testMode: false, origins: [origin], secret: "local-unit-test-secret-at-least-32-characters",
    clientIP: () => "203.0.113.7", store: createMemoryStore(),
    deliver: async (data) => { sent.push(data); }, now: () => now, ...overrides,
  };
  return { handler: createContactHandler(deps), sent, advance: (ms) => { now += ms; } };
}
const smtp = { host: "smtp.example.invalid", port: 587, user: "test-user", password: "not-a-real-password",
  from: "sender@example.invalid", to: "private-recipient@example.invalid" };
const configured = {
  NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "production", CONTACT_ENABLED: "true",
  CONTACT_TO: smtp.to, CONTACT_FROM: smtp.from, CONTACT_SMTP_HOST: smtp.host, CONTACT_SMTP_PORT: "587",
  CONTACT_SMTP_USER: smtp.user, CONTACT_SMTP_PASSWORD: smtp.password,
  CONTACT_REDIS_REST_URL: "https://test.example.upstash.io", CONTACT_REDIS_REST_TOKEN: "not-a-real-token",
  CONTACT_HASH_SECRET: "local-unit-test-secret-at-least-32-characters",
};

test("success is only returned after mocked provider acceptance; duplicate retries do not resend", async () => {
  const f = fixture(); const data = message();
  const first = await f.handler(request(data));
  assert.equal(first.status, 202);
  assert.match((await first.json()).message, /does not confirm/);
  const retry = await f.handler(request(data));
  assert.equal(retry.status, 202); assert.equal(f.sent.length, 1);
  assert.equal(retry.headers.get("cache-control"), "no-store");
});
test("same-id concurrent requests reserve only one email", async () => {
  let release; let entered;
  const start = new Promise(resolve => { entered = resolve; });
  const block = new Promise(resolve => { release = resolve; });
  let sent = 0;
  const f = fixture({ deliver: async () => { sent++; entered(); await block; } });
  const data = message(); const first = f.handler(request(data));
  await start;
  const second = await f.handler(request(data));
  assert.equal(second.status, 409); assert.equal((await second.json()).code, "pending");
  release(); assert.equal((await first).status, 202); assert.equal(sent, 1);
});
test("changed payload cannot reuse an accepted submission id", async () => {
  const f = fixture(); const data = message();
  await f.handler(request(data));
  const changed = await f.handler(request({ ...data, message: "A different message." }));
  assert.equal(changed.status, 409); assert.equal(f.sent.length, 1);
});
test("missing configuration fails closed before processing message data", async () => {
  const f = fixture({ enabled: false });
  const result = await f.handler(request(message()));
  assert.equal(result.status, 503); assert.equal(f.sent.length, 0);
});
test("cross-origin, missing-origin, cross-site, and non-JSON requests never send", async () => {
  for (const headers of [{ origin: "https://other.example" }, { origin: "" }, { "sec-fetch-site": "cross-site" }, { "content-type": "text/plain" }]) {
    const f = fixture(); assert.ok([403, 415].includes((await f.handler(request(message(), headers))).status));
    assert.equal(f.sent.length, 0);
  }
});
test("invalid JSON and oversized bodies are bounded even with a misleading content-length", async () => {
  const f = fixture();
  const make = (body, headers = {}) => new Request(origin + "/api/contact", {
    method: "POST", headers: { origin, "content-type": "application/json", ...headers }, body,
  });
  assert.equal((await f.handler(make("{"))).status, 400);
  assert.equal((await f.handler(make("x".repeat(24001), { "content-length": "1" }))).status, 413);
  assert.equal((await f.handler(make("{}", { "content-length": "25000" }))).status, 413);
  assert.equal(f.sent.length, 0);
});
test("honeypot, header injection, multiple addresses, controls, field limits, and non-string values are rejected", async () => {
  const invalid = [
    { website: "https://spam.example" }, { name: "A\r\nBcc: other@example.invalid" },
    { email: "visitor@example.invalid\r\nBcc: other@example.invalid" },
    { email: "one@example.invalid,two@example.invalid" }, { email: ".bad@example.invalid" },
    { email: "a".repeat(65) + "@example.invalid" }, { message: "\0not valid content" },
    { name: "x".repeat(101) }, { message: "x".repeat(5001) }, { message: "short" },
    { name: [] }, { message: {} }, { id: "not-a-uuid" },
  ];
  for (const fields of invalid) {
    const f = fixture();
    assert.equal((await f.handler(request({ ...message(), ...fields }))).status, 400);
    assert.equal(f.sent.length, 0);
  }
  assert.equal(validEmail("person+reply@example.invalid"), true);
});
test("cooldown, three-per-hour limit, and rate Retry-After apply before delivery", async () => {
  const f = fixture();
  assert.equal((await f.handler(request(message()))).status, 202);
  const fast = await f.handler(request(message()));
  assert.equal(fast.status, 429); assert.ok(Number(fast.headers.get("retry-after")) > 0);
  f.advance(61000); assert.equal((await f.handler(request(message()))).status, 202);
  f.advance(61000); assert.equal((await f.handler(request(message()))).status, 202);
  f.advance(61000); assert.equal((await f.handler(request(message()))).status, 429);
  assert.equal(f.sent.length, 3);
});
test("global daily budget caps messages even when clients rotate IPs", async () => {
  let ip = 0;
  const f = fixture({ clientIP: () => "203.0.113." + (++ip) });
  for (let n = 0; n < 50; n++) assert.equal((await f.handler(request(message()))).status, 202);
  assert.equal((await f.handler(request(message()))).status, 429);
  assert.equal(f.sent.length, 50);
});
test("store outage and missing trusted IP never fall back to unrestricted sending", async () => {
  for (const overrides of [
    { clientIP: () => null },
    { store: { claim: async () => { throw new Error("private-store-token"); }, finish: async () => {} } },
  ]) {
    const f = fixture(overrides); const result = await f.handler(request(message()));
    assert.equal(result.status, 503); assert.equal(f.sent.length, 0);
    assert.doesNotMatch(await result.text(), /private-store-token/);
  }
});
test("unknown SMTP result remains unconfirmed and does not get a duplicate automatic send", async () => {
  let sent = 0;
  const f = fixture({ deliver: async () => { sent++; throw new Error("private-recipient@example.invalid private-password"); } });
  const data = message(); const first = await f.handler(request(data));
  assert.equal(first.status, 502);
  const text = await first.text(); assert.match(text, /unconfirmed/);
  assert.doesNotMatch(text, /private-recipient|private-password/);
  f.advance(61000);
  assert.equal((await f.handler(request(data))).status, 409); assert.equal(sent, 1);
});
test("known provider rejection can be retried with the same id after cooldown", async () => {
  let attempts = 0;
  const f = fixture({ deliver: async () => { if (++attempts === 1) throw new DeliveryError(false); } });
  const data = message();
  assert.equal((await f.handler(request(data))).status, 503);
  f.advance(61000);
  assert.equal((await f.handler(request(data))).status, 202); assert.equal(attempts, 2);
});
test("keyed rate metadata contains neither raw IP nor message/reply address", async () => {
  let values;
  const f = fixture({ store: { claim: async (...args) => { values = args; return { kind: "new" }; }, finish: async () => {} } });
  const data = message(); await f.handler(request(data));
  for (const value of values.slice(0, 3)) assert.match(value, /^[0-9a-f]{64}$/);
  assert.doesNotMatch(JSON.stringify(values), /203\.0\.113|visitor@example|local mocked/);
});
test("mock mode is explicit and unavailable in production or Vercel previews", () => {
  assert.equal(contactConfiguration({}).mode, "disabled");
  assert.equal(contactConfiguration({ NODE_ENV: "development", CONTACT_LOCAL_MOCK: "true" }).mode, "mock");
  assert.equal(contactConfiguration({ NODE_ENV: "production", CONTACT_LOCAL_MOCK: "true" }).mode, "disabled");
  assert.equal(contactConfiguration({ NODE_ENV: "development", VERCEL: "1", CONTACT_LOCAL_MOCK: "true" }).mode, "disabled");
  assert.equal(contactConfiguration(configured).mode, "smtp");
  for (const key of ["CONTACT_TO", "CONTACT_SMTP_PASSWORD", "CONTACT_REDIS_REST_TOKEN", "CONTACT_HASH_SECRET"]) {
    assert.equal(contactConfiguration({ ...configured, [key]: "" }).mode, "disabled");
  }
  assert.equal(contactConfiguration({ ...configured, CONTACT_REDIS_REST_URL: "http://test.upstash.io" }).mode, "disabled");
  assert.equal(contactConfiguration({ ...configured, VERCEL_ENV: "preview" }).mode, "disabled");
});
test("SMTP uses fixed private envelope and sender, validated Reply-To, plain text, TLS and no file/url access", () => {
  const data = message(); const mail = contactMail(smtp, data);
  assert.deepEqual(mail.envelope, { from: smtp.from, to: [smtp.to] });
  assert.deepEqual(mail.replyTo, { address: data.email, name: "" });
  assert.equal(mail.subject, "Gardens of Earth website message");
  assert.equal(mail.html, undefined); assert.equal(mail.attachments, undefined);
  const options = smtpOptions(smtp);
  assert.equal(options.requireTLS, true); assert.equal(options.tls.rejectUnauthorized, true);
  assert.equal(options.disableFileAccess, true); assert.equal(options.disableUrlAccess, true);
  assert.equal(options.debug, false); assert.equal(options.logger, false);
  assert.equal(smtpOptions({ ...smtp, port: 465 }).secure, true);
});
test("SMTP adapter accepts only a provider-accepted configured recipient and sanitizes all errors", async () => {
  await createSmtpDelivery(smtp, async () => ({ accepted: [smtp.to] }))(message());
  await assert.rejects(createSmtpDelivery(smtp, async () => ({ accepted: ["other@example.invalid"] }))(message()),
    error => error instanceof DeliveryError && !error.uncertain);
  await assert.rejects(createSmtpDelivery(smtp, async () => { throw { command: "AUTH", responseCode: 535 }; })(message()),
    error => error instanceof DeliveryError && !error.uncertain);
  await assert.rejects(createSmtpDelivery(smtp, async () => { throw { command: "DATA", code: "ETIMEDOUT" }; })(message()),
    error => error instanceof DeliveryError && error.uncertain);
});
test("Redis REST adapter authenticates in a header, sends one atomic script, and validates its reply", async () => {
  let command;
  const rest = createRestCommand("https://test.upstash.io", "not-a-real-token", async (url, options) => {
    assert.equal(url, "https://test.upstash.io");
    assert.equal(options.headers.Authorization, "Bearer not-a-real-token");
    assert.equal(options.redirect, "error"); command = JSON.parse(options.body);
    return Response.json({ result: ["new", 0] });
  });
  const store = createRedisStore(rest);
  assert.equal((await store.claim("id-hash", "body-hash", "ip-hash", 1000000000000)).kind, "new");
  assert.equal(command[0], "EVAL"); assert.equal(command[2], 4);
  assert.match(command[1], /EXPIRE/); assert.match(command[1], /86400/);
  const invalid = createRedisStore(async () => ({ untrusted: true }));
  await assert.rejects(invalid.claim("id", "fp", "ip", 0));
  const outage = createRestCommand("https://test.upstash.io", "token", async () => Response.json({ error: "secret" }));
  await assert.rejects(outage(["GET", "key"]), /Contact store unavailable/);
});
