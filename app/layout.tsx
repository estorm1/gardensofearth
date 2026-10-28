import { Geist, Geist_Mono } from "next/font/google";
import { pageMetadata, siteUrl } from "./site-metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  ...pageMetadata(
    "Gardens of Earth | Living Cities & Vascular Los Angeles",
    "Explore Eric Storm's Gardens of Earth: Vascular Los Angeles and the Biourban Future, connecting water, habitat, mobility, and life in our cities.",
    "/",
  ),
  verification: { google: "M-aKBNyr6E_z4r9LJwUSQyCZnaIhj9pwDpzltZKYuOc" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Gardens of Earth",
              url: siteUrl,
            }).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
