import type { MetadataRoute } from "next";
import { siteUrl } from "./site-metadata";
import { cityMassStory } from "./research/city-mass-shared-infrastructure/summary";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/research", "/about", "/ges", "/books", "/contact", cityMassStory.path].map((path) => ({ url: `${siteUrl}${path}` }));
}
