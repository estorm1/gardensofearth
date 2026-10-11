import { pageMetadata } from "../site-metadata";
import Image, { type StaticImageData } from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import SiteHeader from "../site-header";
import BookPromotion from "../book-promotion";
import city from "../../public/images/research/vascular-city.webp";
import fabrication from "../../public/images/research/robotic-fabrication.webp";
import rail from "../../public/images/research/rail-access.webp";
import boat from "../../public/images/research/modular-boat.webp";
import cooling from "../../public/images/research/cooling-corridor.webp";
import craft from "../../public/images/research/engawa-craft.webp";
import street from "../../public/images/research/civic-street.webp";
import village from "../../public/images/research/pacific-village.webp";
import lab from "../../public/images/research/university-living-lab.webp";
import corridor from "../../public/images/research/hawthorne-gardena.webp";
import cover from "../../public/images/research/book-cover.webp";
import styles from "./research.module.css";

export const metadata = pageMetadata(
  "Research | Gardens of Earth",
  "A synthesis of Eric Storm's Vascular Los Angeles and the Biourban Future: water, living terrain, mobility, canopy, civic life, and an evidence-led path to pilots.",
  "/research",
);

const contents = [
  { id: "vascular-city", title: "The vascular city" },
  { id: "water", title: "Water & the ground below" },
  { id: "living-terrain", title: "Living terrain" },
  { id: "mobility", title: "A mobility matrix" },
  { id: "canopy", title: "Canopy & cooling" },
  { id: "civic-life", title: "Craft & civic worlds" },
  { id: "right-to-remain", title: "The right to remain" },
  { id: "gaia", title: "The digital thread & Gaia" },
  { id: "living-labs", title: "Living laboratories" },
  { id: "pilots", title: "Pilots & the roadmap" },
];

const pilots = [
  {
    name: "Hawthorne-Gardena",
    subject: "A cleanable treatment edge",
    question:
      "Can a compact, lined treatment cell remove selected pollutants while crews can safely clear sediment, exchange media, inspect connections, and keep a useful public route open?",
  },
  {
    name: "Lower LA River & Gateway Cities",
    subject: "Public life beside flood infrastructure",
    question:
      "Can a landside combination of shade, habitat, access, and bounded runoff treatment improve daily use while protecting flood conveyance, emergency access, and inspection routes?",
  },
  {
    name: "Ballona",
    subject: "Controlled freshwater emergence",
    question:
      "Can a permitted, carefully monitored sub-cell clarify the relationship between shallow groundwater, surface water, habitat, and neighboring exposure? Conservation responsibilities and the actual review process would govern any trial.",
  },
  {
    name: "Montebello & Rio Hondo",
    subject: "Inland groundwater response",
    question:
      "Would an authorized change in recharge timing or volume produce a distinguishable hydraulic-head response? The goal is better evidence for groundwater models, not a presumption that one local result proves basin-wide protection.",
  },
  {
    name: "Dominguez",
    subject: "A kidney corridor",
    question:
      "Which treatment, containment, air-monitoring, and response arrangements can address a selected industrial-water reach without exposing neighbors or confusing a cleaner-looking channel with a safe one?",
  },
  {
    name: "Hydroseismic demonstration block",
    subject: "A controlled laboratory experiment",
    question:
      "How do compartmentalized water, baffles, and a conventional structural frame behave together under defined loading? Comparisons with a dry configuration would test the mechanism; they would not establish district-scale earthquake protection.",
  },
];

function Contents() {
  return (
    <ol className={styles.contentsList}>
      {contents.map((item, index) => (
        <li key={item.id}>
          <a href={`#${item.id}`}>
            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            {item.title}
          </a>
        </li>
      ))}
    </ol>
  );
}

