"use client";

import Image from "next/image";
import Link from "next/link";
import LivingSystems from "./living-systems";
import NetworkJourney from "./network-journey";
import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const riverFrames = [
  {
    src: "/images/LAriver.jpg",
    alt: "The Los Angeles River channel today",
    message: "This is where we are.",
  },
  {
    src: "/images/LAriverMidTermPlan.jpg",
    alt: "A reachable mid-term restoration plan for the Los Angeles River",
    message: "This is the next reachable step.",
  },
  {
    src: "/images/LAriverReborn.jpg",
    alt: "A reimagined Los Angeles River with restored ecology",
    message: "This is where we want to be.",
  },
];

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function lerp(start: number, end: number, amount: number) {
  return start + (end - start) * amount;
}

function mapRange(value: number, inMin: number, inMax: number, outMin = 0, outMax = 1) {
  return lerp(outMin, outMax, clamp((value - inMin) / (inMax - inMin)));
}

function easeRange(value: number, start: number, end: number) {
  const t = mapRange(value, start, end);
  return t * t * (3 - 2 * t);
}

function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  mode: "section" | "viewport" = "section",
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let frame = 0;
    let active = true;

    const updateProgress = () => {
      frame = 0;
      if (!active || !ref.current) return;

      const viewportHeight = window.innerHeight || 1;
      const rect = ref.current.getBoundingClientRect();
      const scrollable =
        mode === "viewport" ? viewportHeight : Math.max(rect.height - viewportHeight, 1);
      const nextProgress = clamp(-rect.top / scrollable);

      setProgress((current) =>
        Math.abs(current - nextProgress) > 0.0005 ? nextProgress : current,
      );
    };

    const requestUpdate = () => {
      if (active && !frame) {
        frame = window.requestAnimationFrame(updateProgress);
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        active = entry.isIntersecting;
        if (active) requestUpdate();
      },
      { rootMargin: "100% 0px" },
    );

    observer.observe(element);
    updateProgress();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [mode, ref]);

  return progress;
}

