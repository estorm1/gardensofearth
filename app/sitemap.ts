import type { MetadataRoute } from "next";
import { siteUrl } from "./site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/research", "/about", "/ges", "/books", "/contact"].map((path) => ({ url: `${siteUrl}${path}` }));
}
