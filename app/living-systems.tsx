"use client";

import Image from "next/image";
import type { RefObject } from "react";
import styles from "./living-systems.module.css";

const chapters = [
  { name: "Heat", title: "Begin where the city feels the heat.", copy: "Start with exposed streets, sunlit pavement, and the everyday journey to a transit stop.", detail: "Exposure / public space", x: 18, y: 35, scale: 1.18 },
  { name: "Water", title: "Give water more than one purpose.", copy: "Capture rainfall. Treat and store it. Connect district reuse with planting, and pair pumping with solar energy.", detail: "Capture / storage / reuse", x: 37, y: 65, scale: 1.22 },
  { name: "Roots", title: "Build the living foundation.", copy: "Make room for soil, moisture, and site-appropriate roots. The landscape begins beneath our feet.", detail: "Soil / moisture / habitat", x: 62, y: 65, scale: 1.22 },
  { name: "Transit", title: "Connect places. Give space back to people.", copy: "Link shared transit with accessible walking and cycling routes, making the spaces between destinations part of daily life.", detail: "Shared movement / connected places", x: 48, y: 23, scale: 1.2 },
  { name: "Hands", title: "A living city needs care.", copy: "Residents, gardeners, technicians, and transit crews keep the system working. Stewardship is infrastructure, too.", detail: "Maintenance / stewardship / belonging", x: 26, y: 38, scale: 1.32 },
  { name: "Shade", title: "Make room for everyday life.", copy: "A place to pause. A comfortable route home. A neighborhood designed around the people who live there.", detail: "Canopy / comfort / community", x: 72, y: 28, scale: 1.18 },
];

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (n: number) => { const t = clamp(n); return t * t * (3 - 2 * t); };

export default function LivingSystems({ sectionRef, progress }: {
  sectionRef: RefObject<HTMLElement | null>;
  progress: number;
}) {
  const position = progress * 7;
  const index = Math.min(6, Math.floor(position));
  const local = Math.min(1, position - index);
  const chapter = chapters[Math.min(index, 5)];
  const previous = chapters[Math.max(0, index - 1)];
  const arrival = ease(local / 0.23);
  const layerOpacity = arrival * (1 - ease((local - 0.85) / 0.15));
  const finale = index === 6;
  const blend = (a: number, b: number) => a + (b - a) * arrival;
  const scale = blend(previous.scale, finale ? 1 : chapter.scale);
  const x = blend(previous.x, finale ? 50 : chapter.x);
  const y = blend(previous.y, finale ? 50 : chapter.y);
  const textOpacity = finale ? 1 - ease((local - 0.5) / 0.25) :
    ease(local / 0.16) * (1 - ease((local - 0.84) / 0.16));

  const jump = (step: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: start + (section.offsetHeight - window.innerHeight) * ((step + 0.35) / 7), behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <section ref={sectionRef} id="ges" className={styles.section} aria-label="Living systems">
      <div className={styles.sticky}>
        <header className={styles.header}>
          <h2>Living systems</h2>
          <span>One neighborhood. Many connections.</span>
        </header>
        <div className={styles.viewport}>
          <div className={styles.scene} style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-${x}%, -${y}%) scale(${scale})`, transformOrigin: `${x}% ${y}%` }}>
            <Image src="/images/living-systems.png" alt="Concept illustration of a Los Angeles river neighborhood, with oak canopy, solar roofs, transit, gardeners, and a cutaway revealing roots and underground water storage." fill sizes="(max-width: 700px) 1100px, 130vw" />
            <svg className={styles.diagram} viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
              <defs>
                <pattern id="living-heat" width="22" height="22" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><path d="M0 0V22" stroke="#e26946" strokeWidth="4" /></pattern>
              </defs>
              <g opacity={index === 0 ? 0.45 * layerOpacity : 0}>
                <path d="M0 365L230 334L315 427L120 515L0 501Z" fill="url(#living-heat)" />
              </g>
              <g className={styles.flow} opacity={index === 1 ? layerOpacity : 0} strokeDashoffset={-local * 180}>
                <path d="M500 440 Q500 520 500 680 L695 680 Q745 680 745 645 L1060 645 L1060 515" />
                <path d="M485 85 L485 115 L540 115" className={styles.energy} />
                <circle r="8" cx={500 + clamp((local - 0.15) / 0.65) * 190} cy="680" fill="#a6eeff" />
              </g>
              <g className={styles.roots} opacity={index === 2 ? layerOpacity : 0}>
                {["M915 487 Q887 590 830 674 L815 752", "M915 487 Q944 580 991 652 L1014 752", "M915 487 Q923 600 908 708 L940 783"].map(d => <path key={d} d={d} pathLength="1" strokeDasharray="1" strokeDashoffset={1 - ease(local / 0.65)} />)}
              </g>
              <g opacity={index === 3 ? layerOpacity : 0}>
                <path d="M585 150L1030 192" stroke="#b7f2fa" strokeWidth="3" strokeDasharray="7 9" />
                <g transform={`translate(${585 + ease(local / 0.85) * 400}, ${145 + ease(local / 0.85) * 38}) rotate(5)`}>
                  <rect x="-27" y="-10" width="54" height="17" rx="7" fill="#f0f6f4" stroke="#254b50" strokeWidth="2" />
                  <path d="M-18 -4H18" stroke="#427e8f" strokeWidth="5" strokeDasharray="7 3" />
                </g>
              </g>
            </svg>
          </div>
          <span className={styles.disclaimer}>Illustrative concept / not an engineering plan</span>
        </div>
        <div className={styles.caption}>
          <div className={styles.copy} style={{ opacity: textOpacity, transform: `translateY(${(1 - arrival) * 12}px)` }} aria-hidden="true">
            <p className={styles.eyebrow}>{finale ? "Together" : `${String(index + 1).padStart(2, "0")} / ${chapter.name}`}</p>
            <h3>{finale ? "Not separate projects. One living system." : chapter.title}</h3>
            {!finale && <p className={styles.description}>{chapter.copy}</p>}
          </div>
          <p className={styles.detail} aria-hidden="true">{finale ? "Heat, water, roots, transit, hands, shade." : chapter.detail}</p>
        </div>
        <nav className={styles.chapters} aria-label="Living systems chapters">
          {chapters.map((item, i) => <button key={item.name} type="button" aria-current={i === index ? "step" : undefined} onClick={() => jump(i)}><span>{String(i + 1).padStart(2, "0")}</span>{item.name}<i style={{ transform: `scaleX(${clamp(position - i)})` }} /></button>)}
        </nav>
      </div>
      <ol className={styles.transcript}>
        {chapters.map(item => <li key={item.name}><h3>{item.name}: {item.title}</h3><p>{item.copy}</p></li>)}
        <li><h3>Not separate projects. One living system.</h3></li>
      </ol>
    </section>
  );
}
