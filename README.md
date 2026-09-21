# GoCommerce landing page

A static site. No build step, no package installation.

```
node serve.cjs      # http://127.0.0.1:4173
```

Files: `index.html` (content), `style.css` (design and layout), `app.js` (tabs,
copy buttons, mobile nav), `serve.cjs` (local preview), `assets/` (images).

## Where the numbers come from

Every figure on the page was measured against the repositories on **21 September
2026**, not estimated. If the code moves, these move with it:

| Claim on the page | Measured from |
| --- | --- |
| 1 production dependency | the non-indirect `require` block in `go.mod` — `jackc/pgx/v5` |
| 342 documented API operations | 238 in `core/openapi.json` plus 104 across `ext/*/openapi.json` |
| 142 admin endpoints | paths under `/api/admin` in `core/openapi.json` |
| 1,036 tests | `Test`/`Example` functions across `*_test.go` |
| 44 modules | directories in `ext/` |
| 61 admin screens | `+page.svelte` files under `admin/src/routes` |
| 48 migrations | migration markers in `core/schema.go` |
| 17 commerce events | event constants in `core/events.go` |
| Star and fork counts | the GitHub API, per repository |

`app.js` re-fetches the two star counts from the GitHub API on load and updates
them if the call succeeds. An unauthenticated call is rate limited per address
and will sometimes fail, so the values in the HTML are real on their own and the
page is correct when the request never returns.

## Screenshots

`assets/admin/*.webp` are real captures of the running admin panel, taken with
Playwright at 1440×900 and deviceScaleFactor 2, then resized to 1440 and encoded
as WebP. Both themes are captured, and the page picks one with
`prefers-color-scheme` — a light screenshot on a dark page looks like a bug.

The store behind them was filled by the engine's own `scripts/seed-demo.ps1`,
which uses a fixed random seed so the same store can be photographed twice: 64
products, 260 orders across 150 days. Retaking a shot later will match.

`storefront-home.webp` is [arialshop.com](https://arialshop.com), a production
store running Svelte Commerce, captured the same way.

## What the page deliberately does not claim

- **The Svelte Commerce connector is not published.** Svelte Commerce is headless
  across Medusa, Shopify, Saleor, Vendure, WooCommerce and Litekart; GoCommerce
  is not among them yet. The storefront section says so plainly rather than
  implying a wired stack.
- **No benchmarks.** None are published, so the page makes no speed claim at all.
- **The marketing section is split into shipped and roadmap.** Behavioural
  events, unified profiles, segments, a workflow builder, WhatsApp, retargeting,
  attribution and loyalty are roadmap. The engine emits order and catalog events
  only.
- **Star counts sit with the project they belong to.** GoCommerce is new and its
  count says so; Svelte Commerce's larger numbers are never shown in a way that
  could be read as GoCommerce's.

## Hosting

Cloudflare Pages serves `kitcommerce.store` from the `main` branch; a push
publishes. `9aed8449d5c60c850c662366e3d64c9a.txt` is the IndexNow key and must
stay at the site root, byte-exact and with no trailing newline, or verification
returns 403.

## Verifying a change

The audit in the session scratchpad (`verify/page-check.mjs`) loads the page in
both colour schemes and fails on console errors, failed requests, horizontal
overflow at 1440/1024/768/400px, any text below WCAG AA contrast computed from
rendered colours, missing alt text, heading-level jumps and silent font
fallbacks. Run it before pushing a design change.
