import { pageMetadata } from "../site-metadata";
import Image from "next/image";
import Link from "next/link";
import livingSystems from "../../public/images/living-systems.png";
import SiteHeader from "../site-header";
import styles from "./ges.module.css";

export const metadata = pageMetadata(
  "Gaia Earth Simulator | Gardens of Earth",
  "Gaia Earth Simulator is in active development: an evolving digital environment for exploring connected living systems and possible urban futures, beginning with Los Angeles and the LA River.",
  "/ges",
);

export default function GesPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#ges-content">Skip to GES</a>
      <SiteHeader currentPage="GES" subtitle="Research & development" />

      <main id="ges-content" className={styles.main}>
        <header className={styles.introduction}>
          <div className={styles.projectLine}>
            <p className={styles.eyebrow}>GES / Gardens of Earth</p>
            <p className={styles.status}>In active development</p>
          </div>
          <h1>Gaia Earth Simulator</h1>
          <p className={styles.lead}>
            An evolving digital environment for exploring how cities and living systems work together.
            The project aims to bring environmental information, spatial models, and possible urban
            futures into a shared place for exploration.
          </p>
        </header>

        <figure className={styles.vision}>
          <Image
            src={livingSystems}
            alt="Conceptual cutaway of an LA River neighborhood, connecting shaded public spaces, transit, planting, and underground water systems."
            sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), (max-width: 1256px) calc(100vw - 96px), 1160px"
            loading="eager"
            placeholder="blur"
          />
          <figcaption>
            <strong>The biourban vision</strong>
            Concept illustration of connected landscape, water, mobility, and public life.
            Not a screenshot of the simulator.
          </figcaption>
        </figure>

        <div>
          <section className={styles.section} aria-labelledby="ges-purpose">
            <div>
              <p className={styles.eyebrow}>The ambition</p>
              <h2 id="ges-purpose">See the city as a living system.</h2>
            </div>
            <div className={styles.prose}>
              <p>
                Water, climate, landscape, movement, and public life do not operate in isolation.
                GES explores how their relationships might become easier to see, discuss, and
                understand within an interactive digital setting.
              </p>
              <p>
                Its longer-term ambition is to support learning, design exploration, and careful
                comparisons between possible futures, including their limits and trade-offs.
                It grows from the research behind Gardens of Earth.
              </p>
            </div>
          </section>

          <section className={styles.section} aria-labelledby="ges-place">
            <div>
              <p className={styles.eyebrow}>The starting place</p>
              <h2 id="ges-place">Beginning with Los Angeles.</h2>
            </div>
            <div className={styles.prose}>
              <p>
                The initial focus is Los Angeles and the LA River. Development is moving toward
                a focused, human-scale environment where different design possibilities can
                be explored in the context of a real place.
              </p>
              <p>
                This local starting point provides a foundation for a broader vision: understanding
                how changes to our built environment might work together, rather than considering
                each intervention on its own.
              </p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.development}`} aria-labelledby="ges-development">
            <div>
              <p className={styles.eyebrow}>Project status</p>
              <h2 id="ges-development">Taking shape, step by step.</h2>
            </div>
            <div className={styles.prose}>
              <p>
                <strong>Gaia Earth Simulator is in active development.</strong> Early prototypes
                and integration work are underway, while the broader simulation and immersive
                experience continue to take shape.
              </p>
              <p>
                GES is not yet a finished public simulator. Its proposed futures are explorations,
                not validated predictions. The project is being built in stages, with scope and
                capabilities evolving as the work progresses.
              </p>
            </div>
          </section>
        </div>

        <section className={styles.connections} aria-labelledby="ges-research">
          <h2 id="ges-research">Part of a larger exploration.</h2>
          <p>
            Discover the research informing GES and the living systems that connect the Gardens of Earth vision.
          </p>
          <div className={styles.relatedLinks}>
            <Link href="/research#gaia">Read the research</Link>
            <Link href="/#ges">Explore Living Systems</Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Gardens of Earth / Gaia Earth Simulator</span>
        <Link href="/contact">Contact</Link>
      </footer>
    </div>
  );
}
