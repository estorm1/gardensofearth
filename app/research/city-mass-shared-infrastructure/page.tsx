import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import SiteHeader from "../../site-header";
import { pageMetadata, siteUrl } from "../../site-metadata";
import illustration from "../../../public/images/research/gardens-shared-infrastructure-concept.png";
import { cityMassStory as story } from "./summary";
import { cityMassArticle as article } from "./article";
import styles from "./article.module.css";

const articleUrl = `${siteUrl}${story.path}`;
const image = { url: story.imagePath, width: illustration.width, height: illustration.height, alt: story.imageAlt };

export const metadata: Metadata = {
  ...pageMetadata(story.title, story.description, story.path),
  authors: [{ name: story.author, url: `${siteUrl}${story.authorPath}` }],
  robots: { index: true, follow: true },
  openGraph: {
    title: story.title, description: story.description, url: story.path,
    siteName: "Gardens of Earth", locale: "en_US", type: "article",
    publishedTime: story.publishedOn, authors: [`${siteUrl}${story.authorPath}`], images: [image],
  },
  twitter: { card: "summary_large_image", title: story.title, description: story.description, images: [image] },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article", "@id": `${articleUrl}#article`,
      headline: story.headline, description: story.description, mainEntityOfPage: articleUrl,
      image: `${siteUrl}${story.imagePath}`, datePublished: story.publishedOn,
      author: { "@type": "Person", name: story.author, url: `${siteUrl}${story.authorPath}` },
      articleSection: "Gaia Research",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Research", item: `${siteUrl}/research` },
        { "@type": "ListItem", position: 3, name: "City mass and shared infrastructure", item: articleUrl },
      ],
    },
  ],
};

function Paragraph({ text }: { text: string }) {
  return <p>{text.split(/(\[1\])/).map((part, index) => part === "[1]" ? <a key={index} href="#source-1" aria-label="Source 1: study in Nature Cities">[1]</a> : part)}</p>;
}

export default function CityMassArticlePage() {
  return (
    <div className={styles.page} id="top">
      <a className={styles.skipLink} href="#article-content">Skip to article</a>
      <SiteHeader subtitle="Gaia Research · News and analysis" />
      <main className={styles.main} id="article-content" tabIndex={-1}>
        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <ol><li><Link href="/">Home</Link></li><li><Link href="/research">Research</Link></li><li aria-current="page">City mass and shared infrastructure</li></ol>
        </nav>
        <article aria-labelledby="article-title">
          <header className={styles.intro}>
            <p className={styles.eyebrow}>{story.credit}</p>
            <h1 id="article-title">{story.headline}</h1>
            <p className={styles.byline}>By <Link href={story.authorPath}>{story.author}</Link> · Published <time dateTime={story.publishedOn}>{story.publishedLabel}</time></p>
            <p className={styles.lead}>{article.intro[0]}</p>
          </header>
          <figure className={styles.hero}>
            <Image src={illustration} alt={story.imageAlt} sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 1160px) calc(100vw - 80px), 1080px" preload placeholder="blur" />
            <figcaption><strong>AI-generated conceptual illustration.</strong> {story.imageCaption}</figcaption>
          </figure>
          <div className={styles.prose}>
            <Paragraph text={article.intro[1]} />
            {article.sections.map((section) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-heading`}>
                <h2 id={`${section.id}-heading`}>{section.heading}</h2>
                {section.paragraphs.map((text, index) => <Paragraph key={index} text={text} />)}
                {section.heading === "Evidence and sources" ? <ol className={styles.sources}>{article.sources.map((source) => <li key={source.id} id={source.id}><a href={source.href}>{source.text}</a></li>)}</ol> : null}
              </section>
            ))}
            <p className={styles.note}>Research and analysis developed with AI assistance.</p>
            <nav className={styles.related} aria-label="Related research"><Link href="/research#living-terrain">Explore living terrain</Link><Link href="/research#pilots">Evidence and proposed pilots</Link><Link href="/ges">Gaia Earth Simulator</Link></nav>
          </div>
        </article>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      </main>
      <footer className={styles.footer}><Link href="/news">Back to news</Link><Link href="/books">Books and audiobooks</Link><Link href="/contact">Contact</Link><a href="#top">Back to top</a></footer>
    </div>
  );
}