function MainNavigation({ opacity = 1 }: { opacity?: number }) {
  return (
    <header className="goe-nav" aria-label="Main menu" style={{ opacity }} inert={opacity < 0.05}>
      <nav className="goe-nav__panel" aria-label="Main menu">
        <a href="#home">Home</a>
        <span className="goe-nav__separator" aria-hidden="true">
          |
        </span>
        <Link href="/research">Research</Link>
        <span className="goe-nav__separator" aria-hidden="true">
          |
        </span>
        <Link href="/ges">GES</Link>
        <span className="goe-nav__separator" aria-hidden="true">
          |
        </span>
        <a href="#news">News</a>
        <span className="goe-nav__separator" aria-hidden="true">
          |
        </span>
        <Link href="/about">About</Link>
        <span className="goe-nav__separator" aria-hidden="true">|</span>
        <Link href="/about#book">Book</Link>
        <span className="goe-nav__separator" aria-hidden="true">
          |
        </span>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}

function HeroStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const [videoReady, setVideoReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const playback = mapRange(progress, 0.12, 0.94);
  const heroLift = easeRange(progress, 0.20, 1) * 34;
  const menuOpacity = 1 - easeRange(progress, 0.16, 0.40);
  const shadowDistance = 18 + progress * 120;
  const shadowBlur = 16 + progress * 58;

  const syncVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video || reducedMotion || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const targetTime = Math.min(playback * video.duration, Math.max(video.duration - 0.04, 0));
    if (Math.abs(video.currentTime - targetTime) > 0.04) {
      video.currentTime = targetTime;
    }
  }, [playback, reducedMotion]);

  useEffect(syncVideo, [syncVideo]);

  useEffect(() => {
    // Cached media can finish loading before React attaches its media handlers.
    const frame = requestAnimationFrame(() => {
      if (videoRef.current && videoRef.current.readyState >= 2) setVideoReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  return (
    <section ref={sectionRef} id="home" className="goe-hero" aria-label="Gardens of Earth">
      <div className="goe-hero__stage">
      <div className="goe-hero__media">
        <video
          ref={videoRef}
          className="goe-hero__video"
          style={{
            opacity: videoReady ? 1 : 0,
          }}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          onLoadedMetadata={syncVideo}
          onLoadedData={() => { setVideoReady(true); syncVideo(); }}
        >
          <source
            src="/videos/hero-mobile.mp4"
            media="(max-width: 900px)"
            type="video/mp4"
          />
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>
      </div>
      <MainNavigation opacity={reducedMotion ? 1 : menuOpacity} />
      <div
        className="goe-hero__content"
        style={{ transform: `translate3d(0, ${heroLift}vh, 0)` }}
      >
        <p className="goe-kicker">Climate infrastructure as living ritual</p>
        <h1
          className="goe-title"
          style={{
            textShadow: `${shadowDistance}px ${shadowDistance * 0.62}px ${shadowBlur}px rgba(0, 0, 0, 0.66)`,
          }}
        >
          Gardens of Earth
        </h1>
      </div>
      </div>
    </section>
  );
}

function TransitionStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const cardIn = easeRange(progress, 0.12, 0.28);
  const cardOut = easeRange(progress, 0.72, 0.98);
  const cardOpacity = cardIn * (1 - cardOut);
  const cardLift = lerp(24, -8, progress);

  return (
    <section
      ref={sectionRef}
      id="transition"
      className="goe-transition"
      aria-label="Invitation to explore"
    >
      <div className="goe-transition__sticky">
        <article
          className="goe-transition-card"
          style={{
            opacity: cardOpacity,
            transform: `translate3d(0, ${cardLift}vh, 0)`,
          }}
        >
          <p className="goe-kicker">Invitation</p>
          <h2>
            We are rethinking our urban environments. We welcome you to join this
            exploration.
          </h2>
        </article>
      </div>
    </section>
  );
}

function MobilityStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const intro = lerp(0.28, 1, mapRange(progress, 0, 0.13));
  const firstCardIn = mapRange(progress, 0.26, 0.38);
  const reveal = easeRange(progress, 0.7, 0.9);
  const firstCardLift = mapRange(progress, 0.56, 0.7);
  const secondCardIn = mapRange(progress, 0.68, 0.8);
  const secondCardExit = mapRange(progress, 0.88, 1);

  return (
    <section
      ref={sectionRef}
      id="mobility"
      className="goe-mobility-story"
      aria-label="A World Beyond Traffic"
    >
      <div className="goe-mobility-story__sticky">
        <div
          className="goe-mobility-images"
          style={{
            opacity: intro,
            transform: `translate3d(0, ${lerp(12, 0, intro)}vh, 0)`,
          }}
        >
          <figure className="goe-reveal-image goe-reveal-image--left">
            <Image
              className="goe-reveal-image__color"
              src="/images/RockFacadePathway.jpg"
              alt="A lush rock facade pathway in full color"
              fill
              sizes="(max-width: 900px) 92vw, 42vw"
            />
            <Image
              className="goe-reveal-image__wire"
              src="/images/WireFrameRockFacadePathway.jpg"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 900px) 92vw, 42vw"
              style={{ transform: `translate3d(${-112 * reveal}%, 0, 0)` }}
            />
          </figure>

          <figure className="goe-reveal-image goe-reveal-image--right">
            <Image
              className="goe-reveal-image__color"
              src="/images/PolynesianVillage.jpg"
              alt="A Polynesian village corridor in full color"
              fill
              sizes="(max-width: 900px) 92vw, 42vw"
            />
            <Image
              className="goe-reveal-image__wire"
              src="/images/WireFramePolynesianVillage.jpg"
              alt=""
              aria-hidden="true"
              fill
              sizes="(max-width: 900px) 92vw, 42vw"
              style={{ transform: `translate3d(${112 * reveal}%, 0, 0)` }}
            />
          </figure>
        </div>

        <article
          className="goe-mobility-card goe-mobility-card--first"
          style={{
            opacity: firstCardIn * (1 - firstCardLift),
            transform: `translate3d(-50%, ${lerp(36, 0, firstCardIn) + lerp(0, -42, firstCardLift)}vh, 0)`,
          }}
        >
          <p className="goe-kicker">Section concept</p>
          <h2>A World Beyond Traffic</h2>
          <h3>Movement without congestion. Cities without cars.</h3>
          <ul>
            <li>No traffic jams</li>
            <li>No parking lots</li>
            <li>No noise corridors</li>
            <li>No dead space</li>
          </ul>
        </article>

        <article
          className="goe-mobility-card goe-mobility-card--second"
          style={{
            opacity: secondCardIn * (1 - secondCardExit),
            transform: `translate3d(-50%, ${lerp(76, -50, secondCardIn) + lerp(0, -86, secondCardExit)}%, 0)`,
          }}
        >
          <h2>Replaced by faster, quieter, human-centered mobility systems.</h2>
        </article>
      </div>
    </section>
  );
}

function RiverStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  const nowIn = mapRange(progress, 0.1, 0.22);
  const nowOut = mapRange(progress, 0.28, 0.38);
  const midIn = mapRange(progress, 0.32, 0.48);
  const midMessageIn = mapRange(progress, 0.44, 0.56);
  const midMessageOut = mapRange(progress, 0.62, 0.72);
  const rebornIn = mapRange(progress, 0.66, 0.82);
  const futureIn = mapRange(progress, 0.8, 0.92);

  return (
    <section
      ref={sectionRef}
      id="research"
      className="goe-river-story"
      aria-label="Los Angeles River scrollytelling story"
    >
      <div className="goe-river-story__sticky" aria-hidden="true">
        <div className="goe-river-story__frame">
          <Image
            className="goe-river-image goe-river-image--base"
            src="/images/LAriver.jpg"
            alt=""
            fill
            sizes="100vw"
          />
          <Image
            className="goe-river-image goe-river-image--mid"
            src="/images/LAriverMidTermPlan.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{
              opacity: midIn,
              transform: `translate3d(0, ${lerp(44, 0, midIn)}vh, 0)`,
            }}
          />
          <Image
            className="goe-river-image goe-river-image--reborn"
            src="/images/LAriverReborn.jpg"
            alt=""
            fill
            sizes="100vw"
            style={{
              opacity: rebornIn,
              transform: `translate3d(0, ${lerp(44, 0, rebornIn)}vh, 0)`,
            }}
          />
          <div
            className="goe-river-message goe-river-message--now"
            style={{
              opacity: nowIn * (1 - nowOut),
              transform: `translate3d(-50%, ${lerp(48, 0, nowIn) + lerp(0, -36, nowOut)}vh, 0)`,
            }}
          >
            This is where we are.
          </div>
          <div
            className="goe-river-message goe-river-message--mid"
            style={{
              opacity: midMessageIn * (1 - midMessageOut),
              transform: `translate3d(-50%, ${lerp(52, 0, midMessageIn) + lerp(0, -34, midMessageOut)}vh, 0)`,
            }}
          >
            This is the next reachable step.
          </div>
          <div
            className="goe-river-message goe-river-message--future"
            style={{
              opacity: futureIn,
              transform: `translate3d(-50%, ${lerp(54, 0, futureIn)}vh, 0)`,
            }}
          >
            This is where we want to be.
          </div>
        </div>
      </div>

      <ol className="goe-visually-hidden goe-river-narrative">
        {riverFrames.map((frame) => (
          <li key={frame.src}>
            {frame.alt}. {frame.message}
          </li>
        ))}
      </ol>

      <div className="goe-river-static">
        {riverFrames.map((frame) => (
          <figure key={frame.src}>
            <div className="goe-river-static__image">
              <Image src={frame.src} alt={frame.alt} fill sizes="100vw" />
            </div>
            <figcaption>{frame.message}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function FilmSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  return (
    <LivingSystems sectionRef={sectionRef} progress={progress} />
  );
}

function MapStory() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const progress = useSectionProgress(sectionRef);
  return <NetworkJourney sectionRef={sectionRef} progress={progress} />;
}

function ClosingSection() {
  return (
    <section id="about" className="goe-close" aria-labelledby="about-title">
      <div className="goe-close__statement">
        <p className="goe-kicker">About</p>
        <h2 id="about-title">Cities can become living systems.</h2>
      </div>
      <div className="goe-close__details">
        <p>
          Gardens of Earth is an evolving exploration of climate-adaptive urban life,
          where mobility, water, habitat, infrastructure, and culture are designed as
          one connected ecology.
        </p>
        <div id="contact" className="goe-contact">
          <p className="goe-kicker">Contact</p>
          <h3>Continue the conversation.</h3>
          <p>
            Research collaborations, concept development, and project conversations
            are welcome through the Gardens of Earth contact page.
          </p>
          <Link href="/contact">Open the contact page</Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <a className="goe-skip-link" href="#home-content">Skip to content</a>
      <main id="home-content" className="goe-shell" tabIndex={-1}>
        <HeroStory />
        <TransitionStory />
        <MobilityStory />
        <RiverStory />
        <FilmSection />
        <MapStory />
        <ClosingSection />
      </main>
    </>
  );
}
