import type { Metadata } from "next";

export const siteUrl = "https://gardensofearth.com";

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const image = { url: "/images/hero-web.jpg", alt: "Gardens of Earth concept landscape" };
  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    authors: [{ name: "Eric Storm" }],
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Gardens of Earth",
      locale: "en_US",
      type: "website",
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
