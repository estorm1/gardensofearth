import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve("Gardens Of Earth Book/Book Images/Low Rez");
const destination = path.resolve("public/images/research");
const images = [
  ["ChatGPT Image Sep 26, 2026, 11_38_47 AM.png", "vascular-city", 1122, 4],
  ["ChatGPT Image Sep 26, 2026, 01_00_32 PM.png", "robotic-fabrication", 1122, 19],
  ["Chapter30.png", "rail-access", 1122, 30],
  ["Chapter31_MetroHopperBoat.png", "modular-boat", 1122, 31],
  ["Chapter36TransitCorridor1.png", "cooling-corridor", 1122, 36],
  ["Chapt39_EngawaCorridor.png", "engawa-craft", 1122, 39],
  ["Chapter41_FrenchColonialStreet_ProtectedCentre_v2.png", "civic-street", 960, 41],
  ["Chapter41_TahitianVillage_ProtectedCentre_v2.png", "pacific-village", 960, 41],
  ["Chapter28_UniversityLivingLab.png", "university-living-lab", 1122, 28],
  ["Chapter52_HawethornGardenaCorridor.png", "hawthorne-gardena", 1122, 52],
  ["GardensOfEarth_BookCover.png", "book-cover", 560, null],
];

await fs.mkdir(destination, { recursive: true });
const manifest = [];
for (const [file, name, width, chapter] of images) {
  const output = `${name}.webp`;
  const info = await sharp(path.join(source, file))
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82, effort: 6 })
    .toFile(path.join(destination, output));
  manifest.push({ source: `Gardens Of Earth Book/Book Images/Low Rez/${file}`, output, chapter, width: info.width, height: info.height, bytes: info.size });
  console.log(`${output}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
}
await fs.writeFile(path.join(destination, "sources.json"), `${JSON.stringify(manifest, null, 2)}\n`);
