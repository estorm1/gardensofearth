import Image from "next/image";
import Link from "next/link";
import illustration from "../public/images/research/gardens-shared-infrastructure-concept.png";
import { cityMassStory as story } from "./research/city-mass-shared-infrastructure/summary";
import styles from "./city-research-news.module.css";

export default function CityResearchNews() {
  return (
    <section id="city-mass-news" className={styles.section} aria-labelledby="city-mass-news-title">
      <div className={styles.inner}>
        <figure>
          <Image src={illustration} alt={story.imageAlt} sizes="(max-width: 700px) calc(100vw - 40px), 380px" placeholder="blur" />
          <figcaption>AI-generated conceptual illustration.</figcaption>
        </figure>
        <div>
          <p className={styles.eyebrow}>News · Gaia Research · <time dateTime={story.publishedOn}>{story.publishedLabel}</time></p>
          <h2 id="city-mass-news-title"><Link href={story.path}>{story.headline}</Link></h2>
          <p className={styles.description}>{story.description}</p>
          <Link className={styles.readLink} href={story.path}>Read the research analysis</Link>
        </div>
      </div>
    </section>
  );
}
