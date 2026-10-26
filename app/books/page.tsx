import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../site-header";
import AudioPreview from "../audio-preview";
import { bookTitle, chapter9Preview, readingNote, referenceNote } from "../book-copy";
import { pageMetadata } from "../site-metadata";
import volumeI from "../../public/images/books/volume-i.webp";
import volumeII from "../../public/images/books/volume-ii.webp";
import { audiobookBundle, audiobookOffers, audiobookPlaybackNote, printEditions, type AudiobookOffer } from "./catalog";
import styles from "./books.module.css";

export const metadata = {
  ...pageMetadata("Books | Gardens of Earth", "Explore Eric Storm’s Gardens of Earth: Volume I and II full M4B audiobooks at $7 USD each, plus the Chapter 9 preview.", "/books"),
  robots: { index: true, follow: true },
};

const volumes = [
  { name: "Volume I", image: volumeI, title: "The ground beneath the vision", description: "Water, infrastructure, contamination, inhabited terrain, and the work of learning to build and care. The first volume develops the physical and technical questions behind Vascular Los Angeles, connecting imagined city life with the systems that would have to support it." },
  { name: "Volume II", image: volumeII, title: "Movement, public life, and the path to proof", description: "Mobility, heat, canopy, culture, financing, public power, and the right to remain. The second volume connects the city’s daily experience with stewardship, proposed pilots, and a gradual roadmap governed by evidence and the ability to maintain what is built." },
];

function AudiobookPurchase({ offer }: { offer: AudiobookOffer }) {
  const statusId = `${offer.id}-availability`;
  const formatId = `${offer.id}-playback`;
  return (
    <div className={styles.offer}>
      <h3>Full M4B audiobook</h3>
      <p className={styles.price}>${offer.priceUsd} <span>USD</span></p>
      <p id={formatId}>{audiobookPlaybackNote}</p>
      {offer.available ? (
        <a className={styles.purchaseButton} href={offer.checkoutUrl} aria-describedby={`${formatId} ${statusId}`}>Buy {offer.volume} audiobook</a>
      ) : (
        <button className={styles.purchaseButton} type="button" disabled
          aria-label={`${offer.volume} audiobook purchase unavailable`} aria-describedby={`${formatId} ${statusId}`}>
          Purchase unavailable
        </button>
      )}
      <p id={statusId} className={styles.offerStatus}>
        {offer.available ? "Continue to Payhip to purchase this audiobook." : "Not available for purchase yet."}
      </p>
    </div>
  );
}

export default function BooksPage() {
  return (
    <div className={styles.page} id="top" tabIndex={-1}>
      <a className={styles.skipLink} href="#books-content">Skip to Books</a>
      <SiteHeader currentPage="Books" subtitle="Books & audio" />
      <main id="books-content" className={styles.inner} tabIndex={-1}>
        <header className={styles.intro}>
          <p className={styles.eyebrow}>The books · Eric Storm</p>
          <h1>Gardens of Earth</h1>
          <p className={styles.subtitle}>{bookTitle}</p>
          <p className={styles.lead}>A two-volume exploration of how a city could become a connected life-support system: shaded, water-literate, human-centered, and cared for over time.</p>
          <nav className={styles.sectionNav} aria-label="Books sections">
            <a href="#volumes">Explore the volumes</a><a href="#reading">For readers and builders</a><a href="#audio">Listen to a preview</a><a href="#bundle">Audiobook bundle</a>
          </nav>
        </header>
        <section id="volumes" className={styles.volumes} aria-label="The two volumes">
          {volumes.map((volume, index) => {
            const offer = audiobookOffers[index];
            const print = printEditions[offer.id];
            return (
              <article className={styles.volume} key={offer.id} aria-labelledby={`${offer.id}-title`}>
                <Image src={volume.image} alt={`Gardens of Earth, ${volume.name}, by Eric Storm.`}
                  sizes="(max-width: 640px) 180px, (max-width: 1100px) 200px, 180px" placeholder="blur" />
                <div>
                  <p className={styles.eyebrow}>{volume.name}</p>
                  <h2 id={`${offer.id}-title`}>{volume.title}</h2>
                  <p>{volume.description}</p>
                  <AudiobookPurchase offer={offer} />
                  <div className={styles.printEdition}>
                    <h3>Print edition</h3>
                    <p className={styles.printStatus}>{print.label}</p>
                    {offer.id === "volume-i" ? <p className={styles.offerStatus}>A purchase link will be added when the Amazon listing is live.</p> : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
        <section id="bundle" className={styles.bundle} aria-labelledby="bundle-title">
          <div>
            <p className={styles.eyebrow}>Both volumes</p>
            <h2 id="bundle-title">The two-volume audiobook bundle</h2>
            <p>Both audiobooks together. The bundle is in preparation and is not available for purchase yet.</p>
          </div>
          <div className={styles.bundleAction}>
            <p className={styles.price}>${audiobookBundle.priceUsd} <span>USD</span></p>
            <button className={styles.purchaseButton} type="button" disabled
              aria-label="Two-volume audiobook bundle purchase unavailable" aria-describedby="bundle-availability">Bundle unavailable</button>
            <p id="bundle-availability" className={styles.offerStatus}>In preparation</p>
          </div>
        </section>
        <section id="reading" className={styles.reading} aria-labelledby="reading-title">
          <p className={styles.eyebrow}>For readers and builders</p>
          <h2 id="reading-title">A vision to explore. A reference to return to.</h2>
          <div className={styles.prose}><p>{readingNote}</p><p>{referenceNote}</p><p>Eric Storm conceived the framework and directed the manuscript’s research and development. AI assisted with research, drafting, and illustrations. The audiobook uses AI narration. The illustrations are concept studies; they depict proposed environments rather than completed projects.</p></div>
          <div className={styles.links}><Link href="/research">Explore the research synthesis</Link><Link href="/about#author">About Eric Storm and the project</Link></div>
        </section>
        <section id="audio" className={styles.audioSection} aria-labelledby="audio-title">
          <p className={styles.eyebrow}>Hear the ideas</p><h2 id="audio-title">A Boat on the River</h2>
          <p className={styles.prose}>Listen to a short excerpt from Volume I, Chapter 9. Load the controls when you are ready; nothing plays automatically.</p>
          <div className={styles.samples}><article><AudioPreview sample={chapter9Preview} /></article></div>
        </section>
      </main>
      <footer className={`${styles.inner} ${styles.footer}`}><Link href="/">Gardens of Earth</Link><Link href="/research">Research</Link><Link href="/about">About</Link><Link href="/contact">Contact</Link><a href="#top">Back to top</a></footer>
    </div>
  );
}
