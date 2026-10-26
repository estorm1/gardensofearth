import { pageMetadata } from "../site-metadata";
import Link from "next/link";
import SiteHeader from "../site-header";
import { contactAvailability } from "../../lib/contact-config";
import ContactForm from "./contact-form";
import styles from "./contact.module.css";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata("Contact | Gardens of Earth",
  "Contact Eric Storm about Gardens of Earth, research, design, and collaboration.", "/contact");

export default function ContactPage() {
  const availability = contactAvailability();
  return (
    <div className={styles.page}>
      <a href="#contact-content" className={styles.skip}>Skip to Contact</a>
      <SiteHeader currentPage="Contact" subtitle="Continue the conversation" />
      <main id="contact-content" tabIndex={-1} className={styles.content}>
        <header>
          <p className={styles.eyebrow}>Gardens of Earth / Contact</p>
          <h1>Continue the conversation.</h1>
          <p className={styles.lead}>
            Send Eric Storm a note about research, design, <Link className={styles.bookLink} href="/books">the book</Link>, or a possible collaboration.
          </p>
        </header>
        <ContactForm {...availability} />
        <aside className={styles.privacy} aria-labelledby="contact-privacy">
          <h2 id="contact-privacy">Your message</h2>
          <p>
            When sending is available, your name, reply email address, and message are emailed
            to Eric Storm so he can respond. Hosting and email providers process the submission;
            please avoid sensitive personal information.
          </p>
          {!availability.enabled ? <p>
            This form does not subscribe you to a mailing list. Sending is currently unavailable;
            no message can be submitted from this disabled form.
          </p> : availability.usesTickets ? <p>
            This form does not subscribe you to a mailing list. Your browser provides technical
            signals to check for automated submissions, and repeated attempts are limited.
            You can retry the same message for up to 20 hours. The email service retains processing
            records; the website does not keep a separate message database.
          </p> : <p>
            This form does not subscribe you to a mailing list. To limit abuse and duplicate sends,
            the website uses keyed hashes of your IP address and submission, plus sending status,
            for up to 24 hours. Your message text is not stored in that rate-control data.
          </p>}
          <p>Acceptance by the email service does not confirm arrival in the inbox or that a message has been read.</p>
        </aside>
      </main>
    </div>
  );
}
