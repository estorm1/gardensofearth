# Gardens of Earth website

Next.js 16.4 with React 19, TypeScript, Tailwind CSS, and an optional Three.js
network globe. The pages are `/`, `/research`, `/about`, `/ges`, and `/contact`.
`/about#book` contains book information; checkout and paid downloads are pending.

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
npm test
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

## Private contact form

The `/contact` page uses a server-only SMTP adapter. It stays unavailable until
all production configuration below is present and `CONTACT_ENABLED=true`.
Only availability booleans reach the browser; never use `NEXT_PUBLIC_` for these
settings or put the destination address in source, markup, responses, or links.
Keep local values in ignored `.env.local`; use private production environment
variables in Vercel. Preview deployments cannot send email.

Required server-only settings:

| Variable | Purpose |
| --- | --- |
| `CONTACT_TO` | Owner-approved private recipient |
| `CONTACT_FROM` | Sender address authorized by the SMTP account |
| `CONTACT_SMTP_HOST` | Approved provider's SMTP hostname |
| `CONTACT_SMTP_PORT` | `465` for TLS or `587` with required STARTTLS |
| `CONTACT_SMTP_USER`, `CONTACT_SMTP_PASSWORD` | Existing authorized SMTP credentials |
| `CONTACT_REDIS_REST_URL`, `CONTACT_REDIS_REST_TOKEN` | Authorized Upstash-compatible HTTPS Redis REST store |
| `CONTACT_HASH_SECRET` | Private random secret of at least 32 characters for keyed hashes |
| `CONTACT_ENABLED` | Explicit production sending switch; default is unavailable |

No mail provider or Redis account is provisioned by this code. Confirm the
owner's existing authorized services and any costs before configuring them.
The included durable REST adapter accepts HTTPS `*.upstash.io` endpoints and
uses atomic Redis scripts; another store requires a reviewed adapter. An
in-memory store is used only by the local mock, never as a production fallback.

For a local preview with no email sent:

```sh
CONTACT_LOCAL_MOCK=true npm run dev -- --hostname 127.0.0.1 --port 3420
```

Mock delivery is labeled on the page, restricted to local development, and
refuses requests whose hostname is not loopback. `CONTACT_LOCAL_MOCK` does not
enable sending in a production build or on Vercel. `npm test` uses fictional
addresses and mocked SMTP/REST responses; it sends no email.

Production limits are one attempt per IP per minute, three per clock hour, and
50 across the site per UTC day. Reservations and outcomes prevent concurrent
or retried submissions from automatically sending duplicates. The durable
store keeps keyed hashes and status for at most 24 hours, with no raw IP,
message text, name, or reply address. Store failures stop sending. SMTP uses a
fixed authorized sender and recipient, a validated single Reply-To address,
plain text, required certificate-verified TLS, and no attachments or file/URL
access. Errors keep visitor text in the form and disclose no provider details.
An ambiguous SMTP result remains unconfirmed and is not automatically resent.

Before enabling production sending, verify the real durable scripts against
the approved store and approve one bounded email test with its recipient and
content. Provider acceptance alone does not prove inbox arrival or reading.
Check receipt, Reply-To behavior, spam placement, and provider retention before
claiming delivery works. Update the visitor privacy copy if retention or
processing changes. No real email test has been performed by the local tests.
