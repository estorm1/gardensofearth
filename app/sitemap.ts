import type { MetadataRoute } from "next";
import { siteUrl } from "./site-metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/research", "/about", "/ges"].map((path) => ({ url: `${siteUrl}${path}` }));
}
