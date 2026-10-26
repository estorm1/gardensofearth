import { pageMetadata } from "../site-metadata";
import Image from "next/image";
import Link from "next/link";
import transit from "../../public/images/about/preface-transit.webp";
import corridor from "../../public/images/research/cooling-corridor.webp";
import cover from "../../public/images/research/book-cover.webp";
import SiteHeader from "../site-header";
import BookPromotion from "../book-promotion";
import { audiobookOffers, audiobookPlaybackNote } from "../books/catalog";
import styles from "./about.module.css";

export const metadata = pageMetadata(
  "About | Gardens of Earth",
  "Eric Storm's Gardens of Earth: the origins of Vascular Los Angeles, a connected biourban vision, and a gradual, place-specific path toward living cities worldwide.",
  "/about",
);

const contents = [
  { label: "The vision", href: "#vision" },
  { label: "Los Angeles", href: "#los-angeles" },
  { label: "Worldwide adaptation", href: "#worldwide" },
  { label: "About the author", href: "#author" },
];

const systems = [
  {
    title: "Water & living ground",
    href: "/research#water",
    description:
      "Connect water reuse, treatment, storage, and appropriate recharge with the land that supports them. Remember contamination and preserve flood safety before opening new relationships between water, soil, and people.",
  },
  {
    title: "Terrain & construction",
    href: "/research#living-terrain",
    description:
      "Explore terrain-integrated places with an engineered structural backbone and adaptable surfaces. Reused materials, planted edges, fabrication, inspection, and repair belong in the same design conversation.",
  },
  {
    title: "Movement & access",
    href: "/research#mobility",
    description:
      "Give regional transit, walking, cycling, and local mobility distinct, connected roles. Investigate concepts such as the Metro Hopper without making everyday access depend on an unproven future vehicle.",
  },
  {
    title: "Canopy, habitat & energy",
    href: "/research#canopy",
    description:
      "Design shade, roots, water demand, habitat, food-growing spaces, and energy use together. A greener city needs a credible resource budget and continuing care, not simply a lush rendering.",
  },
  {
    title: "Culture & the right to remain",
    href: "/research#right-to-remain",
    description:
      "Make room for craft, markets, gathering, and community authorship. Public investment should serve the people already there, with housing stability, accessibility, public ownership, and maintenance treated as infrastructure.",
  },
  {
    title: "Gaia & stewardship",
    href: "/ges",
    description:
      "Develop ways to explore proposed environments and make evidence visible through Gaia Earth Simulator. The book's stewardship-accounting ideas, including GOE Coin, concern verified care rather than speculative financial promises.",
  },
];

const regionalResponses = [
  {
    title: "Hot, water-limited places",
    description:
      "Begin with the water budget, heat exposure, soil, and drought conditions. Choose locally suitable planting and dependable shade; do not assume a tropical canopy can be sustained everywhere.",
  },
  {
    title: "Humid & high-rainfall places",
    description:
      "Give drainage, flood storage, ventilation, water quality, and habitat their appropriate roles. More greenery is not a substitute for understanding how water and heat move through a district.",
  },
  {
    title: "Temperate & cold-season places",
    description:
      "Account for seasonal sunlight, winter access, freeze conditions, and changing vegetation. The useful balance between shelter, shade, warmth, and public space will differ from Los Angeles.",
  },
  {
    title: "Coastal, steep & seismic places",
    description:
      "Let coastal change, slopes, geology, groundwater, and structural risks determine what is appropriate. Some places may support restoration; others may require containment, protection, or a different location.",
  },
];

const stages = [
  { title: "Investigate", description: "Understand the place, establish baselines, and agree on responsibilities." },
  { title: "Test", description: "Study materials, water, planting, access, and repair in bounded testbeds." },
  { title: "Demonstrate", description: "Pursue limited pilots with permissions, funded care, and public review." },
  { title: "Connect", description: "Expand or adapt only when evidence and community commitments support it." },
];

