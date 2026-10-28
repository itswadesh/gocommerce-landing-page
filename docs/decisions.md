# Decisions

Owner decisions for kitcommerce.store, newest first. Each one says what was
decided, the owner's words where they were given, and why. Changing a settled
decision needs the owner.

## 28 October 2026: the Docker stack is the backend + admin quick start

The audit found "Deploy in minutes" and "one command" used as if they
started the whole platform. The site's compose file starts PostgreSQL,
GoCommerce with its admin, and Caddy; Svelte Commerce is an optional
profile that is not paired with GoCommerce.

- Every "Deploy in minutes" button now reads "Backend + admin quick start",
  and the header's "Deploy" reads "Quick start". The homepage section says
  what runs and what does not (no storefront, no AI gateway or MCP module),
  and the closing band, the hero point, /open-source/ and llms.txt say the
  same.
- "Your first store, in about five minutes" on /gocommerce/ became
  "GoCommerce from source, with Go and PostgreSQL": nothing measured the
  five minutes, and it starts no storefront.
- No full-stack recipe is published here. GoCommerce main gained a compose
  file that starts the storefront too (commit 07fbf55d); the site says
  nothing about it until that stack has been run end to end with a test
  order.

## 28 October 2026: every count is read from GoCommerce, not typed

An outside audit said the homepage claimed 51 modules and /pricing/ 49. The
build said 51 in both places by then, but GoCommerce main had 52 modules (53 by evening),
and other figures had drifted further: 1,036 tests (now over 1,900), 342 API
operations (532), 61 admin screens (92), "10 gateway modules" on the
checkout features page (11), and AGENTS.md described as 14 rules on one
page and 18 on another (16).

- `scripts/read-facts.mjs` reads GoCommerce `origin/main` through git and
  writes `src/data/facts.json`, with the commit and what each figure counts.
  It is checked in because Workers Builds has no GoCommerce checkout. Pages
  render the figures through `src/lib/facts.ts`; data files and llms.txt
  write `{modules}`-style tokens.
- `npm run verify` fails when a page states a different figure for modules,
  operations, tests, admin screens, MCP tools, backends, AGENTS.md rules,
  skills guides, rights, migrations or events, and when the local
  `../gocommerce` checkout has moved past facts.json. Blog posts are dated
  and keep the figures of their day.
- Definitions, chosen to be the plainest true reading: modules are `ext/`
  directories less the `alltest` harness; admin screens are pages of the
  operator panel (`admin/src/routes/dash`), not sign-in pages or the trade
  portal; tests are Go `Test` and `Example` functions less `TestMain`;
  operations are path and method pairs in every `openapi.json`. The site
  states tests as "over N", the count rounded down to the hundred, so a new
  test is not drift; the verify check compares tests by the hundred too.
- Each module page's test and operation counts come from facts.json too,
  instead of numbers typed into its JSON, ten of which were behind.
- llms.txt is now built (`src/pages/llms.txt.ts`) from `src/data/llms.txt`,
  so its figures follow the same file.

## 28 October 2026: the price in the owner's words, as two columns

The owner restated the pricing: "MIT license - download and use it free.
hosted(saas version is 1% on evey successful order)".

