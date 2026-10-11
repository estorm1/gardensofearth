import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";
import { contactLimits } from "../app/contact/limits.ts";

export type ContactMessage = { name: string; email: string; message: string; id: string; ticket?: string };
export type Claim = { kind: "new" | "accepted" | "pending" | "unknown" | "conflict" | "rate"; retryAfter?: number };
export type Completion = "accepted" | "failed" | "unknown";
export interface ContactStore {
  claim(id: string, fingerprint: string, ipHash: string, now: number): Promise<Claim>;
  finish(id: string, fingerprint: string, status: Completion): Promise<void>;
}
export type ContactDependencies = {
  enabled: boolean;
  testMode: boolean;
  origins: string[];
  secret: string;
  clientIP(request: Request): string | null;
  store: ContactStore;
  deliver(message: ContactMessage): Promise<void>;
  now?: () => number;
  bodyTimeoutMs?: number;
};

export class DeliveryError extends Error {
  readonly uncertain: boolean;
  constructor(uncertain: boolean) {
    super("Contact delivery failed");
    this.uncertain = uncertain;
  }
}

export function validEmail(value: string): boolean {
  if (value.length > contactLimits.email || /[\s,;<>()[\]\\]/.test(value)) return false;
  const parts = value.split("@");
  if (parts.length !== 2 || parts[0].length > 64 || parts[0].startsWith(".") ||
      parts[0].endsWith(".") || parts[0].includes("..")) return false;
  return /^[A-Za-z0-9.!#$%&'*+/=?^_\x60{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/.test(value);
}

export function contactReply(status: number, code: string, message: string, extra: Record<string, unknown> = {}, retryAfter?: number) {
  return Response.json({ code, message, ...extra }, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...(retryAfter ? { "Retry-After": String(retryAfter) } : {}),
    },
  });
}
const reply = contactReply;

class BodyTimeout extends Error {}
async function readBody(request: Request, timeoutMs: number) {
  const declared = request.headers.get("content-length");
  if (declared && (!/^\d+$/.test(declared) || Number(declared) > contactLimits.bodyBytes)) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  let expired = false;
  const timer = setTimeout(() => { expired = true; void reader.cancel().catch(() => {}); }, timeoutMs);
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (expired) throw new BodyTimeout();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > contactLimits.bodyBytes) {
        await reader.cancel();
        throw new RangeError();
      }
      chunks.push(value);
    }
  } finally { clearTimeout(timer); reader.releaseLock(); }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(Buffer.concat(chunks))) as unknown;
}

function validate(value: unknown): ContactMessage | Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { form: "Please complete the form." };
  const input = value as Record<string, unknown>;
  if (typeof input.website !== "string" || input.website.length) return { form: "Please reload the form and try again." };
  const errors: Record<string, string> = {};
  if (typeof input.name !== "string" || !input.name.trim() || input.name.length > contactLimits.name ||
      /[\u0000-\u001f\u007f]/.test(input.name)) errors.name = "Enter a name of up to 100 characters.";
  if (typeof input.email !== "string" || !validEmail(input.email.trim()) || input.email !== input.email.trim()) {
    errors.email = "Enter one valid reply email address.";
  }
  if (typeof input.message !== "string" || input.message.trim().length < 10 ||
      input.message.length > contactLimits.message || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(input.message)) {
    errors.message = "Write a message of 10 to 5,000 characters.";
  }
  if (typeof input.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.id)) {
    errors.form = "Please reload the form and try again.";
  }
  if (input.ticket !== undefined && (typeof input.ticket !== "string" || input.ticket.length > 256)) {
    errors.form = "Please reload the form and try again.";
  }
  if (Object.keys(errors).length) return errors;
  return {
    name: (input.name as string).trim(), email: input.email as string,
    message: (input.message as string).trim().replace(/\r\n?/g, "\n"), id: (input.id as string).toLowerCase(),
    ...(typeof input.ticket === "string" ? { ticket: input.ticket } : {}),
  };
}