export default function AboutPage() {
  return (
    <div className={styles.page} id="top">
      <a className={styles.skipLink} href="#about-content">Skip to About</a>
      <SiteHeader currentPage="About" subtitle="Project & author" />

      <main id="about-content">
        <header className={`${styles.inner} ${styles.introduction}`}>
          <p className={styles.eyebrow}>About the project / Eric Storm</p>
          <h1>Gardens of Earth</h1>
          <p className={styles.subtitle}>Vascular Los Angeles and the Biourban Future</p>
          <p className={styles.lead}>
            An evolving research and design project asking how the places we inhabit could become
            more living, shaded, water-literate, human-centered, and resilient. It begins with
            Los Angeles and looks toward a wider future, shaped by the realities of each place.
          </p>
          <nav className={styles.sectionNav} aria-label="About sections">
            {contents.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
        </header>

        <figure className={`${styles.inner} ${styles.openingImage}`}>
          <Image
            src={transit}
            alt="An imagined neighborhood with a shaded pedestrian street, small electric mobility pods, and an elevated train station woven into planted architecture."
            sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 1100px) calc(100vw - 64px), (max-width: 1256px) calc(100vw - 96px), 1160px"
            loading="eager"
            placeholder="blur"
          />
          <figcaption>
            <strong>A different kind of everyday life.</strong> Concept illustration from the book&apos;s
            preface: an imagined place, not a completed development.
          </figcaption>
        </figure>

        <section id="vision" className={`${styles.inner} ${styles.section}`} aria-labelledby="vision-title">
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>The shared idea</p>
            <h2 id="vision-title">A city designed to support life.</h2>
          </header>
          <div className={styles.prose}>
            <p>
              Gardens of Earth treats a city as a connected life-support system. Buildings, water,
              transport, energy, landscape, and civic life should not be designed as if they have
              nothing to do with one another. The vascular metaphor describes regional arteries
              feeding finer neighborhood connections: the places where people walk, meet, work,
              and receive the services they depend on.
            </p>
            <p>
              This is not a call to abandon technology. It is a proposal to turn technical
              sophistication toward a kinder ground: less danger from fast-moving vehicles,
              more comfortable public space, healthier ecological relationships, and a daily
              life with room for beauty and belonging.
            </p>
          </div>
          <dl className={styles.systems}>
            {systems.map((system) => (
              <div key={system.title}>
                <dt><Link href={system.href}>{system.title}</Link></dt>
                <dd>{system.description}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="los-angeles" className={`${styles.inner} ${styles.section}`} aria-labelledby="la-title">
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>The first research landscape</p>
            <h2 id="la-title">Vascular Los Angeles.</h2>
          </header>
          <div className={styles.illustrated}>
            <div className={styles.prose}>
              <p>
                Los Angeles is the book&apos;s detailed starting point, not a claim of an already
                transformed biourban city. The proposal investigates how its river corridors,
                water networks, transit connections, inhabited terrain, and public spaces could
                become parts of a more coherent, car-light urban landscape.
              </p>
              <p>
                The LA River is a powerful thread through that exploration. Greening a corridor
                must work with flood conveyance, water quality, access, habitat, and the communities
                beside it. Across the basin, dry-season water supply, groundwater, contaminated
                land, fire, earthquakes, and coastal change make the work much more demanding
                than the original image of a forested city.
              </p>
              <p>
                The book therefore proposes a gradual path through research, university testbeds,
                bounded demonstrations, and carefully reviewed expansion. Its 2026-2076 roadmap
                is a planning horizon, not a construction promise. Housing protections, public
                participation, qualified engineering, and funded operation must advance with
                the physical work.
              </p>
              <Link className={styles.textLink} href="/research#pilots">Explore the research and proposed pilots</Link>
            </div>
            <figure className={styles.corridorImage}>
              <Image
                src={corridor}
                alt="A concept illustration of a planted Los Angeles river corridor with shaded paths and transit integrated into the landscape."
                sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 800px) 420px, 380px"
                placeholder="blur"
              />
              <figcaption>
                <strong>Water, shade, and movement together.</strong> A concept study from Chapter 36,
                not an approved river intervention.
              </figcaption>
            </figure>
          </div>
          <ol className={styles.stages} aria-label="A proposed path from research to adoption">
            {stages.map((stage) => (
              <li key={stage.title}><h3>{stage.title}</h3><p>{stage.description}</p></li>
            ))}
          </ol>
        </section>

        <section id="worldwide" className={styles.worldwide} aria-labelledby="worldwide-title">
          <div className={styles.inner}>
            <header className={styles.sectionHeader}>
              <p className={styles.eyebrow}>A worldwide ambition</p>
              <h2 id="worldwide-title">Shared principles. Different landscapes.</h2>
            </header>
            <div className={styles.prose}>
              <p>
                The longer-term ambition is gradual worldwide adoption through local adaptation.
                Share useful methods, tested components, and honest evidence; let each place
                develop its own expression. A living city should grow from its watershed,
                climate, geology, ecology, and existing settlement, not from a universal image
                of tropical greenery.
              </p>
              <p>
                These are directions for future research and collaboration, not an announced
                international rollout. A successful experiment in Los Angeles would not, by itself,
                establish what is safe or appropriate elsewhere.
              </p>
            </div>
            <dl className={styles.regions}>
              {regionalResponses.map((region) => (
                <div key={region.title}><dt>{region.title}</dt><dd>{region.description}</dd></div>
              ))}
            </dl>
            <p className={styles.localAuthorship}>
              Physical adaptation and cultural authorship belong together. Local communities,
              knowledge, institutions, materials, and traditions should shape the result.
              The right to remain and the responsibility to maintain it travel with the idea.
            </p>
          </div>
        </section>

        <section id="author" className={`${styles.inner} ${styles.section}`} aria-labelledby="author-title">
          <header className={styles.sectionHeader}>
            <p className={styles.eyebrow}>About the author</p>
            <h2 id="author-title">Eric Storm</h2>
          </header>
          <div className={styles.authorLayout}>
            <div className={styles.prose}>
              <p className={styles.authorLead}>
                Eric Storm is the creator of Gardens of Earth and the author of
                <em> Vascular Los Angeles and the Biourban Future</em>. His writing and visual
                design explore the relationship between technology, climate-adaptive environments,
                and life at human scale.
              </p>
              <p>
                The project&apos;s origins reach back to his 2012 story, <em>The Gardens of Earth</em>.
                A traveler named Naos returns from an interstellar journey to find an Earth
                rebuilt around forests, inhabited landforms, quiet mobility, and shared planetary
                stewardship. That was fiction, not a forecast, but its central image endured:
                a technically advanced civilization whose surroundings finally reflected its
                commitment to life.
              </p>
              <p>
                Over the years, Storm&apos;s work in this area accumulated through prototypes,
                sketches, technical notes, speculative systems, virtual worlds, transportation
                concepts, carbon-accounting ideas, and climate-adaptation scenarios. The book
                grew when the question changed from what that world might look like to what
                it would actually take to build and care for it.
              </p>
              <p>
                His influences include speculative fiction, including David Brin&apos;s <em>Earth</em>,
                and the long history of people composing land, water, shade, terraces, gardens,
                and civic space into places of shared life. The research also challenged the
                vision: water limits, contamination, displacement, and institutional responsibility
                became central design conditions, not details to resolve after the image.
              </p>
              <div className={styles.authorshipNote}>
                <h3>A human vision, developed with AI.</h3>
                <p>
                  Storm conceived the framework and directed the manuscript&apos;s research and
                  development. ChatGPT and Claude assisted with research, source organization,
                  prose drafting, comparison, and scrutiny of assumptions. The book also uses
                  AI-generated illustrations. Storm remains responsible for its judgments,
                  synthesis, claims, and revisions.
                </p>
              </div>
            </div>
            <aside id="book" className={styles.book} aria-label="The research book" tabIndex={-1}>
              <Image src={cover} alt="Gardens of Earth, Volume I, by Eric Storm." sizes="180px" placeholder="blur" />
              <p className={styles.eyebrow}>The research book</p>
              <h3><Link href="/books">Vascular Los Angeles and the Biourban Future</Link></h3>
              <p>Eric Storm / Volumes I & II</p>
              <p className={styles.bookReadingNote}>
                The books combine imagined experiences of future cities with detailed technical
                discussions of infrastructure, mobility, water systems, architecture, and simulation.
                Some sections are more demanding than general-interest nonfiction and may reward
                slower reading or revisiting alongside the books&apos; illustrations.
              </p>
              <p className={styles.bookReadingNote}>
                The technical sections can also serve as a conceptual reference for serious builders,
                designers, and planners developing ideas of their own. The proposals require
                project-specific engineering and validation.
              </p>
              <p className={styles.bookAvailability}><Link href="/books">Full M4B audiobooks are available for ${audiobookOffers[0].priceUsd} USD per volume. View formats and purchase options.</Link></p>
              <p className={styles.bookAvailability}>{audiobookPlaybackNote}</p>
              <Link className={styles.textLink} href="/research">Read the research synthesis</Link>
            </aside>
          </div>
        </section>

        <section className={styles.future} aria-labelledby="future-title">
          <div className={styles.inner}>
            <p className={styles.eyebrow}>The future this project urges</p>
            <h2 id="future-title">Earth is the first worldship.</h2>
            <div className={styles.prose}>
              <p>
                The preface&apos;s final metaphor brings the work back to Earth: a shared home
                whose water, energy, soil, ecology, and governance deserve deliberate, sustained
                care. The aim is not escape from the planet, but a better way to inhabit it.
              </p>
              <p>
                Gardens of Earth is a research journey and civic design proposal, not a finished
                engineering plan or an adopted government program. It urges a future with safer
                movement, dependable shade, cleaner water, remembered contamination, beautiful
                public life, and communities able to stay and benefit from the places they help renew.
              </p>
            </div>
            <blockquote>
              <p>&ldquo;Perhaps repairing Earth is how it becomes worthy of the stars.&rdquo;</p>
              <cite>Eric Storm / Preface, <em>Gardens of Earth</em></cite>
            </blockquote>
            <div className={styles.relatedLinks}>
              <Link href="/research">Explore the research</Link>
              <Link href="/ges">Gaia Earth Simulator</Link>
              <Link href="/contact">Continue the conversation</Link>
            </div>
          </div>
        </section>
        <BookPromotion />
      </main>

      <footer className={`${styles.inner} ${styles.footer}`}>
        <p>
          Based on the preface, authorship statement, and research framework of
          <em> Gardens of Earth: Vascular Los Angeles and the Biourban Future</em>.
          Worldwide adaptation describes a future ambition, not existing deployments.
        </p>
        <a href="#top">Back to top</a>
      </footer>
    </div>
  );
}
