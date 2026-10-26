import Image from "next/image";
import Link from "next/link";
import cover from "../public/images/research/book-cover.webp";
import AudioPreview from "./audio-preview";
import { bookTitle, chapter9Preview } from "./book-copy";
import { audiobookOffers, audiobookPlaybackNote } from "./books/catalog";
import styles from "./book-promotion.module.css";

export default function BookPromotion({ announcement = false }: { announcement?: boolean }) {
  return (
    <section id={announcement ? "audiobook-release" : "book-preview"} className={styles.section} aria-labelledby={announcement ? "release-title" : "book-preview-title"}>
      <div className={styles.inner}>
        <Image className={styles.cover} src={cover} alt="Gardens of Earth, Volume I, by Eric Storm." sizes="(max-width: 640px) 140px, 200px" placeholder="blur" />
        <div className={styles.copy}>
          <p className={styles.eyebrow}>{announcement ? <>News · <Link href="/books">Audiobooks</Link></> : "From the books · Eric Storm"}</p>
          <h2 id={announcement ? "release-title" : "book-preview-title"}>{announcement ? <Link href="/books">The Gardens of Earth audiobooks are available.</Link> : "Imagine the city. Explore what it would take."}</h2>
          <p className={styles.subtitle}><Link href="/books">Gardens of Earth: {bookTitle}</Link></p>
          <p>{announcement ? <>Eric Storm’s two-volume exploration of living cities is available as <Link href="/books">AI-narrated audiobooks</Link>. Listen to a short excerpt from Chapter 9: a quiet boat journey, followed by the practical questions behind its water landscape.</> : <>Across two volumes, imagined everyday life meets a detailed exploration of water, infrastructure, mobility, architecture, and civic care. Explore the volumes, hear a short preview, or choose an <Link href="/books">audiobook</Link>.</>}</p>
          <p className={styles.availability}><Link href="/books">Volume I and Volume II full M4B audiobooks are available for ${audiobookOffers[0].priceUsd} USD each.</Link></p>
          <p className={styles.availability}>{audiobookPlaybackNote}</p>
          <div className={styles.links}>
            <Link href="/books">Explore books and audiobooks</Link>
            <Link href="/about#author">About Eric Storm</Link>
            <Link href="/research">Explore the research</Link>
          </div>
          <AudioPreview sample={chapter9Preview} linkToBooks />
        </div>
      </div>
    </section>
  );
}
