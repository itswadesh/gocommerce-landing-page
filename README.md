# kitcommerce.store

A static site. No build step, no package installation.

```
node serve.cjs      # http://127.0.0.1:4173
```

Files: `index.html`, `gocommerce/index.html`, `svelte-commerce/index.html` (the
three pages), `style.css` (design and layout), `app.js` (tabs, copy buttons,
mobile nav), `serve.cjs` (local preview), `assets/` (images), `_redirects`
(Cloudflare path rules).

## What this site is

`kitcommerce.store` is **the website presenting two independent open-source
projects**. It is not itself a product.

| | GoCommerce | Svelte Commerce |
| --- | --- | --- |
| Role | Backend + admin | Storefront |
| Language | Go | SvelteKit |
| Standalone | Yes | Yes |
| Repository | `itswadesh/gocommerce` | `itswadesh/svelte-commerce` |
| Accent | Go blue `#00add8` | Svelte orange `#ff3e00` |

The site takes no hue of its own and the wordmark is monochrome, because a
website that wore one of the projects' colours would be claiming to be that
project.

### The branding rule

Do **not** reintroduce KitCommerce as a third product — no platform, framework,
engine, runtime, umbrella, parent, backend or storefront. Never write "powered
by KitCommerce", "built on KitCommerce", or describe either project as a
KitCommerce module or layer. There is nothing called KitCommerce to install.

Spell them `GoCommerce` and `Svelte Commerce` — never `Go Commerce`,
`SvelteCommerce` or, in prose, `Svelte-Commerce`. The repository slug is
`svelte-commerce`; the project is two words.

Colour marks which of the two projects a thing belongs to and nothing else. An
accent on something that is not one of the two projects is a bug.

The verifier enforces the first rule mechanically: it fails on
`KitCommerce platform|framework|engine|Growth|stack`, `powered by KitCommerce`,
`built on KitCommerce`, `Start with KitCommerce`, and `Svelte-Commerce`.

## Page structure

| URL | Primary intent | H1 |
| --- | --- | --- |
| `/` | the two projects and how they relate | Open-source ecommerce with Go + Svelte |
| `/gocommerce/` | Go ecommerce backend | GoCommerce — ecommerce backend + admin built with Go |
| `/svelte-commerce/` | Svelte storefront | Svelte Commerce — a modern open-source ecommerce storefront |

Three pages rather than one, so each targets its own keyword set with its own
title and canonical. The homepage is a hub: it summarises both projects and
links down, and deep material lives on the project page it belongs to. Shared
claims are stated once, on the page that owns them, and referenced from the
other — the homepage never repeats the GoCommerce module list, and the
GoCommerce page never repeats the storefront's backend list.

Both repositories keep their names. They were not renamed to match the domain,
and should not be.

## Where the numbers come from

Every figure was measured against the repositories on **21 September 2026**,
not estimated. If the code moves, these move with it:

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
| 6 Svelte Commerce backends | the adapters in that repository |
| Star and fork counts | the GitHub API, per repository |

`app.js` re-fetches the two star counts from the GitHub API on load and updates
them if the call succeeds. An unauthenticated call is rate limited per address
and will sometimes fail, so the values in the HTML are real on their own and the
page is correct when the request never returns.

## Screenshots

`assets/admin/*.webp` are real captures of the running GoCommerce admin, taken
with Playwright at 1440×900 and deviceScaleFactor 2, then resized to 1440 and
encoded as WebP. Both themes are captured, and the page picks one with
`prefers-color-scheme` — a light screenshot on a dark page looks like a bug.

The store behind them was filled by the engine's own `scripts/seed-demo.ps1`,
which uses a fixed random seed so the same store can be photographed twice: 64
products, 260 orders across 150 days. Retaking a shot later will match.