- /pricing/ shows two columns. "MIT licence": download it and use it free.
  "Hosted (SaaS)": 1% of every successful order, with the facts of 27
  October under it (cash-on-delivery and on-account orders included,
  charged in the store's currency, 18% GST on the fee for stores in India).
  Nothing else is said about hosting: no plans, refunds or SLAs, because
  none were given.
- The fee is worded one way everywhere: "1% of every successful order", and
  "1% of every order" where a title has no room. Both are built from
  `feeBasis` and `feeBasisShort` in `src/data/pricing.json`; data files
  write `{hostedFeeText}` or `{hostedFeeShort}`. Why: the site said "each
  successful sale", the owner says "order", and two wordings for one price
  read as two prices. `scripts/verify.js` fails on the old wording for the
  hosted fee.
- "No paid tier" and "there is no paid plan" are gone. Hosting is paid, so
  the site says the software has one edition and no paid or enterprise
  edition, which stays true. The rule against "no paid edition" (26 October)
  stands, so the wording avoids it.
- The homepage FAQ "Is there a platform fee or a paid plan?" now answers
  "Only when it is hosted", where it used to say "There is no paid plan".

## 27 October 2026: the hosted fee's terms, tax labels and the domain

The owner answered six open questions with: "yes for all but
kitcommerce.tech is not mine, its kitcommerce.store".

- The 1% applies to every successful sale, cash-on-delivery and on-account
  (credit) B2B orders included. Why: the owner confirmed it. The fee
  calculator and the India pages now state it as a fact, not an assumption.
  This settles the open question in "target Indian suppliers" below.
- The 1% is charged in the store's own currency, and GST is added to it for
  stores in India. The rate, 18%, is the standard rate for online services
  and lives once, as `gstIndia` in `src/data/pricing.json`, next to the fee.
  Pages that speak to Indian stores say "plus 18% GST on the fee", rendered
  from that value. In rupees the fee calculator adds GST to both sides,
  because Shopify also charges GST on its fees to stores in India (Shopify
  Help Center, "Navigating GST, SST, and VAT for Shopify billing", read 27
  October 2026). Why: a fee quoted without its GST undersells the bill, and
  mixing a figure with GST against one without would flatter kitcommerce.
- With JavaScript off, prices stay in rupees. Why: Indian businesses are the
  first target, as decided on 26 October.
- The Internet Archive captures of Shopify's and Squarespace's US price lists
  are acceptable sources. Why: this machine is served euro prices, and the
  captures are the rivals' own pages, dated.
- A rival price list that includes tax is labelled "incl. tax" wherever it is
  shown, not dropped. The list carries `"taxIncluded": true` in
  `src/data/prices.json`, and the label is rendered from it. Why: a
  tax-inclusive figure next to tax-exclusive ones misleads unless it says so.
- kitcommerce.tech is not the owner's. The site's domain, and the name it
  leads with, is kitcommerce.store; nothing is renamed. The site never
  mentions kitcommerce.tech.

## 26 October 2026: prices in the visitor's currency, never converted

The owner: "The site now shows prices only in US dollars, but the customer
research ranks Indian businesses as the best groups to target first. we need
to integrate all currencies". This replaces the decision further down,
"every price on the site is in US dollars", made earlier the same day.

- A visitor picks INR, USD, EUR, GBP, AUD, CAD, SGD or AED. Each rival price
  is the rival's own published list in that currency. There is still no
  exchange rate anywhere on the site.
- A rival with no list in the chosen currency shows its nearest published
  list (US dollars, then euros, pounds sterling, rupees), in that list's own
  currency, and a note under the picker says so.
- Every rival price is typed once, in `src/data/prices.json`, on a list that
  names its currency, source URL and the date it was read. Pages write
  `{p:rival/item}`. `scripts/verify.js` fails on a price without a source and
  on any amount typed anywhere else.
- With JavaScript off, prices show in rupees. Why: Indian businesses are the
  first target, and the owner's general standard is rupee prices. With
  JavaScript, the page uses the visitor's stored choice, else a guess from
  the time zone (Asia/Kolkata gives INR) and then the browser language, else
  US dollars. A head script applies it before first paint, so nothing moves.
- This machine is served euro prices. Shopify's and Squarespace's US lists
  could not be read directly, so they come from the Internet Archive's
  captures of their own pricing pages (24 and 22 October 2026), dated with
  the capture date.
- A page about one market quotes that market's list whatever the visitor
  picks: the Shopify India comparison shows Shopify's rupee prices.
- Worked examples at made-up sales figures are stated in one named currency.
- The hosted fee is a percentage and needs no currency.
- `/pricing/fee-calculator/` sets a month's sales and the share paid online
  against Shopify's plan and its fee on orders that a provider other than
  Shopify Payments takes, from Shopify's list for the visitor's market. It
  counts the 1% on every sale, cash on delivery included, and leaves out
  payment gateway charges and tax on both sides.

## 26 October 2026: titles lead with the search term; the brand is pending

The owner approved item 4 of the search audit of 26 October 2026: titles and
headings lead with what people type, not with a brand nobody searches yet.

- Comparison pages lead with "<rival> alternative", then "GoCommerce vs
  <rival>", for example "Open-source Shopify alternative: GoCommerce vs
  Shopify". The old headline, the one-line contrast, is the subhead. Bodies
  are unchanged.
- Module pages lead with the vendor's API or the feature, in Go, for example
  "Razorpay integration in Go (GoCommerce module)" and "Shiprocket API in Go:
  GoCommerce shipping module".
- Every title is 60 characters or fewer; `scripts/verify-dist.js` fails the
  build on a longer one.
- Which name the site leads with (KitCommerce, GoCommerce or Svelte Commerce)
  is still open with the owner. Until the owner decides, names stay exactly
  as the site already used them; nothing was renamed.

## 26 October 2026: target Indian suppliers that sell through dealers, by trade

The owner: "find and target the best indian business groups".

- Ranked by how common dealer credit is in the trade, how far it has moved
  to ordering online, what GoCommerce really does today, what blocks it, and
  whether people search for it. The top three trades are electricals and
  consumer durables, building materials (tiles, sanitaryware, plywood,
  pipes), and auto parts sold by part number. Pumps and motors fit as well
  but are rarely searched for. The research is kept outside the repo.
- Pages: `/solutions/b2b-ecommerce-india/` (a hub in plain words),
  `/solutions/dealer-portal/`, one page per top trade, `/agencies/`, and
  `/compare/shopify-b2b-vs-kitcommerce/`. Each is linked from `/solutions/`.
- No jewellery page. For dealer ordering, jewellery ranks near the bottom,
  because it needs pricing by weight at the day's gold rate and HUID fields,
  and GoCommerce has neither. Pharma, agri-inputs and FMCG distribution are
  left out for similar reasons: batch and expiry records, licence checks and
  ordering by salespeople.
- What GoCommerce does is written once, in `src/data/b2b/capabilities.json`,
  and what it does not do once, in `src/data/b2b/gaps.json`. Every page names
  its gaps. The site does not say "GST-compliant invoices", "Tally
  integration" or "WhatsApp ordering", because none of them exists.
- The pages state the fee only as `src/data/pricing.json` does. Whether the
  1% applies to cash-on-delivery and on-account orders is the owner's open
  question, so no page says either way. Settled on 27 October 2026: it does.
- Portal screenshots come from a local GoCommerce 1.2 install with a dealer
  labelled "(demo)" and sample products. No customer, count or testimonial is
  invented.
## 26 October 2026: release notes are listed on /updates/, not on the blog

Posts that announce or explain one change to GoCommerce
(`admin-panel-moves-to-dash`, `roles-screen-role-with-no-rights`,
`custom-reports-stay-in-their-store`, `custom-roles-and-team-members`) are
listed under "Release notes" on
/updates/ and left out of the blog index and the RSS feed. The blog keeps
posts written for a search: how-tos, comparisons, and the weekly "Commerce
platform changes" round-ups.

- Why: the SEO audit of 26 October found the blog index was mostly changelog
  entries, which nobody searches for. /updates/ is where changes already live.
- The posts keep their /blog/<slug>/ URLs, so no redirect is needed and no
  link breaks. Their breadcrumb, kicker and structured data point at
  /updates/. Moving the files to /updates/<slug>/ was the larger change, for
  no reader benefit.
- `src/data/release-notes.json` names them. A list rather than a
  frontmatter field, because editing a post's Markdown moves its git date,
  and the sitemap's lastmod would then claim a change that did not happen.
  A name with no matching post fails the build.

## 26 October 2026: hosted stores pay 1% of each successful sale

The owner: "change this to 1% on each successful sale". Asked how to word it,
the owner chose: stores hosted on kitcommerce.store pay 1% of each successful
sale, and self-hosting the MIT code stays free, 0% of sales. The site says
both.

- Why: hosted sign-up is live at
  https://admin.kitcommerce.store/admin/auth/signup (its auth-state endpoint
  reports `"signup": true`), so "free for life", "no hosted offering" and
  "nothing to buy" stopped being true.
- The figure and the sign-up URL live once, in `src/data/pricing.json`. Pages
  read them through `src/lib/pricing.ts`; comparison data files write
  `{hostedFee}`. `scripts/verify.js` fails the build on the old phrasings and
  on any other "N% of each successful sale", and checks `llms.txt` against the
  config.
- The site says only that: 1% of each successful sale, hosted on
  kitcommerce.store. No plans, monthly fees, trials, SLAs, support contracts or
  refund terms are published, because none were given.
- The software's JSON-LD offers stay at price 0: they describe the MIT
  software, which is free.

## 26 October 2026: every price on the site is in US dollars (replaced the same day)

The owner: "keep all prices throughout the website in $USD".

- Where a rival publishes a US-dollar price list, the site uses it, read on
  the date shown, with the source linked.
- Where a rival publishes rupee prices only, the site drops its price rather
  than convert it. There is no currency conversion anywhere on the site.
- Percentage fees are not prices and stay. Currencies the software supports
  (INR settlement in the Delhivery module, minor units on invoices) are facts
  about the software, not prices, and stay.
- This overrides the owner's general standard of rupee prices formatted with
  `Intl.NumberFormat('en-IN')` for this site.
