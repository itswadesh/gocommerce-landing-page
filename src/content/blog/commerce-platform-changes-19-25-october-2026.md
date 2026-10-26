---
title: "Commerce platform changes, 19–25 October 2026"
seoTitle: "Commerce platform changes, 19–25 October 2026"
description: "Medusa 2.22 routes payments to separate accounts by region, Vendure 3.8.1 stops leaking reset tokens through job data, Shopify says expiring tokens are coming for public apps, and UCP adds store-location search."
author: itswadesh
tags: ["Medusa", "Vendure", "Saleor", "Shopify", "payments", "security"]
---

Medusa 2.22 lets one project take payments into different merchant accounts by region or sales channel. Vendure 3.8.1 fixes a leak of password-reset and email-verification tokens through job data, and every earlier version should upgrade. Shopify told app developers that expiring access tokens will soon be required for public apps, without a date yet.

<div class="tbl-scroll">

| Date | Platform | What changed |
| :-- | :-- | :-- |
| 19–20 October | [Saleor 3.23.43](https://github.com/saleor/saleor/releases/tag/3.23.43) and [3.23.44](https://github.com/saleor/saleor/releases/tag/3.23.44) | Dependency security releases. Pillow 13.0.0 fixes 38 CVEs and advisories. A `certifi` update revokes a compromised certificate. 3.22.74 and 3.22.75 backport both. |
| 20 October | [Shopify: securing your app](https://shopify.dev/changelog/blog/securing-your-app-together) | Asks app developers to run security checks now. Expiring access tokens will soon be required for all public apps. No enforcement date yet. |
| 21 October | [Medusa 2.22](https://github.com/medusajs/medusa/releases/tag/v2.22.0) | Several Medusa Payments accounts in one project, chosen by region or sales channel, and customer export to CSV. Requires Node.js 22.22.0 or later, so Node 20 no longer works. |
| 22 October | [UCP location search](https://shopify.dev/changelog/posts/discover-a-merchant-s-retail-stores-with-ucp-location-search-and-lookup) | Shopping agents can find a merchant’s shops by city, name, distance and item availability. Availability is provisional, and pickup checkout isn’t supported yet. |
| 22 October | [Polaris Web Components 2.0](https://shopify.dev/changelog/posts/polaris-cdn-2-0-is-now-stable) | Stable on the CDN, matching the redesigned Shopify admin. Apps opt in by loading `polaris-2.js`. `polaris.js` stays on 1.1. |
| 23 October | [Vendure 3.8.1](https://github.com/vendure-ecommerce/vendure/releases/tag/v3.8.1) | A high-severity fix: the Admin API’s job queries, and the `job.data` telemetry attribute, exposed email-verification, password-reset and email-change tokens. Also fixes asset removal across channels. No migrations. |

</div>

## Medusa: one project, several merchant accounts

A business selling in two countries often needs a merchant account in each. Medusa 2.22 picks the account per region or sales channel inside one project. Keep reconciliation separate per account, because each one settles on its own.

Check Node before upgrading. 2.22 refuses Node 20.

In GoCommerce, each store keeps its own payment and shipping credentials, and they are used only for that store’s requests. A business with a store per country gets a separate account per store. See [many stores from one install](/blog/one-engine-for-every-store/).

## Vendure 3.8.1: tokens in job data

A background job that sends a reset email carries the token it sends. If job data can be read through an API or ends up in telemetry, so can the token. Vendure 3.8.1 closes both paths, and recommends upgrading from every earlier version.

The lesson holds for any platform with a job queue: a live credential should not sit anywhere that can be read back later, whether that’s a queue, a log, a trace or a message history.

## Shopify: expiring tokens, before the deadline

Shopify hasn’t set a date, but its direction is clear. A public app that relies on a long-lived offline token will have to rotate expiring ones. An app built now should plan for rotation. The same post previews tighter rules on storefront code, App Store security requirements and IP restrictions for keys.

## UCP: agents that look for a shop

Agent shopping now reaches physical shops. An agent can ask which of a merchant’s locations near a buyer carries an item. The answer is a hint, not a stock count or a pickup booking. Shopify says to treat item matches as provisional, and pickup checkout isn’t supported yet.

## Sources

Every entry above links to its release or changelog post. Each was read on 26 October 2026.
