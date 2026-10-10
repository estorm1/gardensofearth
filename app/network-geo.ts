export const EARTH_RADIUS = 6378137;
export const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (t: number) => { const x = clamp01(t); return x * x * (3 - 2 * x); };

export const cities = [
  { id: "los-angeles", name: "Los Angeles", lon: -118.29, lat: 34.06, width: 76000, height: 66000 },
  { id: "singapore", name: "Singapore", lon: 103.84, lat: 1.32, width: 63000, height: 44000 },
  { id: "medellin", name: "Medellín", lon: -75.58, lat: 6.24, width: 36000, height: 30000 },
  { id: "copenhagen", name: "Copenhagen", lon: 12.57, lat: 55.68, width: 58000, height: 45000 },
  { id: "shenzhen", name: "Shenzhen", lon: 114.06, lat: 22.55, width: 72000, height: 52000 },
  { id: "basel", name: "Basel", lon: 7.59, lat: 47.56, width: 38000, height: 30000 },
] as const;

export function mercator(lon: number, lat: number) {
  return [EARTH_RADIUS * lon * Math.PI / 180, EARTH_RADIUS * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
}

export function unproject(x: number, y: number) {
  return [x / EARTH_RADIUS * 180 / Math.PI, (2 * Math.atan(Math.exp(y / EARTH_RADIUS)) - Math.PI / 2) * 180 / Math.PI];
}

export function globePoint(lon: number, lat: number, radius = 1): [number, number, number] {
  const phi = lat * Math.PI / 180;
  const theta = lon * Math.PI / 180;
  return [radius * Math.cos(phi) * Math.cos(theta), radius * Math.sin(phi), -radius * Math.cos(phi) * Math.sin(theta)];
}

// Unwrap the shortest orbit arc; LA to Singapore travels west across the Pacific.
let longitude = -115;
const frames = [{ p: 0, lon: longitude, lat: 22, altitude: 2.5 }];
export const visits = cities.map((city, index) => {
  longitude += ((city.lon - longitude + 540) % 360 + 360) % 360 - 180;
  const at = (phase: number) => (index + phase) / cities.length;
  const altitude = index === 0 ? .014 : .010;
  for (const [phase, height] of [[.20, 2.5], [.40, altitude], [.78, altitude], [1, 2.5]]) {
    frames.push({ p: at(phase), lon: longitude, lat: city.lat, altitude: height });
  }
  return { city, index, start: at(.38), end: at(.80), jump: at(.59) };
});
export const activeVisit = (progress: number) => visits.find(visit => progress >= visit.start && progress <= visit.end);

export function journeyCamera(progress: number) {
  const p = clamp01(progress);
  const end = frames.findIndex(frame => frame.p > p);
  if (end === -1) return frames[frames.length - 1];
  const a = frames[Math.max(0, end - 1)], b = frames[end];
  const t = smooth((p - a.p) / (b.p - a.p));
  return { p, lon: mix(a.lon,b.lon,t), lat: mix(a.lat,b.lat,t), altitude: Math.exp(mix(Math.log(a.altitude),Math.log(b.altitude),t)) };
}
