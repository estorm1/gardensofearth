import "server-only";
import nodemailer, { type SendMailOptions } from "nodemailer";
import { DeliveryError, type ContactMessage } from "./contact-handler.ts";

export type SmtpConfig = { host: string; port: number; user: string; password: string; from: string; to: string };
type Send = (mail: SendMailOptions) => Promise<{ accepted: unknown[] }>;

export function smtpOptions(config: SmtpConfig) {
  return {
    host: config.host, port: config.port, secure: config.port === 465, requireTLS: true,
    auth: { user: config.user, pass: config.password },
    tls: { rejectUnauthorized: true, minVersion: "TLSv1.2" as const },
    connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000, dnsTimeout: 5000,
    disableFileAccess: true, disableUrlAccess: true, logger: false, debug: false,
  };
}

export function contactMail(config: SmtpConfig, message: ContactMessage): SendMailOptions {
  return {
    from: { name: "Gardens of Earth", address: config.from },
    to: { address: config.to, name: "" },
    replyTo: { address: message.email, name: "" },
    envelope: { from: config.from, to: [config.to] },
    subject: "Gardens of Earth website message",
    text: "Name: " + message.name + "\nReply address: " + message.email + "\n\n" + message.message,
    messageId: "<contact-" + message.id + "@gardensofearth.com>",
    disableFileAccess: true, disableUrlAccess: true,
  };
}

export function createSmtpDelivery(config: SmtpConfig, send?: Send) {
  return async (message: ContactMessage) => {
    const transport = send ? null : nodemailer.createTransport(smtpOptions(config));
    try {
      const result = await (send ?? ((mail) => transport!.sendMail(mail)))(contactMail(config, message));
      const accepted = result.accepted.some((recipient) =>
        (typeof recipient === "string" ? recipient : (recipient as { address?: string })?.address)?.toLowerCase() === config.to.toLowerCase());
      if (!accepted) throw new DeliveryError(false);
    } catch (error) {
      if (error instanceof DeliveryError) throw error;
      const detail = error as { responseCode?: number; command?: string };
      const rejected = Number(detail?.responseCode) >= 400 ||
        ["CONN", "AUTH", "MAIL FROM", "RCPT TO"].includes(detail?.command ?? "");
      // Timeouts after DATA can occur after acceptance. Never promise non-delivery in that case.
      throw new DeliveryError(!rejected);
    } finally { transport?.close(); }
  };
}
