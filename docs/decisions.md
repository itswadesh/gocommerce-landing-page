# Decisions

Owner decisions for kitcommerce.store, newest first. Each one says what was
decided, the owner's words where they were given, and why. Changing a settled
decision needs the owner.

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
  question, so no page says either way.
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

## 26 October 2026: every price on the site is in US dollars

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
