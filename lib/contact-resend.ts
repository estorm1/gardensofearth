import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { contactReply as reply, parseContactSubmission, type ContactMessage } from "./contact-handler.ts";

export const submissionLifetime = 20 * 60 * 60 * 1000;
export type Submission = { id: string; ticket: string; expiresAt: number };
export type ResendConfig = { from: string; to: string; apiKey: string };
const sign = (secret: string, value: string) => createHmac("sha256", secret).update(value).digest("hex");

// A server-issued deadline prevents replay after the provider's 24-hour deduplication window.
export function issueSubmission(secret: string, now = Date.now()): Submission {
  const id = randomUUID();
  const payload = "v1." + now + "." + id;
  return { id, ticket: payload + "." + sign(secret, "goe-contact:" + payload), expiresAt: now + submissionLifetime };
}

export function validSubmission(message: ContactMessage, secret: string, now: number): boolean {
  const parts = message.ticket?.split(".");
  if (!parts || parts.length !== 4 || parts[0] !== "v1" || !/^\d{13}$/.test(parts[1]) ||
      parts[2] !== message.id || !/^[0-9a-f]{64}$/.test(parts[3])) return false;
  const issued = Number(parts[1]);
  if (issued > now || now - issued >= submissionLifetime) return false;
  const expected = sign(secret, "goe-contact:" + parts.slice(0, 3).join("."));
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(parts[3], "hex"));
}

export class ResendError extends Error {
  readonly kind: "pending" | "conflict" | "rate" | "rejected" | "unknown";
  readonly retryAfter: number;
  constructor(kind: ResendError["kind"], retryAfter = 60) {
    super("Contact email service unavailable");
    this.kind = kind; this.retryAfter = retryAfter;
  }
}

export function createResendDelivery(config: ResendConfig, send: typeof fetch = fetch) {
  return async (message: ContactMessage, idempotencyKey: string) => {
    try {
      const response = await send("https://api.resend.com/emails", {
        method: "POST", redirect: "error", cache: "no-store",
        headers: { Authorization: "Bearer " + config.apiKey, "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
        body: JSON.stringify({ from: "Gardens of Earth <" + config.from + ">", to: [config.to],
          reply_to: message.email, subject: "Gardens of Earth website message",
          text: "Name: " + message.name + "\nReply address: " + message.email + "\n\n" + message.message }),
        signal: AbortSignal.timeout(12000),
      });
      const data = await response.json().catch(() => null) as { id?: unknown; name?: unknown } | null;
      if (response.ok && typeof data?.id === "string" && /^[0-9a-f-]{36}$/i.test(data.id)) return;
      if (response.status === 409 && data?.name === "concurrent_idempotent_requests") throw new ResendError("pending");
      if (response.status === 409 && data?.name === "invalid_idempotent_request") throw new ResendError("conflict");
      if (response.status === 429) {
        const header = Number(response.headers.get("retry-after"));
        const fallback = data?.name === "daily_quota_exceeded" || data?.name === "monthly_quota_exceeded" ? 3600 : 60;
        throw new ResendError("rate", Number.isFinite(header) && header > 0 ? Math.min(3600, Math.ceil(header)) : fallback);
      }
      if ([400, 401, 403, 422].includes(response.status)) throw new ResendError("rejected", 300);
      // A timeout, 5xx, redirect or malformed success could follow provider acceptance.
      throw new ResendError("unknown");
    } catch (error) {
      throw error instanceof ResendError ? error : new ResendError("unknown");
    }
  };
}

type Dependencies = {
  enabled: boolean; testMode: boolean; origins: string[]; secret: string;
  clientIP(request: Request): string | null;
  verifyBot(request: Request): Promise<boolean>;
  checkRate(request: Request, key: string): Promise<{ rateLimited: boolean; error?: string }>;
  deliver(message: ContactMessage, key: string): Promise<void>;
  now?: () => number;
};

export function createResendHandler(deps: Dependencies) {
  return async (request: Request) => {
    const message = await parseContactSubmission(request, deps);
    if (message instanceof Response) return message;
    if (!validSubmission(message, deps.secret, (deps.now ?? Date.now)())) {
      return reply(410, "expired", "This submission can no longer be retried safely. Keep a copy of your text; a previous attempt may have been accepted. Please avoid sending a second copy.");
    }
    try {
      if (!await deps.verifyBot(request)) return reply(403, "verification", "The browser check did not pass. Keep your text and try this same submission again.", {}, 60);
      const rate = await deps.checkRate(request, sign(deps.secret, "ip:" + deps.clientIP(request)!.toLowerCase()));
      if (rate.error || typeof rate.rateLimited !== "boolean") throw new Error("Contact protection unavailable");
      if (rate.rateLimited) return reply(429, "rate", "Please wait before retrying this same message. Your text is still here.", {}, 600);
    } catch {
      return reply(503, "protection", "Sending is temporarily unavailable. Keep your text and retry this same submission later.", {}, 300);
    }
    try { await deps.deliver(message, "goe-contact/" + sign(deps.secret, "resend:" + message.id)); }
    catch (error) {
      const kind = error instanceof ResendError ? error.kind : "unknown";
      if (kind === "pending") return reply(409, "pending", "This message is already being processed. Keep it here and retry the same submission shortly.", {}, 60);
      if (kind === "conflict") return reply(409, "conflict", "This submission differs from a previous attempt. Keep a copy; a previous attempt may already have been accepted. Please avoid sending a second copy.");
      if (kind === "rate") return reply(429, "rate", "The sending limit has been reached. Keep your text and retry this same submission later.", {}, (error as ResendError).retryAfter);
      if (kind === "rejected") return reply(503, "unavailable", "The email service could not accept this attempt. Keep your text and retry this same submission later.", {}, 300);
      return reply(502, "unconfirmed", "We could not confirm acceptance. Your text is still here. Retry this same submission; please avoid sending a second copy.", {}, 60);
    }
    return reply(202, "accepted", deps.testMode ? "Local preview: mock delivery accepted. No email was sent."
      : "The email service accepted your message. This does not confirm it has arrived or been read.");
  };
}
