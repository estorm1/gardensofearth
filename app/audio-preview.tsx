"use client";

import { useId, useState } from "react";
import Link from "next/link";
import styles from "./book-promotion.module.css";

export type Preview = {
  title: string;
  context: string;
  description: string;
  src: string;
  duration: string;
  transcript: string;
};

const focusControls = (element: HTMLAudioElement | null) => { element?.focus(); };

export default function AudioPreview({ sample, linkToBooks = false }: { sample: Preview; linkToBooks?: boolean }) {
  const id = useId();
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  return (
    <div className={styles.preview}>
      <p className={styles.eyebrow}>{linkToBooks ? <Link href="/books">Audiobook preview</Link> : "Audiobook preview"}{sample.duration ? ` · ${sample.duration}` : ""}</p>
      <h3 id={`${id}-title`}>{sample.title}</h3>
      <p className={styles.context}>{sample.context}</p>
      <p>{sample.description}</p>
      <p className={styles.disclosure}>AI-narrated audio. Playback starts only when you choose Play.</p>
      {sample.src ? (
        <>
          {!loaded || failed ? (
            <button
              type="button"
              className={styles.loadButton}
              onClick={() => { setFailed(false); setAttempt(value => value + 1); setLoaded(true); }}
            >
              {failed ? "Load preview again" : "Load audiobook preview"}
            </button>
          ) : null}
          {loaded && !failed ? (
            <audio
              key={attempt}
              ref={focusControls}
              src={sample.src}
              controls
              preload="none"
              tabIndex={0}
              aria-labelledby={`${id}-title`}
              aria-describedby={`${id}-help`}
              onError={() => setFailed(true)}
              onPlay={event => {
                document.querySelectorAll("audio").forEach(other => {
                  if (other !== event.currentTarget) other.pause();
                });
              }}
            >
              Your browser cannot play this preview. Use the audio-file link below.
            </audio>
          ) : null}
          <p id={`${id}-help`} className={styles.help} role="status">
            {failed ? "The preview could not load. Try again or open the audio file." : loaded ? "Choose Play in the audio controls. You can pause, seek, and adjust the volume." : "Load the controls when you are ready to listen. Audio is not downloaded on page arrival."}
          </p>
          <a className={styles.audioLink} href={sample.src}>Open the audio preview file</a>
          {sample.transcript ? (
            <details className={styles.transcript}>
              <summary>Read the preview transcript</summary>
              <div>{sample.transcript.split("\n\n").map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </details>
          ) : null}
        </>
      ) : <p className={styles.help}>The audio preview is being prepared.</p>}
    </div>
  );
}
