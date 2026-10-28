import Link from "next/link";
import SiteHeader from "../site-header";
import BookPromotion from "../book-promotion";
import CityResearchNews from "../city-research-news";
import { pageMetadata } from "../site-metadata";
import styles from "./news.module.css";

export const metadata = {
  ...pageMetadata(
    "News | Gardens of Earth",
    "News from Gardens of Earth: audiobook release updates and Gaia Research analysis on cities and shared infrastructure.",
    "/news",
  ),
  robots: { index: true, follow: true },
};

export default function NewsPage() {
  return (
    <div className={styles.page} id="top">
      <a className={styles.skipLink} href="#news-content">Skip to news</a>
      <SiteHeader currentPage="News" subtitle="Books & research updates" />
      <main id="news-content" tabIndex={-1}>
        <header className={styles.intro}>
          <h1>News</h1>
          <p>Updates from Gardens of Earth.</p>
        </header>
        <section id="news-stories" aria-label="News stories">
          <BookPromotion announcement />
          <CityResearchNews />
        </section>
      </main>
      <footer className={styles.footer}>
        <Link href="/">Home</Link><Link href="/books">Books and audiobooks</Link><Link href="/research">Explore the research</Link><Link href="/contact">Contact</Link><a href="#top">Back to top</a>
      </footer>
    </div>
  );
}
