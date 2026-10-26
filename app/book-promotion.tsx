import Image from "next/image";
import Link from "next/link";
import cover from "../public/images/research/book-cover.webp";
import AudioPreview from "./audio-preview";
import { bookTitle, chapter9Preview } from "./book-copy";
import styles from "./book-promotion.module.css";

export default function BookPromotion({ announcement = false }: { announcement?: boolean }) {
  return (
    <section id={announcement ? "audiobook-release" : "book-preview"} className={styles.section} aria-labelledby={announcement ? "release-title" : "book-preview-title"}>
      <div className={styles.inner}>
        <Image className={styles.cover} src={cover} alt="Gardens of Earth, Volume I, by Eric Storm." sizes="(max-width: 640px) 140px, 200px" placeholder="blur" />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{announcement ? "News · Audiobooks" : "From the books · Eric Storm"}</p>
          <h2 id={announcement ? "release-title" : "book-preview-title"}>{announcement ? "The Gardens of Earth audiobooks are available." : "Imagine the city. Explore what it would take."}</h2>
          <p className={styles.subtitle}>Gardens of Earth: {bookTitle}</p>
          <p>{announcement ? "Eric Storm’s two-volume exploration of living cities is available as AI-narrated audiobooks. Listen to a short excerpt from Chapter 9: a quiet boat journey, followed by the practical questions behind its water landscape." : "Across two volumes, imagined everyday life meets a detailed exploration of water, infrastructure, mobility, architecture, and civic care. Explore the volumes, hear a short preview, or choose an audiobook."}</p>
          <p className={styles.availability}>Volume I and Volume II audiobooks are available for $7 USD each on Payhip.</p>
          <div className={styles.links}>
            <Link href="/books">Explore books and audiobooks</Link>
            <Link href="/about#book">About the books and author</Link>
            <Link href="/research">Explore the research</Link>
          </div>
          <AudioPreview sample={chapter9Preview} />
        </div>
      </div>
    </section>
  );
}
