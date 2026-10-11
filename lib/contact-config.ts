import "server-only";
import { randomBytes } from "node:crypto";
import { createContactHandler, validEmail, type ContactDependencies } from "./contact-handler.ts";
import { createSmtpDelivery, type SmtpConfig } from "./contact-delivery.ts";
import { createMemoryStore, createRedisStore, createRestCommand } from "./contact-store.ts";

type Env = Record<string, string | undefined>;
const localStore = createMemoryStore();
const localSecret = randomBytes(32).toString("hex");
const productionOrigins = ["https://gardensofearth.com", "https://gardensofearth.vercel.app"];

export function contactConfiguration(env: Env = process.env):
  | { mode: "disabled" }
  | { mode: "mock" }
  | { mode: "smtp"; smtp: SmtpConfig; redisUrl: string; redisToken: string; secret: string } {
  if (env.CONTACT_LOCAL_MOCK === "true" && env.NODE_ENV === "development" && !env.VERCEL) return { mode: "mock" };
  if (env.CONTACT_ENABLED !== "true" || env.VERCEL !== "1" || env.VERCEL_ENV !== "production") return { mode: "disabled" };
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

// Only these two booleans cross the Server Component / Client Component boundary.
export function contactAvailability() {
  const config = contactConfiguration();
  return { enabled: config.mode !== "disabled", testMode: config.mode === "mock" };
}

export function handleContact(request: Request) {
  const config = contactConfiguration();
  let dependencies: ContactDependencies;
  if (config.mode === "smtp") {
    dependencies = {
      enabled: true, testMode: false, origins: productionOrigins, secret: config.secret,
      // Vercel overwrites this client-IP header. Other hosts may not use it safely.
      clientIP: (req) => req.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ?? null,
      store: createRedisStore(createRestCommand(config.redisUrl, config.redisToken)),
      deliver: createSmtpDelivery(config.smtp),
    };
  } else {
    const url = new URL(request.url);
    const loopback = url.hostname === "127.0.0.1" || url.hostname === "localhost";
    dependencies = {
      enabled: config.mode === "mock" && loopback, testMode: true,
      // Next's local Request URL uses localhost even when the browser opens 127.0.0.1.
      origins: loopback ? [url.protocol + "//127.0.0.1:" + url.port, url.protocol + "//localhost:" + url.port] : [], secret: localSecret,
      clientIP: () => "127.0.0.1", store: localStore, deliver: async () => {},
    };
  }
  return createContactHandler(dependencies)(request);
}
