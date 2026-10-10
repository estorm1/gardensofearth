import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = "Gardens Of Earth Book/8X10_Reformats/Links/PrefaceImageTrainStation.png";
const destination = path.resolve("public/images/about");
await fs.mkdir(destination, { recursive: true });

const info = await sharp(source)
  .rotate()
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 82, effort: 6 })
  .toFile(path.join(destination, "preface-transit.webp"));

await fs.writeFile(
  path.join(destination, "sources.json"),
  `${JSON.stringify([{ source, output: "preface-transit.webp", section: "Preface", width: info.width, height: info.height, bytes: info.size }], null, 2)}\n`,
);
console.log(`preface-transit.webp: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(0)} KB`);
