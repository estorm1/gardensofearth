import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { cities } from '../app/network-geo.ts';

const destination = new URL('../public/maps/', import.meta.url);
await mkdir(destination, { recursive: true });
const project = (lon, lat) => [lon * Math.PI / 180 * 6378137, Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)) * 6378137];
const sites = cities.map(({id,lon,lat,width,height}) => ({id,center:[lon,lat],width,height}));
const get = async (url, file) => {
  if (process.argv.includes('--missing-only')) {
    try { await readFile(new URL(file, destination)); return; } catch { /* Fetch missing assets. */ }
  }
  const response = await fetch(url, { signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error(`${file}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (file.endsWith('.jpg') && bytes[0] !== 255) throw new Error(`${file}: expected JPEG, got ${bytes.toString().slice(0, 150)}`);
  await writeFile(new URL(file, destination), bytes);
  console.log(file, bytes.length);
};
const wms = (layer, srs, bbox, width, height) => 'https://tiles.maps.eox.at/wms?' + new URLSearchParams({ service: 'WMS', version: '1.1.1', request: 'GetMap', layers: layer, styles: '', srs, bbox: bbox.join(','), width: String(width), height: String(height), format: 'image/jpeg' });
if (!process.argv.includes('--river-only')) {
if (!process.argv.includes('--regions-only')) {
await get(wms('s2cloudless', 'EPSG:4326', [-180,-90,180,90], 4096, 2048), 'earth.jpg');
}
for (const site of sites) {
  const [x, y] = project(...site.center);
  site.bounds = [x-site.width/2, y-site.height/2, x+site.width/2, y+site.height/2];
  if (!process.argv.includes('--regions-only')) await get(wms('s2cloudless_3857', 'EPSG:3857', site.bounds, 2048, Math.round(2048*site.height/site.width)), `${site.id}.jpg`);
  const regional = [x-site.width*2, y-site.height*2, x+site.width*2, y+site.height*2];
  await get(wms('s2cloudless_3857', 'EPSG:3857', regional, 2048, Math.round(2048*site.height/site.width)), `${site.id}-region.jpg`);
}
if (process.argv.includes('--regions-only')) process.exit(0);
await writeFile(new URL('sites.json', destination), JSON.stringify(sites, null, 2));
}
const query = '[out:json][timeout:60];way["waterway"]["name"="Los Angeles River"](33.7,-118.7,34.4,-118.1);out geom;';
if (process.argv.includes('--missing-only')) process.exit(0);
const fileIndex = process.argv.indexOf('--river-file');
let data;
if (fileIndex !== -1) data = JSON.parse(await readFile(process.argv[fileIndex + 1], 'utf8'));
else {
  const response = await fetch('https://overpass-api.de/api/interpreter?' + new URLSearchParams({ data: query }), { signal: AbortSignal.timeout(90000) });
  if (!response.ok) throw new Error(`River geometry: ${response.status}`);
  data = await response.json();
}
if (!data.elements?.length) throw new Error('River geometry missing');
const river = { type: 'FeatureCollection', features: data.elements.map(way => ({ type: 'Feature', properties: { osmId: way.id, name: way.tags.name }, geometry: { type: 'LineString', coordinates: way.geometry.map(p => [p.lon,p.lat]) } })) };
await writeFile(new URL('la-river.geojson', destination), JSON.stringify(river));
console.log('River segments:', river.features.length);
