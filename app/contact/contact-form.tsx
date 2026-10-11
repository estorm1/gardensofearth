"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { contactLimits } from "./limits";
import styles from "./contact.module.css";

type Result = { code: string; message: string; errors?: Record<string, string> };

export default function ContactForm({ enabled, testMode }: { enabled: boolean; testMode: boolean }) {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [retryAt, setRetryAt] = useState(0);
  const submission = useRef<{ id: string; payload: string } | null>(null);
  const status = useRef<HTMLParagraphElement | null>(null);
  const form = useRef<HTMLFormElement | null>(null);
  useEffect(() => { if (result) status.current?.focus(); }, [result]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || sending) return;
    if (Date.now() < retryAt) {
      setResult({ code: "rate", message: "Please wait " + Math.ceil((retryAt - Date.now()) / 1000) + " seconds before trying again." });
      return;
    }
    const fields = new FormData(event.currentTarget);
    const data = { name: fields.get("name"), email: fields.get("email"), message: fields.get("message"), website: fields.get("website") };
    const payload = JSON.stringify(data);
    if (submission.current?.payload !== payload) submission.current = { id: crypto.randomUUID(), payload };
    setSending(true);
    setResult(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, id: submission.current.id }),
        signal: AbortSignal.timeout(50000),
      });
      const result = await response.json() as Result;
      if (!result || typeof result.code !== "string" || typeof result.message !== "string") throw new Error();
      setResult(result);
      const seconds = Number(response.headers.get("retry-after"));
      if (Number.isFinite(seconds) && seconds > 0) setRetryAt(Date.now() + Math.min(seconds, 86400) * 1000);
      if (response.status === 202 && result.code === "accepted") {
        form.current?.reset();
        submission.current = null;
      }
    } catch {
      setResult({
        code: "network",
        message: "We could not confirm the response. Your text is still here. Retry this same submission to check its status; please avoid starting a second copy.",
      });
    } finally { setSending(false); }
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
          <input id="contact-name" name="name" autoComplete="name" required maxLength={contactLimits.name}
            aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "name-error" : undefined} />
          {errors.name && <p id="name-error" className={styles.error}>{errors.name}</p>}
          <label htmlFor="contact-email">Reply email</label>
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={contactLimits.email}
            aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "email-error" : undefined} />
          {errors.email && <p id="email-error" className={styles.error}>{errors.email}</p>}
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={8} required minLength={10} maxLength={contactLimits.message}
            aria-invalid={Boolean(errors.message)} aria-describedby={"message-hint" + (errors.message ? " message-error" : "")} />
          <p id="message-hint" className={styles.hint}>10–5,000 characters. Please avoid sensitive information.</p>
          {errors.message && <p id="message-error" className={styles.error}>{errors.message}</p>}
          <div aria-hidden="true" className={styles.honeypot}>
            <label htmlFor="contact-website">Leave this field empty</label>
            <input id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <button type="submit">{sending ? "Sending…" : "Send message"}</button>
        </fieldset>
        <p ref={status} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className={styles.result}>
          {result?.message ?? ""}
        </p>
        <noscript><p>JavaScript is needed to send this form. No message has been sent.</p></noscript>
      </form>
    </section>
  );
}
