type ScrollVideo = Pick<HTMLVideoElement, "play" | "pause">;

// Initialize the decoder once, then return control to the scroll timeline.
// A browser can refuse the request; the visible Play scene control remains usable.
export async function primeScrollVideo(
  video: ScrollVideo,
  isCurrent: () => boolean,
  sync: () => void,
): Promise<boolean> {
  if (!isCurrent()) return false;
  try {
    await video.play();
    if (!isCurrent()) return false;
    video.pause();
    sync();
    return true;
  } catch {
    if (isCurrent()) sync();
    return false;
  }
}
