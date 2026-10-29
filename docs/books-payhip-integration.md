# Books / Payhip release

Prepared locally from GitHub main a47f62c0e303806d9b3f04bef994287af41ea158.
Eric authorized releasing the two $7 audiobooks and their website purchase points.
Eric explicitly approved the combined Books/dependency public release on 26 October 2026 at 03:42 UTC and confirmed both products in a private-browser cart at 04:38 UTC. That owner evidence closes the buyer-access gate. Cloudflare blocked the task's anonymous browser, so no challenged request was repeated or bypassed. Product release is handled by a separate task. No Payhip/KDP settings or real transactions are changed by this website task.

## Implemented

- `/books` follows the current site's header, typography, colors and existing held cover/layout design.
- Volume I and II audiobook offers show $7 USD each. Both `available` values in `app/books/catalog.ts` are true in this local release candidate.
- Ordinary same-tab Buy links point to the verified hosted checkout routes `https://payhip.com/buy?link=QMZfk` and `https://payhip.com/buy?link=wAYy7`. No third-party script, iframe, legacy embed or paid-file URL is used.
- Other audiobook mentions link internally to `/books`, including Home/News/Research/About promotions and preview labels. Playback controls and the approved Chapter 9 file link keep their existing functions. Only the two Books purchase buttons lead to Payhip.
- Both offers are explicitly full M4B audiobooks. Print listings remain separate from audiobook availability.
- Both offers state: **Works with Apple Books on Mac and VLC on Mac and Windows.** The note is visible before each purchase link and associated with it for assistive technology. It reflects owner-reported testing and does not imply that Apple Books runs on Windows.
- Only the individual audiobooks are offered. The owner requested removal of the planned bundle from the website; no bundle was created in Payhip.
- Volume I print has no invented Amazon link. Volume II print reads **Available soon**. Neither is purchasable.
- The existing authorized Chapter 9 preview is reused unchanged. No additional preview, full audiobook, private delivery link or paid-file URL is copied into this worktree.
- Books is linked from site navigation and the Home, Research, About and News promotions. The public candidate uses index/follow metadata and includes `/books` in the sitemap. Contact behavior remains unchanged.

## Verification source and limits

The Payhip task's signed-in seller inspection and handoff at
`/Users/ericstorm/Documents/Codex/2026-10-25/task-4/payhip-storefront/website-integration-handoff.md`
confirmed the saved IDs, USD prices and original **Invisible** state. Both direct-checkout routes use the documented format; neither is transaction-tested here. The parent owns confirmation of released visibility and public checkout. Do not infer availability from the website flags or the existence of a route.

Eric accepted Volume II after listening and reviewing its chapters. He reports playback in Apple Books on Mac and VLC on Mac and Windows, including chapter selection in VLC on Windows. No player versions or exhaustive resume/device coverage were supplied; the website task has verified the displayed notice rather than independently repeating those playback tests.

Official sources:

- [Direct checkout links](https://help.payhip.com/article/126-direct-checkout-link)
- [Product visibility](https://help.payhip.com/article/351-product-visibility)

## Release verification and separate products

The completed dependency updates include Next/eslint-config-next 16.4.1, Nodemailer 10.1.4 and tooling Zod 4.6.7. Both audits, lint, 39 existing tests, the default Turbopack build and local no-email contact checks passed. Release-specific checks are retained outside this repository in the task's Books release report. Clean npm audits do not remove the documented caveats about Next's separately bundled v3 parser or unbounded collection validation.

The earlier local CSS-worker port restriction was resolved through normal execution escalation after preserving this checkout's generated cache. Fresh and warm default builds pass; the project build command and security settings are unchanged. The final short compatibility notice also passes lint, the default build and desktop/mobile checks.

1. The parent reports both products Visible at $7, and the owner confirmed both in a private-browser cart. Preserve that evidence instead of repeating Cloudflare-challenged requests.
2. Publish only the reviewed website/dependency diff and verify the live page and correct hosted checkout links without placing an order. Cart access does not verify paid checkout, delivery or receipts; no real purchase is authorized here.
3. Do not create or add a bundle as part of this release.
4. Add Volume I print only after its actual public Amazon listing is supplied and verified. Volume II print stays Available soon until separately ready.

Payment, paid downloads and customer receipts stay with Payhip. Website links must point to hosted checkout, never full masters, website audio assets or private delivery URLs.

## Verified Kindle links — 29 October 2026

The separate KDP task verified both public Kindle listings at 05:24 UTC:
Volume I at `https://www.amazon.com/dp/B0HPMMQKSJ` and Volume II at
`https://www.amazon.com/dp/B0HPMW8H9P`, both by Eric Storm. Although KDP labels
them Live, the retail pages showed preorder delivery on 29 October. The Books
page therefore uses **View Kindle edition on Amazon** and directs readers to
Amazon for current availability and delivery; it makes no immediate-reading or
download promise. Kindle prices are left to Amazon.

Kindle ebooks, full M4B audiobooks and paperbacks have separate labelled rows.
Volume I paperback remains in review without a verified retail URL; its existing
In preparation notice is retained. Volume II paperback remains **Available soon**
without a date. No paperback purchase link is added. The original held Amazon
preparation remains separate; this release carries only the verified Kindle
links onto the current site, preserving News and all audiobook offers.
