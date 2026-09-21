# KitCommerce landing page

A static site. No build step, no package installation.

```
node serve.cjs      # http://127.0.0.1:4173
```

Files: `index.html` (content), `style.css` (design and layout), `app.js` (tabs,
copy buttons, mobile nav), `serve.cjs` (local preview), `assets/` (images),
`_redirects` (Cloudflare path rules).

## Brand architecture

**KitCommerce** is the umbrella and takes no colour of its own — the logo is
monochrome because a brand wearing one of its own layers' hues would be claiming
to be that layer. Underneath it:

| Layer | Project | Colour |
| --- | --- | --- |
| Storefront | Svelte Commerce | Svelte orange `#ff3e00` |
| Engine and admin | GoCommerce | Go blue `#00add8` |
| Growth | KitCommerce Growth | violet `#7c4dff` |

Spell them `KitCommerce`, `GoCommerce`, `Svelte Commerce`, `KitCommerce Growth`
— never `Kit Commerce`, `Go Commerce` or `SvelteCommerce`. Colour marks
architectural layers and nothing else; an accent on something that is not a
layer is a bug.

Both repositories moved to the `itswadesh` account. The GitHub paths are
`itswadesh/gocommerce` and `itswadesh/svelte-commerce`; the old
`misiki-in/gocommerce` still redirects, but no link here should rely on that.
The **Go module path is unchanged** at `github.com/misiki/gocommerce` — renaming
a repository does not rename its module, and the code sample on the page says so
rather than quietly showing an import that would not resolve.

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
  implying a wired stack. It is the only thing on the page marked *in
  development*.
- **No benchmarks.** None are published, so the page makes no speed claim at all.
- **KitCommerce Growth is a name, not yet a product.** The third pillar carries a
  different status marker from the other two for that reason. Every capability in
  the Growth section is tagged shipped or roadmap individually, in one
  interleaved list rather than two side-by-side columns — a two-column layout let
  a skimmer read only the shipped side and come away believing the whole layer
  exists. Behavioural events, unified profiles, segments, the automation builder,
  WhatsApp, retargeting, attribution and loyalty are all roadmap; the engine
  emits order and catalog events only.
- **No recovery-link plumbing is claimed.** `core/notify.go` subscribes to
  `order.*` deliberately and nothing else; there is no `StorefrontURL` in core.
  Cart recovery is the module's own schedule, which is what the page says.
- **Star counts sit with the project they belong to.** GoCommerce is new and its
  count says so; Svelte Commerce's larger numbers are never shown in a way that
  could be read as GoCommerce's.

## Hosting

Cloudflare Pages serves `kitcommerce.store` from the `main` branch; a push
publishes. `9aed8449d5c60c850c662366e3d64c9a.txt` is the IndexNow key and must
stay at the site root, byte-exact and with no trailing newline, or verification
returns 403.

`_redirects` makes the brief's recommended project paths resolve instead of
404ing — `/gocommerce`, `/svelte-commerce`, `/growth`, `/architecture`,
`/quick-start`, `/roadmap` point at the matching homepage section and `/docs`
points at the engine README. They are redirects rather than pages on purpose:
separate pages would duplicate every claim, and a claim kept in two places is a
claim that will disagree with itself.

`assets/og.png` is generated, not hand-drawn — `scratchpad/og.html` rendered at
1200×630. Regenerate it whenever the brand architecture changes, or the social
card will keep advertising the previous one.

## SEO and GEO

Audited against `universal-seo-geo-website-audit-playbook-v2.md`. What that added:

| File | Why |
| --- | --- |
| `robots.txt` | Carries the sitemap, and states the AI-crawler policy explicitly. Everything is allowed — being read and cited by answer engines is the point of documentation for an MIT project, so the permission is on the record rather than merely inherited from `User-agent: *`. |
| `llms.txt` | Key facts, canonical entity names, and a **policies** block naming the four things a model should not say about this project (§85). |
| `404.html` | Was a blank page, which wastes every stale inbound link. Now carries the header, an explanation and the section list, with `noindex,follow` so the links are still crawled (§110, §74). |
| `_headers` | Security headers plus cache rules that match the filename strategy: nothing is fingerprinted, so HTML/CSS/JS revalidate and only the screenshots cache long (§107, §108). |
| `scripts/build-faq-schema.js` | Generates the `FAQPage` JSON-LD **from the visible FAQ**, so the two cannot drift (§61, §83). Run without `--write` to fail if stale. |

In the page head: `robots` with `max-snippet:-1,max-image-preview:large`,
`viewport-fit=cover`, and structured data as an **entity graph** — Organization
(with `sameAs`), WebSite, SoftwareApplication, two SoftwareSourceCode nodes,
BreadcrumbList and FAQPage, joined by `@id` (§80, §81).

The FAQ is `<details>`/`<summary>`: every answer is in the DOM and readable with
JavaScript disabled, because an FAQ that needs a script to reveal its text reads
as empty to a crawler (§77).

## Verifying a change

The audit in the session scratchpad (`verify/page-check.mjs`) loads the page in
both colour schemes and fails on console errors, failed requests, horizontal
overflow at 1440/1024/768/400px, any text below WCAG AA contrast computed from
rendered colours, missing alt text, heading-level jumps and silent font
fallbacks. Run it before pushing a design change.
