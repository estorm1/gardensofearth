"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore, type RefObject } from "react";
import { cities, journeyCamera, visits, activeVisit } from "./network-geo";
import { profiles } from "./network-profiles";
import styles from "./network-journey.module.css";

type Globe = Awaited<ReturnType<typeof import("./network-globe")["createNetworkGlobe"]>>;

function subscribeToMotionPreference(callback: () => void) {
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  preference.addEventListener("change", callback);
  return () => preference.removeEventListener("change", callback);
}
const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const serverMotionPreference = () => false;

function Profile({index}:{index:number}) {
  const profile=profiles[index];
  return <>
    <div className={styles.illustration}><Image src={profile.image} alt={profile.alt} width={960} height={540} sizes="(max-width:700px) 90vw, 320px"/><span>Concept illustration</span></div>
    <div className={styles.profileText}>
      <h3>{profile.title}</h3><p className={styles.subtitle}>{profile.subtitle}</p>
      <h4>Defining ecological mechanism</h4><p>{profile.mechanism}</p>
      <h4>{profile.label}</h4><p>{profile.evidence}</p>
      <div className={styles.sources}>{profile.sources.map(source=><a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label}</a>)}</div>
      {index===0 && <span className={styles.riverKey}>Los Angeles River highlighted on map</span>}
    </div>
  </>;
}

export default function NetworkJourney({ sectionRef, progress }: { sectionRef: RefObject<HTMLElement|null>; progress: number }) {
  const host=useRef<HTMLDivElement>(null);
  const engine=useRef<Globe|null>(null);
  const [status,setStatus]=useState<"loading"|"ready"|"static">("loading");
  const [attempt,setAttempt]=useState(0);
  const [failed,setFailed]=useState(false);
  const reducedMotion = useSyncExternalStore(subscribeToMotionPreference, prefersReducedMotion, serverMotionPreference);
  const displayStatus = reducedMotion ? "static" : status;
  const latest=useRef(progress);
  useEffect(()=>{latest.current=progress;engine.current?.render(progress);},[progress]);

  useEffect(()=>{
    const element=host.current;
    if(!element)return;
    let cancelled=false,started=false,generation=0;
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
    const fail=()=>{if(!cancelled){generation++;engine.current?.dispose();engine.current=null;setFailed(true);setStatus("static");}};
    const start=async()=>{
      if(started || cancelled || reduced.matches)return;
      started=true;
      const version=++generation;
      try {
        const {createNetworkGlobe}=await import("./network-globe");
        if(cancelled || version!==generation)return;
        const globe=await createNetworkGlobe(element,fail);
        if(cancelled || version!==generation){globe.dispose();return;}
        engine.current=globe;globe.render(latest.current);
        await globe.ready;
        if(!cancelled && version===generation)setStatus("ready");
      } catch (error) { if(version===generation){console.warn("[Network globe] Falling back to city profiles",error);fail();} }
    };
    const preference=()=>{
      if(reduced.matches){generation++;engine.current?.dispose();engine.current=null;started=false;setFailed(false);setStatus("static");}
      else {setStatus("loading");void start();}
    };
    const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)void start();},{rootMargin:"800px"});
    observer.observe(element);
    reduced.addEventListener("change",preference);
    return ()=>{cancelled=true;observer.disconnect();reduced.removeEventListener("change",preference);engine.current?.dispose();engine.current=null;};
  },[attempt]);

  const visit=activeVisit(progress);
  const state=journeyCamera(progress);
  const stop=visit?.city;
  const jump=(p:number)=>{
    const section=sectionRef.current;if(!section)return;
    window.scrollTo({top:section.getBoundingClientRect().top+window.scrollY+(section.offsetHeight-window.innerHeight)*p,behavior:"smooth"});
  };
  return (
    <section ref={sectionRef} id="network-dispatch" className={`${styles.section} ${displayStatus==="static"?styles.static:""}`} aria-label="Network dispatch: six cities, many climates">
      <div className={styles.sticky}>
        <div ref={host} className={styles.globe} style={{opacity:displayStatus==="ready"?1:0}} />
        {displayStatus==="loading" && <div className={styles.loading}><Image src="/maps/earth.jpg" alt="Satellite mosaic of Earth" fill sizes="100vw" /><span>Preparing the journey</span></div>}
        <header className={styles.header}>
          <p>Network dispatch</p><h2>One protocol,<br/>many climates.</h2>
          <div className={styles.coordinates}>{stop ? `${stop.lat.toFixed(2)}° N / ${Math.abs(stop.lon).toFixed(2)}° ${stop.lon<0?"W":"E"}` : "Local lessons. Planetary connections."}</div>
        </header>
        <div className={styles.north} aria-hidden="true">N<br/>↑</div>
        {displayStatus==="static" && failed && <button className={styles.retry} onClick={()=>{setFailed(false);setStatus("loading");setAttempt(value=>value+1);}}>Retry globe</button>}
        {displayStatus!=="static" && <>
          {visits.map(item=><article key={item.city.id} className={`${styles.dispatch} ${visit?.index===item.index?styles.visible:""}`} aria-hidden={visit?.index!==item.index} inert={visit?.index!==item.index}><Profile index={item.index}/></article>)}
          <div className={styles.orbitCaption} style={{opacity:visit?0:1}}>{progress<1/cities.length?"A shared planet. A local beginning.":"A different climate. A connected ambition."}</div>
          <nav className={styles.stops} aria-label="Network journey destinations">
            <button onClick={()=>jump(0)} aria-current={state.altitude>1?"step":undefined}>Earth</button>
            {visits.map(item=><button key={item.city.id} onClick={()=>jump(item.jump)} aria-current={visit?.index===item.index?"step":undefined}>{item.city.name}</button>)}
          </nav>
        </>}
        <div className={styles.credits}><a href="https://cloudless.eox.at" target="_blank" rel="noreferrer">EOxCloudless</a> by EOX IT Services GmbH · Contains modified Copernicus Sentinel data 2016 &amp; 2017 · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a><br/>River: © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> · Historical satellite mosaic, not live imagery</div>
      </div>
      <div className={styles.staticStories}>
        {cities.map((city,index)=><figure key={city.id}><Image src={`/maps/${city.id}.jpg`} alt={`Top-down satellite view of ${city.name}`} width={2048} height={Math.round(2048*city.height/city.width)} sizes="100vw"/><figcaption className={styles.staticProfile}><Profile index={index}/></figcaption></figure>)}
      </div>
      <p className={styles.srOnly}>The journey visits Los Angeles, Singapore, Medellín, Copenhagen, Shenzhen, and Basel, returning to orbit between cities. Los Angeles River greening is an aspiration; other profiles distinguish built examples, reported results, and policy targets.</p>
    </section>
  );
}
