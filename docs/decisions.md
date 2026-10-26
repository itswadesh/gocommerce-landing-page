# Decisions

Owner decisions for kitcommerce.store, newest first. Each one says what was
decided, the owner's words where they were given, and why. Changing a settled
decision needs the owner.

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
