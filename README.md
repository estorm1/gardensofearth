# Gardens of Earth website

Next.js 16.4 with React 19, TypeScript, Tailwind CSS, and an optional Three.js
network globe. The existing pages are `/`, `/research`, `/about`, and `/ges`.
`/about#book` contains book information; checkout and paid downloads are pending.
The News destination is `/#news`; it announces the upcoming audiobook release.
Home, Research, and About include a book promotion with the same opt-in Chapter 9
preview. Audio controls and the source mount on request, with no autoplay and a
text transcript. The verified public excerpt is documented in `public/audio/README.md`.

The dedicated Books page is held in a separate local checkout. Do not add its
route, other preview files, sitemap entry, navigation, prices, or purchase links
to this production checkout until checkout and delivery have been verified and
the owner authorizes its release.

## Local development

Use Node.js 24 to match the existing Vercel project. Install the lockfile versions:

```sh
npm ci
npm run dev -- --hostname 127.0.0.1 --port 3417
```

Open <http://127.0.0.1:3417>. Read `AGENTS.md` before editing and consult the
installed Next.js documentation in `node_modules/next/dist/docs/`.

## Verification and local production preview

```sh
npm run lint
npm audit --omit=dev
node --test scripts/network-geo.test.mjs
npm run build
npm run start -- --hostname 127.0.0.1 --port 3418
```

Open <http://127.0.0.1:3418>. `next build` compiles TypeScript and prerenders the
pages, `robots.txt`, and `sitemap.xml`. The existing `next/font/google` setup
fetches Geist fonts during a clean build, so the build needs internet access.
Check all pages on desktop and mobile, keyboard navigation, the Book anchor,
and the reduced-motion/static alternatives before releasing.

## Website assets and publication

The runtime uses the prepared assets in `public/images`, `public/videos`, and
`public/maps`. Keep these with the website source when preparing a release.
Image preparation scripts read local book artwork and are optional authoring
tools; they are not part of the install or build workflow.

`Gardens Of Earth Book`, `public/Source Images`, editing projects, and local
review output are excluded from Git. Never place unpublished manuscripts,
audiobooks, purchase credentials, or private delivery links in `public`.

Metadata targets the intended canonical origin, <https://gardensofearth.com>.
The existing host is Vercel, but the custom domain and TLS must be verified
before launch. A Git push can trigger a deployment through the existing Git
integration; local review does not require a push or deployment.

Before opening book sales, approve the formats and final files, prices,
checkout provider, delivery/access method, and customer support contact.
Google Drive delivery has not been finalized. Configure and verify that flow
separately; the site currently contains no working purchase or download link.