type RequestPolicy = Pick<ContactDependencies, "enabled" | "origins" | "clientIP" | "bodyTimeoutMs">;
export async function parseContactSubmission(request: Request, deps: RequestPolicy): Promise<Response | ContactMessage> {
  if (request.method !== "POST") return reply(405, "method", "Use the contact form.");
  if (!deps.enabled) return reply(503, "unavailable", "Messages are temporarily unavailable. Please check back later.", {}, 300);
  if (!deps.origins.includes(request.headers.get("origin") ?? "") || request.headers.get("sec-fetch-site") === "cross-site") {
    return reply(403, "origin", "Open the contact page on this website and try again.");
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return reply(415, "format", "Use the contact form.");
  }
  const ip = deps.clientIP(request);
  if (!ip || !isIP(ip)) return reply(503, "unavailable", "Sending is temporarily unavailable. Please try again later.", {}, 300);
  let input: unknown;
  try { input = await readBody(request, deps.bodyTimeoutMs ?? 5000); }
  catch (error) {
    if (error instanceof BodyTimeout) return reply(408, "timeout", "Reading your message timed out. Keep your text and retry this same submission.");
    return error instanceof RangeError ? reply(413, "size", "Your message is too long.")
      : reply(400, "format", "Please reload the form and try again.");
  }
  const validated = validate(input);
  return "id" in validated ? validated as ContactMessage
    : reply(400, "validation", "Please check the highlighted fields.", { errors: validated });
}

export function createContactHandler(deps: ContactDependencies) {
  const digest = (value: string) => createHmac("sha256", deps.secret).update(value).digest("hex");
  const accepted = () => reply(202, "accepted", deps.testMode
    ? "Local preview: mock delivery accepted. No email was sent."
    : "The email service accepted your message. This does not confirm it has arrived or been read.");
  return async (request: Request): Promise<Response> => {
    const message = await parseContactSubmission(request, deps);
    if (message instanceof Response) return message;
    const id = digest("id:" + message.id);
    const fingerprint = digest(JSON.stringify([message.name, message.email, message.message]));
    const ipHash = digest("ip:" + deps.clientIP(request)!.toLowerCase());
    let claim: Claim;
    try { claim = await deps.store.claim(id, fingerprint, ipHash, (deps.now ?? Date.now)()); }
    catch { return reply(503, "unavailable", "Sending is temporarily unavailable. Your message has not been emailed. Try again later.", {}, 300); }
    if (claim.kind === "accepted") return accepted();
    if (claim.kind === "rate") return reply(429, "rate", "Please wait before sending another message.", {}, claim.retryAfter ?? 3600);
    if (claim.kind === "conflict") return reply(409, "conflict", "This submission differs from a previous attempt. Keep a copy; a previous attempt may already have been accepted. Please avoid sending a second copy.");
    if (claim.kind === "pending") return reply(409, "pending", "This message is already being processed. Keep it here and retry shortly.", {}, 60);
    if (claim.kind === "unknown") return reply(409, "unconfirmed", "Delivery could not be confirmed. Your message may already have reached the email service. Please wait before starting a new submission.");
    try { await deps.deliver(message); }
    catch (error) {
      const uncertain = !(error instanceof DeliveryError) || error.uncertain;
      try { await deps.store.finish(id, fingerprint, uncertain ? "unknown" : "failed"); } catch { /* Pending reservation still prevents a duplicate. */ }
      return uncertain
        ? reply(502, "unconfirmed", "Delivery could not be confirmed. Your message may already have reached the email service. Please keep a copy and wait before starting a new submission.")
        : reply(503, "unavailable", "Your message was not accepted by the email service. Your text is still here; try again later.", {}, 300);
    }
    try { await deps.store.finish(id, fingerprint, "accepted"); } catch { /* Never send again to repair bookkeeping. */ }
    return accepted();
  };
}