function ResearchSection({
  id,
  category,
  title,
  reference,
  children,
}: {
  id: string;
  category: string;
  title: string;
  reference: string;
  children: ReactNode;
}) {
  const number = contents.findIndex((item) => item.id === id) + 1;
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>
          <span className={styles.sectionNumber}>{String(number).padStart(2, "0")}</span>
          {category}
        </p>
        <h2 id={`${id}-title`}>{title}</h2>
      </header>
      {children}
      <p className={styles.reference}><span>Book references</span> {reference}</p>
    </section>
  );
}

function Illustration({
  src,
  alt,
  label,
  caption,
  eager = false,
}: {
  src: StaticImageData;
  alt: string;
  label: string;
  caption: string;
  eager?: boolean;
}) {
  return (
    <figure className={styles.figure}>
      <a href={src.src} target="_blank" rel="noopener noreferrer" aria-label={`Open illustration: ${label}`}>
        <Image
          src={src}
          alt={alt}
          sizes="(max-width: 520px) calc(100vw - 40px), (max-width: 1100px) 480px, 440px"
          loading={eager ? "eager" : "lazy"}
          placeholder="blur"
        />
      </a>
      <figcaption><strong>{label}</strong>{caption}</figcaption>
    </figure>
  );
}

export default function ResearchPage() {
  return (
    <div className={styles.page} id="top">
      <a className={styles.skipLink} href="#research-content">Skip to research</a>
      <SiteHeader currentPage="Research" subtitle="Research & design" />

      <main id="research-content" className={styles.main}>
        <header className={styles.introduction}>
          <p className={styles.eyebrow}>The research book / Eric Storm</p>
          <h1>Research</h1>
          <p className={styles.bookTitle}>Vascular Los Angeles and the Biourban Future</p>
          <p className={styles.introText}>
            What would it take to turn a city of hard surfaces and disconnected systems into a living landscape?
            Gardens of Earth explores a Los Angeles where water, terrain, movement, canopy, and civic life
            are designed together. The ambition is a biourban future. The starting point is a set of questions
            we can investigate, build, measure, and revise.
          </p>
          <div className={styles.themeLinks}>
            <a href="#water">Water & ground</a>
            <a href="#mobility">Movement & canopy</a>
            <a href="#living-labs">Evidence & pilots</a>
          </div>
        </header>

        <details className={styles.mobileContents}>
          <summary>Research index</summary>
          <nav aria-label="Research sections"><Contents /></nav>
        </details>

        <div className={styles.readingLayout}>
          <aside className={styles.sidebar}>
            <nav aria-label="Research sections">
              <p className={styles.sidebarLabel}>In this research</p>
              <Contents />
              <a className={styles.sidebarReturn} href="#top">Back to the beginning</a>
            </nav>
          </aside>

          <article className={styles.article} aria-label="Research synthesis">
            <ResearchSection id="vascular-city" category="The organizing idea" title="A city that works as a living system." reference="Chapters 3-5: managed gradients, capillary urbanism, and Vascular Los Angeles.">
              <div className={styles.illustrated}>
                <div className={styles.prose}>
                  <p className={styles.lead}>
                    The book does not begin with a new architectural style. It begins with the relationships
                    between the systems a city depends on.
                  </p>
                  <p>
                    Its vascular metaphor gives those relationships an anatomy: a structural skeleton;
                    transport and water arteries; neighborhood-scale capillaries; treatment organs;
                    a cooling canopy; and a nervous system for observation and coordination.
                    The point is integration, not a claim that a city behaves exactly like a body.
                  </p>
                  <p>
                    Large regional networks would serve finer-grained places where people walk, meet,
                    work, and receive services. Rail carries the regional journey. Small pathways and
                    local distribution systems complete it. Water infrastructure supports a canopy;
                    the canopy makes those everyday journeys more comfortable.
                  </p>
                  <p>
                    The design task is to manage boundaries: fresh and saline water, hot and cool spaces,
                    surface and subsurface systems, clean and contaminated ground, public and private
                    space, and floodable and protected land. Each boundary needs an operating rule,
                    not just an attractive rendering.
                  </p>
                </div>
                <Illustration src={city} eager alt="Imagined Los Angeles with planted terraces, canals, footbridges, elevated rail, and small vehicles beneath the downtown skyline." label="Capillary urbanism / Chapter 4" caption="A concept illustration of regional infrastructure meeting neighborhood-scale public life." />
              </div>
            </ResearchSection>

            <ResearchSection id="water" category="The hydrological foundation" title="Let water circulate. Know what lies beneath." reference="Chapters 6-15: recycled water, aquifer barriers, controlled emergence, and contamination containment.">
              <div className={styles.prose}>
                <p>
                  Vascular Los Angeles proposes a coordinated water system rather than a collection
                  of isolated canals. Advanced purification, approved reuse, stormwater capture,
                  groundwater replenishment, and coastal freshwater barriers would serve different
                  roles within a reconciled water budget. The book uses Pure Water Los Angeles /
                  Operation NEXT as a planning foundation, not as a supply already committed to this vision.
                </p>
                <p>
                  The aquifers form a second, largely invisible city. Managing them requires attention
                  to hydraulic head, saline intrusion, pumping, shallow groundwater, and the possibility
                  that added water can mobilize buried contamination. A greener surface does not
                  erase an industrial history underground.
                </p>
                <p>
                  Different reaches therefore need different designs. Clean, suitable ground may allow
                  recharge or carefully managed emergence. Contaminated reaches may require lined,
                  underdrained treatment, sealed conveyance, or continued exclusion. A sealed civic
                  water feature is not a restored wetland, and a bypass is not remediation.
                </p>
              </div>
              <div className={styles.researchNote}>
                <h3>The question before the landscape</h3>
                <p>Where can water safely enter the ground, where must it remain contained, and who is responsible when conditions change? Site investigation, water-quality permissions, flood compatibility, monitoring, and a funded response come before public contact or recharge.</p>
              </div>
            </ResearchSection>

            <ResearchSection id="living-terrain" category="Artificial urban geology" title="Build the spine. Adapt the skin." reference="Chapters 16-26: artificial geology, the Spine/Skin Doctrine, robotic construction, and the canal-edge pilot.">
              <div className={styles.illustrated}>
                <div className={styles.prose}>
                  <p>
                    The artificial lithosphere is the book&apos;s proposal for useful, shaped ground:
                    terraces, retaining structures, planted edges, service galleries, and public routes
                    that accommodate water, roots, people, and maintenance together.
                    Rocklike form matters when it performs a real task, not merely when it resembles geology.
                  </p>
                  <p>
                    The Spine/Skin Doctrine assigns life-safety duties to a conventional, engineered
                    backbone. Gravity loads, seismic resistance, major water containment, emergency
                    routes, and inspection access cannot depend on an unqualified experimental surface.
                  </p>
                  <p>
                    The adaptive skin is where carefully bounded experimentation belongs:
                    replaceable facings, planter assemblies, filter housings, low-pressure channels,
                    sensor cavities, and civic textures. Robotic fabrication may help make complex
                    forms, but a printer does not remove the need for reinforcement, curing,
                    inspection, or proof of performance.
                  </p>
                  <p>
                    Even a nonstructural panel carries weight and needs reliable attachments.
                    Saturated soil, root growth, drainage, fire exposure, and seismic movement have
                    to be tested at their interfaces. The hydroseismic idea of using contained water
                    to influence structural response remains a research question, not demonstrated
                    protection for an inhabited district.
                  </p>
                </div>
                <Illustration src={fabrication} alt="Robotic fabrication equipment works along a rocklike terraced facade, with balconies and plants overlooking a city." label="Robotic construction / Chapter 19" caption="A concept study of fabrication at the building edge. The image does not establish a qualified structural system." />
              </div>
            </ResearchSection>

            <ResearchSection id="mobility" category="Regional arteries, local capillaries" title="A mobility matrix for a human-scale city." reference="Chapters 29-33: the transportation matrix, rail spine, moat-and-boat corridors, aerial access, and Metro Hopper.">
              <div className={styles.prose}>
                <p>
                  The transportation proposal gives different modes different jobs. High-capacity rail
                  provides the regional spine. Walking, cycling, accessible local routes, and small
                  passenger or service vehicles complete neighborhood trips. The aim is less land
                  consumed by traffic and parking, with more space for useful public life.
                </p>
                <p>
                  Boats belong only in reaches where water quality, depth, flood operations, landings,
                  demand, and maintenance make them feasible. The Metro Hopper explores a modular
                  passenger cabin and different transport attachments. Aerial access and advanced
                  guideways remain proposals with unresolved engineering, approval, cost, and operating questions.
                </p>
                <p>
                  The most important test is the whole journey: transfers, waiting, accessible lifts,
                  freight, emergency response, and service during outages. Road space should change
                  through evidence-led transitions with usable alternatives, not through a promise
                  that a future vehicle will solve every trip.
                </p>
              </div>
              <div className={styles.imagePair}>
                <Illustration src={rail} alt="A planted path between rocklike apartment facades leads to a glass elevator and elevated train platform." label="Rail access / Chapter 30" caption="The local connection matters as much as the regional network: paths, levels, and the transfer between them." />
                <Illustration src={boat} alt="A four-rotor aircraft hovers above a passenger boat in an imagined canal district at sunset." label="Moat-and-boat corridors / Chapter 31" caption="An exploratory mobility illustration, not evidence that a boat-to-air transfer has been engineered or approved." />
              </div>
            </ResearchSection>

            <ResearchSection id="canopy" category="Heat, water, roots, and shade" title="A cooling corridor is an inhabited section." reference="Chapters 34-37: the thermal city, managed urban forest, riparian cooling, and the biotic pump hypothesis.">
              <div className={styles.illustrated}>
                <div className={styles.prose}>
                  <p>
                    A waterway is not automatically a cool place. What a person experiences depends
                    on shade, surrounding surface temperatures, air movement, humidity, the route,
                    and the places where they have to wait. The book treats cooling as the design
                    of a complete section, from soil and water to canopy and the moving body.
                  </p>
                  <p>
                    The managed forest needs adequate root space, a credible irrigation budget,
                    drainage, species diversity, and continuing care. Species must fit the actual
                    coastal or inland microclimate, recycled-water chemistry, wind, pests, and fire
                    conditions. A lush appearance is not a planting specification.
                  </p>
                  <p>
                    Native river habitats and introduced plants in controlled urban refuges have
                    different ecological roles. Temporary or structural shade must serve people
                    while trees mature. Monitoring should distinguish a cooler pavement from lower
                    air temperature or reduced radiant heat exposure.
                  </p>
                  <p>
                    The book also examines larger atmospheric questions, including the biotic pump
                    hypothesis. Those investigations must not be turned into a promise of induced
                    rainfall or regional climate control. Local thermal benefits and regional
                    atmospheric effects require different evidence.
                  </p>
                </div>
                <Illustration src={cooling} alt="People walk, cycle, and use small passenger pods on a planted path beside water, approaching a solar canopy and transit stop." label="Riparian cooling / Chapter 36" caption="A concept image of shade, water, planting, and movement designed as one public corridor." />
              </div>
              <dl className={styles.measures}>
                <div><dt>Shade</dt><dd>Coverage where people walk, wait, and rest.</dd></div>
                <div><dt>Exposure</dt><dd>Radiant heat, humidity, airflow, and weather.</dd></div>
                <div><dt>Water</dt><dd>Seasonal demand, quality, and reliable supply.</dd></div>
                <div><dt>Roots</dt><dd>Soil volume, drainage, survival, and care.</dd></div>
              </dl>
            </ResearchSection>

            <ResearchSection id="civic-life" category="The civic surface" title="Beauty belongs to the people who make a place." reference="Chapters 38-41: beauty, craft and public life, themed urbanism, and the District Atlas.">
              <div className={styles.prose}>
                <p>
                  The book argues that survival infrastructure should also support an everyday life
                  worth inhabiting: workshops, markets, gardens, shaded thresholds, gathering places,
                  and streets with recognizable character. Craft gives the adaptive surface a role
                  beyond camouflage. It can provide work, repair knowledge, local expression, and care.
                </p>
                <p>
                  The District Atlas is a collection of possible civic worlds, not a map of approved
                  developments or identities assigned to neighborhoods. Cultural references require
                  community authorship, paid participation, permission, attribution, and a way to
                  revise work that proves inaccurate or unwelcome. Fantasy should be identified as
                  fantasy rather than offered as an authentic history.
                </p>
                <p>
                  A replaceable civic skin makes that authorship ongoing. Residents can change
                  the stories and patterns of a place without rebuilding its structural backbone.
                  The public realm should remain genuinely public, including for people who are
                  not customers, tourists, or residents of a privately managed development.
                </p>
              </div>
              <div className={styles.imageTrio}>
                <Illustration src={craft} alt="An artisan works on a timber balcony above a lantern-lit canal with waterfalls, shops, bridges, and planted facades." label="Craft & the engawa / Chapter 39" caption="Making, maintenance, and the threshold between public and private life." />
                <Illustration src={street} alt="An imagined leafy street has balconies, shops, cafes, pedestrians, scooters, and a passenger pod beneath elevated rail." label="A civic street / Chapter 41" caption="An architectural vocabulary explored in the District Atlas, not a neighborhood assignment." />
                <Illustration src={village} alt="An imagined tropical timber village borders a stream, with terraced waterfalls, elevated rail, and a small aircraft." label="A Pacific village study / Chapter 41" caption="A possible civic-world illustration. Cultural authorship and local feasibility remain separate work." />
              </div>
            </ResearchSection>

            <ResearchSection id="right-to-remain" category="The social lithosphere" title="A greener city must hold its people." reference="Chapters 42-49: capital, public authority, the social lithosphere, public care, and development rights.">
              <div className={styles.prose}>
                <p>
                  Improved shade, access, and public space can increase land value without improving
                  the security of the people already there. The book treats the right to remain as
                  part of the infrastructure, not a benefit to negotiate after redevelopment begins.
                </p>
                <p>
                  Proposed tools include public and community landholding, long-term affordability,
                  tenant support, suitable replacement housing before necessary displacement,
                  enforceable return arrangements, local business continuity, and paid participation.
                  Their legal basis, financing, coverage, and enforcement would have to be established
                  for each project. A principle alone is not a protection.
                </p>
                <p>
                  The proposed Vascular LA Authority and Public Revenue Covenant address the same
                  question at an institutional scale: who controls the assets, who benefits from
                  their value, and who pays to care for them decades later? Public safety, maintenance,
                  renewal, and housing safeguards need dependable resources from the beginning.
                  The book proposes these arrangements; it does not describe an existing authorized program.
                </p>
              </div>
              <div className={styles.researchNote}>
                <h3>Measure the social outcome too</h3>
                <p>Housing stability, business continuity, accessible travel, local work, complaints, and public access belong beside water and structural performance in the evaluation. A technically successful installation can still fail its neighbors.</p>
              </div>
            </ResearchSection>

            <ResearchSection id="gaia" category="Observation, records, and accountability" title="Make the living system legible." reference="Chapter 25: The Hydro-Lithospheric Digital Thread. Chapter 54: The Digital Twin and Gaia Layer.">
              <div className={styles.prose}>
                <p>
                  The digital thread connects a component&apos;s intended role to its material batches,
                  fabrication record, tests, installed identity, inspections, repairs, and replacement.
                  A convincing three-dimensional scene is not the same thing as a verified asset record.
                  The record must preserve what was predicted before later measurements change the model.
                </p>
                <p>
                  The proposed Gaia Earth Simulator (GES) layer brings that evidence into operation. It would support
                  an operator view for diagnosis, a public view of service and restrictions, and a
                  community-review view connecting performance to budgets, complaints, and commitments.
                  These should be different views of a reconciled record, not different versions of the truth.
                </p>
                <p>
                  Missing data should remain visible. Pending laboratory results should stay pending.
                  Models need named owners, assumptions, versions, validation, and known limits.
                  Protective equipment responses, operator decisions, and institutional authority
                  must remain distinct. A dashboard cannot grant permission or guarantee safety.
                </p>
                <p>
                  Privacy is a design condition: collect only what the infrastructure question needs,
                  avoid routine individual tracking, establish retention limits, and allow people
                  to challenge consequential interpretations. Sensors are not inherently anonymous
                  simply because their output looks technical.
                </p>
              </div>
              <ol className={styles.thread} aria-label="The proposed component record">
                <li>Design basis</li><li>Fabrication</li><li>Qualification</li><li>Installation</li><li>Inspection & renewal</li>
              </ol>
              <div className={styles.themeLinks}>
                <Link href="/ges">About Gaia Earth Simulator</Link>
                <Link href="/#ges">Explore the Living Systems section</Link>
              </div>
            </ResearchSection>

            <ResearchSection id="living-labs" category="The first construction site" title="Make the university a living laboratory." reference="Chapters 27-28: the Vascular LA Studio and university testbeds. Chapter 51: the qualification ladder.">
              <div className={styles.illustrated}>
                <div className={styles.prose}>
                  <p>
                    The Vascular LA Studio would bring designers, engineers, hydrologists, materials
                    researchers, operators, fabricators, and community contributors into the same
                    process. Universities offer a setting for bounded experiments before a public
                    corridor inherits their risks. The book proposes collaboration; it does not
                    imply that any institution has agreed to participate.
                  </p>
                  <p>
                    Qualification begins with representative material specimens, then hydraulic,
                    defect, service, and planted-module tests. A full-scale controlled mockup examines
                    interactions that isolated samples miss. Only after the necessary review, funding,
                    operator acceptance, and protections would a limited public pilot follow.
                  </p>
                  <p>
                    Maintenance is an experiment in its own right. Can a crew remove sediment,
                    replace a filter, inspect a connection, retrieve a sensor, or renew a panel with
                    the available equipment? The answer should change the geometry while change
                    is still inexpensive.
                  </p>
                  <p>
                    A campus is not exempt from safety or approval requirements. Students are not
                    a substitute for qualified operators. Changed materials, toolpaths, geometry,
                    or exposure may require additional qualification, and an unsuccessful test is
                    useful when it is recorded honestly.
                  </p>
                </div>
                <Illustration src={lab} alt="Teams at a university living lab inspect robotic fabrication, mounted assemblies, finishes, and planting beside a test channel." label="The university living lab / Chapter 28" caption="The book's proposed testbed joins fabrication, assembly, water, roots, inspection, and public learning." />
              </div>
            </ResearchSection>

            <ResearchSection id="pilots" category="The next reachable step" title="Start with a place. Earn the next scale." reference="Chapters 50-55: six pilots, qualification, Hawthorne-to-Gardena, failure, Gaia, and the 2026-2076 roadmap.">
              <div className={styles.illustrated}>
                <div className={styles.prose}>
                  <p className={styles.lead}>
                    The book&apos;s near-term proposal is a portfolio of six bounded investigations,
                    not a commitment to rebuild Los Angeles all at once.
                  </p>
                  <p>
                    Hawthorne-to-Gardena is the most developed demonstration concept. It would pair
                    the existing flood-control channel with a separate, cleanable treatment edge
                    and a shaded public route. Channel function, maintenance access, and emergency
                    requirements remain primary; the treatment cell handles only a defined flow.
                  </p>
                  <p>
                    A proposed two-year trial would establish a baseline and evaluate water treatment,
                    access, thermal conditions, costs, reporting, and neighborhood effects.
                    Its initial public interface would be non-contact. A candidate corridor near
                    Alondra Park and El Camino College is not a selected or authorized site.
                  </p>
                  <p>
                    Every pilot needs a named operator, funded care, acceptance criteria, stop rules,
                    and a plan for renewal, removal, or transfer. Two years of operation cannot prove
                    a full service life or performance in a rare event that never occurs during the trial.
                  </p>
                </div>
                <Illustration src={corridor} alt="An imagined Hawthorne-Gardena water corridor combines planted buildings, paths, landings, passenger boats, footbridges, and elevated rail." label="Hawthorne-Gardena / Chapter 52" caption="A long-term concept illustration. The first proposed pilot is much smaller: a treatment edge, a public route, and a measurable operating record." />
              </div>

              <div className={styles.pilotPortfolio}>
                <h3>Six questions to investigate</h3>
                {pilots.map((pilot, index) => (
                  <details key={pilot.name} open={index === 0} className={styles.pilot}>
                    <summary><span className={styles.pilotNumber}>{String(index + 1).padStart(2, "0")}</span><span>{pilot.name}<small>{pilot.subject}</small></span></summary>
                    <p>{pilot.question}</p>
                  </details>
                ))}
              </div>

              <div className={styles.roadmap}>
                <h3>A roadmap governed by readiness</h3>
                <p>The book&apos;s planning bands overlap. Dates express an order of investigation, not a construction promise. Expansion depends on evidence, permissions, public commitments, and the ability to operate what has been built.</p>
                <ol>
                  <li><span>2026-2035</span><strong>Establish the foundations</strong><p>Agreements, baselines, contamination studies, testbeds, and bounded demonstrations.</p></li>
                  <li><span>2035-2050</span><strong>Expand proven corridors</strong><p>Operating water supply, qualified components, funded care, housing safeguards, and useful transport.</p></li>
                  <li><span>2050-2065</span><strong>Integrate at district scale</strong><p>Connect successful systems after complete operating-and-review cycles justify the next configuration.</p></li>
                  <li><span>2065-2076</span><strong>Coordinate and renew</strong><p>Link successful districts, replace aging assets, reassess coastal strategies, and review the commitments.</p></li>
                </ol>
              </div>
              <div className={styles.researchNote}>
                <h3>Failure is part of the research brief</h3>
                <p>Contaminant movement, loss of pumping, damaged attachments, inaccessible routes, misleading data, displacement, and unaffordable maintenance must have responses before commissioning. A pilot may be redesigned, remain small, or close. Honest results are more valuable than an expansion the evidence cannot support.</p>
              </div>
              <Link className={styles.textLink} href="/#research">Return to the LA River vision</Link>
            </ResearchSection>

            <footer className={styles.sourceBook}>
              <Image src={cover} alt="Cover of Gardens of Earth, Volume I, by Eric Storm." sizes="160px" />
              <div>
                <p className={styles.eyebrow}>Source manuscript</p>
                <h2>Gardens of Earth</h2>
                <p className={styles.sourceSubtitle}>Vascular Los Angeles and the Biourban Future</p>
                <p>Eric Storm / Volumes I & II / 56 chapters</p>
                <Link className={styles.textLink} href="/about#book">Book and author information</Link>
                <p>This page synthesizes the book&apos;s design and research agenda. Chapter references identify the underlying discussions. Illustrations are concept studies from the book, not photographs of completed projects, engineering approvals, or evidence of institutional participation.</p>
                <p>The integrated system, proposed pilots, authority, and roadmap remain proposals. Existing precedents inform the questions; they do not validate the complete vision.</p>
              </div>
            </footer>
          </article>
        </div>
        <BookPromotion />
      </main>
      <footer className={styles.pageFooter}>
        <Link href="/">Gardens of Earth</Link>
        <a href="#top">Back to top</a>
        <Link href="/contact">Contact</Link>
      </footer>
    </div>
  );
}
