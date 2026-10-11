import "server-only";
import { randomBytes } from "node:crypto";
import { createContactHandler, validEmail, type ContactDependencies } from "./contact-handler.ts";
import { createSmtpDelivery, type SmtpConfig } from "./contact-delivery.ts";
import { createMemoryStore, createRedisStore, createRestCommand } from "./contact-store.ts";
import { checkBotId } from "botid/server";
import { checkRateLimit } from "@vercel/firewall";
import { contactReply } from "./contact-handler.ts";
import { createResendDelivery, createResendHandler, issueSubmission, ResendError, type ResendConfig } from "./contact-resend.ts";

type Env = Record<string, string | undefined>;
const localStore = createMemoryStore();
const localSecret = randomBytes(32).toString("hex");
const productionOrigins = ["https://gardensofearth.com", "https://www.gardensofearth.com", "https://gardensofearth.vercel.app"];
const mockReceipts = new Map<string, { body: string; started: number }>();

export function contactConfiguration(env: Env = process.env):
  | { mode: "disabled" }
  | { mode: "mock"; usesTickets: boolean }
  | { mode: "resend"; resend: ResendConfig; secret: string; rateLimitId: string }
  | { mode: "smtp"; smtp: SmtpConfig; redisUrl: string; redisToken: string; secret: string } {
  if (env.CONTACT_LOCAL_MOCK === "true" && env.NODE_ENV === "development" && !env.VERCEL) {
    return { mode: "mock", usesTickets: env.CONTACT_PROVIDER === "resend" };
  }
  if (env.CONTACT_ENABLED !== "true" || env.NODE_ENV !== "production" || env.VERCEL !== "1" || env.VERCEL_ENV !== "production") return { mode: "disabled" };
  if (env.CONTACT_PROVIDER === "resend") {
    const { CONTACT_TO: to, CONTACT_FROM: from, CONTACT_RESEND_API_KEY: apiKey, CONTACT_HASH_SECRET: secret } = env;
    const rateLimitId = env.CONTACT_RATE_LIMIT_ID ?? "goe-contact";
    if (!to || !validEmail(to) || !from || !validEmail(from) || !apiKey || !/^re_[A-Za-z0-9_-]{20,}$/.test(apiKey) ||
        !secret || secret.length < 32 || !/^[a-zA-Z0-9_-]{1,64}$/.test(rateLimitId)) return { mode: "disabled" };
    return { mode: "resend", resend: { to, from, apiKey }, secret, rateLimitId };
  }
  if (env.CONTACT_PROVIDER && env.CONTACT_PROVIDER !== "smtp") return { mode: "disabled" };
  const { CONTACT_TO: to, CONTACT_FROM: from, CONTACT_SMTP_HOST: host,
    CONTACT_SMTP_USER: user, CONTACT_SMTP_PASSWORD: password,
    CONTACT_REDIS_REST_URL: redisUrl, CONTACT_REDIS_REST_TOKEN: redisToken, CONTACT_HASH_SECRET: secret } = env;
  const port = Number(env.CONTACT_SMTP_PORT);
  if (!to || !validEmail(to) || !from || !validEmail(from) || !host || !/^[a-z0-9.-]+$/i.test(host) ||
      !host.includes(".") || ![465, 587].includes(port) || !user || !password || !redisUrl || !redisToken ||
      !secret || secret.length < 32) return { mode: "disabled" };
  try {
    const url = new URL(redisUrl);
    if (url.protocol !== "https:" || !url.hostname.endsWith(".upstash.io") ||
        url.port || url.username || url.password || url.search || url.hash || url.pathname !== "/") return { mode: "disabled" };
  } catch { return { mode: "disabled" }; }
  return { mode: "smtp", smtp: { to, from, host, port, user, password }, redisUrl, redisToken, secret };
}

