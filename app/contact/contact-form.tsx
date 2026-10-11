"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactLimits } from "./limits";
import styles from "./contact.module.css";
import { initializeContactProtection } from "./bot-protection";

type Result = { code: string; message: string; errors?: Record<string, string> };

export default function ContactForm({ enabled, testMode, usesTickets }: { enabled: boolean; testMode: boolean; usesTickets: boolean }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const [uncertain, setUncertain] = useState(false);
  const inFlight = useRef(false);
  const submission = useRef<{ id: string; payload: string; ticket?: string; expiresAt?: number; uncertain: boolean } | null>(null);
  const status = useRef<HTMLParagraphElement | null>(null);
  const form = useRef<HTMLFormElement | null>(null);
  useEffect(() => { if (result) status.current?.focus(); }, [result]);
  useEffect(() => {
    if (enabled && usesTickets && !testMode) void initializeContactProtection().catch(() => {
      // The server still refuses a missing/failed browser check; no sending fallback.
    });
  }, [enabled, testMode, usesTickets]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || inFlight.current) return;
    if (Date.now() < retryAt) {
      setResult({ code: "rate", message: "Please wait " + Math.ceil((retryAt - Date.now()) / 1000) + " seconds before trying again." });
      return;
    }
    const fields = new FormData(event.currentTarget);
    const data = { name: fields.get("name"), email: fields.get("email"), message: fields.get("message"), website: fields.get("website") };
    const payload = JSON.stringify(data);
    if (submission.current?.uncertain && submission.current.payload !== payload) {
      setResult({ code: "conflict", message: "Keep the original submission unchanged while its result is uncertain. A previous attempt may already have been accepted." });
      return;
    }
    if (submission.current?.expiresAt && Date.now() >= submission.current.expiresAt) {
      setResult({ code: "expired", message: "This submission can no longer be retried safely. Keep a copy of your text; a previous attempt may have been accepted. Please avoid sending a second copy." });
      setUncertain(true);
      return;
    }
    inFlight.current = true;
    setSending(true);
    setResult(null);
    let attempted = false;
    try {
      if (submission.current?.payload !== payload) {
        if (usesTickets) {
          const response = await fetch("/api/contact", {
            headers: { "X-Contact-Form": "1" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(8000),
          });
          const ticket = await response.json() as { id: string; ticket: string; expiresAt: number };
          if (!response.ok || typeof ticket.id !== "string" || typeof ticket.ticket !== "string" ||
              !Number.isFinite(ticket.expiresAt) || ticket.expiresAt <= Date.now()) throw new Error();
          submission.current = { ...ticket, payload, uncertain: false };
        } else submission.current = { id: crypto.randomUUID(), payload, uncertain: false };
      }
      attempted = true;
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: submission.current.id, ticket: submission.current.ticket }),
        redirect: "error", cache: "no-store",
        signal: AbortSignal.timeout(50000),
      });
      const result = await response.json() as Result;
      if (!result || typeof result.code !== "string" || typeof result.message !== "string") throw new Error();
      if (["pending", "unconfirmed", "conflict", "expired"].includes(result.code)) {
        submission.current.uncertain = true;
        setUncertain(true);
      }
      setResult(result);
      const seconds = Number(response.headers.get("retry-after"));
      if (Number.isFinite(seconds) && seconds > 0) setRetryAt(Date.now() + Math.min(seconds, 86400) * 1000);
      if (response.status === 202 && result.code === "accepted") {
        form.current?.reset();
        submission.current = null;
        setUncertain(false);
        setRetryAt(0);
      }
    } catch {
      if (attempted && submission.current) {
        submission.current.uncertain = true;
        setUncertain(true);
      }
      setResult({
        code: attempted ? "network" : "unavailable",
        message: attempted ? "We could not confirm the response. Your text is still here. Retry this same submission to check its status; please avoid starting a second copy."
          : "Sending could not be prepared. Your text is still here; try again later. No new submission was sent.",
      });
    } finally { inFlight.current = false; setSending(false); }
  }

  const errors = result?.errors ?? {};
  return (
    <section className={styles.formSection} aria-labelledby="form-title">
      <h2 id="form-title">Send a message</h2>
      {!enabled && <p role="status" className={styles.notice}>Messages are temporarily unavailable. Please check back later.</p>}
      {testMode && <p className={styles.notice}>Local preview: delivery is mocked. No email will be sent.</p>}
      <form ref={form} onSubmit={submit} aria-describedby="contact-privacy">
        <fieldset disabled={!enabled || sending}>
          <legend className={styles.srOnly}>Your contact details and message</legend>
          <label htmlFor="contact-name">Name</label>
          <input id="contact-name" name="name" autoComplete="name" required maxLength={contactLimits.name} readOnly={uncertain}
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
          <label htmlFor="contact-email">Reply email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={contactLimits.email} readOnly={uncertain}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <p id="email-error" className={styles.error}>{errors.email}</p>}
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={8} required minLength={10} maxLength={contactLimits.message} readOnly={uncertain}
            aria-invalid={Boolean(errors.message)} aria-describedby={"message-hint" + (errors.message ? " message-error" : "")} />
          <p id="message-hint" className={styles.hint}>10–5,000 characters. Please avoid sensitive information.</p>
          {errors.message && <p id="message-error" className={styles.error}>{errors.message}</p>}
          <div aria-hidden="true" className={styles.honeypot}>
            <label htmlFor="contact-website">Leave this field empty</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <button type="submit" disabled={result?.code === "expired" || result?.code === "conflict"}>
            {sending ? "Sending…" : uncertain ? "Retry same message" : "Send message"}
          </button>
        </fieldset>
        <p ref={status} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className={styles.result}>
          {result?.message ?? ""}
        </p>
        <noscript><p>JavaScript is needed to send this form. No message has been sent.</p></noscript>
      </form>
    </section>
  );
}