`storefront-home.webp` is [arialshop.com](https://arialshop.com), a production
store running Svelte Commerce, captured the same way.

There was also a `storefront-listing.webp`. It was deleted: the capture had
landed on that store's 404 page, so it showed an error screen rather than a
product listing. It had never been referenced, which is presumably why nobody
noticed. Do not restore it — retake it.

## What the site deliberately does not claim

- **The Svelte Commerce connector is not published.** Svelte Commerce is headless
  across Medusa, Shopify, Saleor, Vendure, WooCommerce and Litekart; GoCommerce
  is not among them yet. Every page that mentions pairing them says so plainly.
  It is the only thing on the site marked *in development*.
- **No benchmarks.** None are published, so the site makes no speed claim at all.
- **Nothing on the GoCommerce roadmap is presented as shipped.** Behavioural
  events, unified profiles, segments, the automation builder, WhatsApp,
  retargeting, attribution and loyalty are all planned; the engine emits order
  and catalog events only. The roadmap marks each line individually, in one
  interleaved list rather than two columns — a two-column layout let a skimmer
  read only the shipped side and come away believing the whole thing exists.
- **Star counts sit with the project they belong to.** GoCommerce is new and its
  count says so; Svelte Commerce's larger numbers are never shown in a way that
  could be read as GoCommerce's.

## Hosting

Cloudflare Pages serves `kitcommerce.store` from the `main` branch; a push
publishes. `9aed8449d5c60c850c662366e3d64c9a.txt` is the IndexNow key and must
stay at the site root, byte-exact and with no trailing newline, or verification
returns 403.

`_redirects` carries the remaining path aliases as 301s: `/architecture`,
`/quick-start`, `/growth`, `/roadmap` and `/docs`. `/gocommerce` and
`/svelte-commerce` are deliberately **absent** — they are real pages now, and a
redirect rule matching either path would shadow the page it points at.

An unmatched path still returns a 404 with a zero-length body in production.
That is a Cloudflare Pages project setting, not anything in this repository; see
the note in `_redirects`. `serve.cjs` serves `404.html` correctly, so the local
preview is currently stricter than production.

`assets/og.png` is generated, not hand-drawn — `scratchpad/og.html` rendered at
1200×630. Regenerate it whenever the positioning changes, or the social card
will keep advertising the previous one.

## SEO and GEO

Audited against `universal-seo-geo-website-audit-playbook-v2.md` and Google's
SEO Starter Guide.

| File | Why |
| --- | --- |
| `robots.txt` | Carries the sitemap and states the AI-crawler policy explicitly. Everything is allowed — being read and cited by answer engines is the point of documentation for MIT projects, so the permission is on the record rather than merely inherited from `User-agent: *`. |
| `llms.txt` | Key facts, canonical entity names, and a **policies** block naming what a model must not say — starting with the rule that KitCommerce is not a product (§85). |
| `404.html` | Carries the header, an explanation and all three pages, with `noindex,follow` so the links are still crawled (§110, §74). |
| `_headers` | Security headers plus cache rules that match the filename strategy: nothing is fingerprinted, so HTML/CSS/JS revalidate and only the screenshots cache long (§107, §108). |
| `scripts/build-faq-schema.js` | Generates each page's `FAQPage` JSON-LD **from its visible FAQ**, so the two cannot drift (§61, §83). It also fails if a page's canonical disagrees with the URL it builds `@id` from. Run without `--write` to fail on stale output. |

In every page head: `robots` with `max-snippet:-1,max-image-preview:large`,
`viewport-fit=cover`, and structured data as an **entity graph** joined by `@id`
(§80, §81). The two projects are siblings in that graph — each is its own
`SoftwareApplication` with its own `SoftwareSourceCode`, and the `Organization`
publishes the *website*, not the software. Subpages reference the shared nodes
by `@id` rather than redefining them.

Each page has a visible breadcrumb and a matching `BreadcrumbList` (§11).

FAQs are `<details>`/`<summary>`: every answer is in the DOM and readable with
JavaScript disabled, because an FAQ that needs a script to reveal its text reads
as empty to a crawler (§77).

### Still outstanding

No analytics or conversion instrumentation exists (§29, §117, §118), there is no
`Content-Security-Policy` (§107), the admin screenshots ship a single 1440w
candidate with no `srcset` (§100), fonts load from Google rather than self-hosted
(§99), and sitemap `lastmod` is maintained by hand rather than derived from a
content hash (§65). Google's Starter Guide adds one the playbook omits entirely:
there is no off-page or promotion plan, which for two pre-1.0 open-source
projects is where discovery will actually come from.

## Verifying a change

```
node scripts/build-faq-schema.js     # fails if any page's FAQ schema is stale
```

Run it before pushing. There is no CI yet, and the broader page verifier the
previous revision of this README referenced was never checked in — that gap is
tracked as outstanding work, not a step you can currently follow.