// Only availability/mode booleans cross the Server Component / Client Component boundary.
export function contactAvailability() {
  const config = contactConfiguration();
  return { enabled: config.mode !== "disabled", testMode: config.mode === "mock",
    usesTickets: config.mode === "resend" || config.mode === "mock" && config.usesTickets };
}

const trustedIP = (req: Request) => req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ?? null;
function localPolicy(request: Request) {
  const url = new URL(request.url);
  const loopback = url.hostname === "127.0.0.1" || url.hostname === "localhost";
  return { loopback, origins: loopback ? [url.protocol + "//127.0.0.1:" + url.port, url.protocol + "//localhost:" + url.port] : [] };
}

// Public nonce only: no recipient, sender, provider key, IP or message data is returned.
export function contactSubmission(request: Request) {
  const config = contactConfiguration();
  const local = localPolicy(request);
  const mock = config.mode === "mock" && config.usesTickets && local.loopback;
  if (config.mode !== "resend" && !mock) return contactReply(503, "unavailable", "Messages are temporarily unavailable. Please check back later.");
  const origins = mock ? local.origins : productionOrigins;
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (request.headers.get("x-contact-form") !== "1" || (origin && !origins.includes(origin)) ||
      (site && site !== "same-origin")) return contactReply(403, "origin", "Use the contact form on this website.");
  return Response.json(issueSubmission(config.mode === "resend" ? config.secret : localSecret), {
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", Vary: "Origin" },
  });
}

export function handleContact(request: Request) {
  const config = contactConfiguration();
  if (config.mode === "resend") {
    return createResendHandler({ enabled: true, testMode: false, origins: productionOrigins, secret: config.secret,
      clientIP: trustedIP,
      verifyBot: async () => {
        const result = await checkBotId({ advancedOptions: { checkLevel: "basic" }, developmentOptions: { isDevelopment: false } });
        return result.isHuman === true && result.isBot === false && result.bypassed === false;
      },
      checkRate: async (_req, key) => checkRateLimit(config.rateLimitId, {
        // Fixed owned host prevents Host-header redirection; forward no cookies or visitor form data.
        headers: new Headers({ host: "gardensofearth.com" }), rateLimitKey: key, timeout: 3000,
      }),
      deliver: createResendDelivery(config.resend),
    })(request);
  }
  const local = localPolicy(request);
  if (config.mode === "mock" && config.usesTickets && local.loopback) {
    return createResendHandler({ enabled: true, testMode: true, origins: local.origins, secret: localSecret,
      clientIP: () => "127.0.0.1", verifyBot: async () => true, checkRate: async () => ({ rateLimited: false }),
      deliver: async (message, key) => {
        const now = Date.now();
        for (const [oldKey, record] of mockReceipts) if (now - record.started > 86400000) mockReceipts.delete(oldKey);
        const body = JSON.stringify([message.name, message.email, message.message]);
        const previous = mockReceipts.get(key);
        if (previous && previous.body !== body) throw new ResendError("conflict");
        if (previous) return;
        mockReceipts.set(key, { body, started: now });
        if (process.env.CONTACT_LOCAL_MOCK_OUTCOME === "uncertain-once") throw new ResendError("unknown");
      },
    })(request);
  }
  let dependencies: ContactDependencies;
  if (config.mode === "smtp") {
    dependencies = {
      enabled: true, testMode: false, origins: productionOrigins, secret: config.secret,
      // Vercel overwrites this client-IP header. Other hosts may not use it safely.
      clientIP: trustedIP,
      store: createRedisStore(createRestCommand(config.redisUrl, config.redisToken)),
      deliver: createSmtpDelivery(config.smtp),
    };
  } else {
    dependencies = {
      enabled: config.mode === "mock" && local.loopback, testMode: true,
      // Next's local Request URL uses localhost even when the browser opens 127.0.0.1.
      origins: local.origins, secret: localSecret,
      clientIP: () => "127.0.0.1", store: localStore, deliver: async () => {},
    };
  }
  return createContactHandler(dependencies)(request);
}
