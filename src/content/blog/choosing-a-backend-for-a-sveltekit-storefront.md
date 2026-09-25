---
title: "Choosing a backend for a SvelteKit storefront: coverage across 26 connectors"
seoTitle: "Choosing a backend for a SvelteKit storefront"
description: "All 26 Svelte Commerce connectors ranked by measured coverage of a 43-service surface: which backends can sell today, which need work, which cannot yet."
author: itswadesh
tags: ["Svelte Commerce", "SvelteKit", "headless commerce", "connectors"]
---

If your SvelteKit storefront is Svelte Commerce, choosing a backend means choosing one of 26 connectors. Switching between them is a dependency change, so the choice looks cheap. It is not, because the 26 are not equally finished.

This post ranks all 26 by measured coverage, breaks out the three services a store cannot sell without, names the gaps that recur, and sorts the connectors into three tiers: ready to sell, usable with work, and not usable yet.

## What “coverage” means here

A connector is a TypeScript package that maps one platform’s API onto a shared surface of 43 services: product, category, search, cart, checkout, order, auth, address, coupon, review, wishlist, page and the rest. Method names and shapes must match the Litekart connector’s exactly, so the storefront calls every connector the same way and never names a backend. That is why swapping one is a dependency change.

Coverage is how many of the 43 are wired, and a script measures it rather than anyone asserting it. The script traces which service methods reach the HTTP layer, following each connector’s own request helpers. A service counts only if it issues a real request, or delegates to one that does.

Three details change how the numbers read:

- **“No endpoint” is not “not yet”.** Where a platform has no real customer-login endpoint, the connector’s auth service throws rather than inventing a session. A stub that logs anyone in for any password is an auth bypass, not a placeholder.
- **Nine services count for nobody.** Reels, deals, chat, gallery, popularity, demo requests, feedback, plugins and banners are Litekart-native ideas with no equivalent elsewhere. They stay documented placeholders and are left out of every gap list.
- **Shopify is measured against 27, not 43.** Ranked by ratio, its 16 of 27 sits mid-table. Counted against the full 43, the same 16 wired services would be 37%.

The figures are Svelte Commerce’s own, from `docs/CONNECTORS.md` in its repository, as of September 2026. Connectors move; the current table is on the [backends page](/svelte-commerce/backends/).

## All 26, ranked

Wired services over total, highest first, ties in alphabetical order. “No endpoint” means the platform offers nothing for that service to call.

<div class="tbl-scroll">

| Connector | Wired/total | Cart | Checkout | Sign-in |
| :-- | :-- | :-- | :-- | :-- |
| [Litekart](/svelte-commerce/backends/litekart/) | 39/43 (91%) | wired | wired | wired |
| [Vendure](/svelte-commerce/backends/vendure/) | 39/43 (91%) | wired | wired | wired |
| [Medusa](/svelte-commerce/backends/medusa/) | 31/43 (72%) | not yet | wired | not yet |
| [Broadleaf](/svelte-commerce/backends/broadleaf/) | 28/43 (65%) | wired | wired | wired |
| [Saleor](/svelte-commerce/backends/saleor/) | 28/43 (65%) | not yet | not yet | not yet |
| [Shopware](/svelte-commerce/backends/shopware/) | 28/43 (65%) | wired | wired | wired |
| [Virto Commerce](/svelte-commerce/backends/virto-commerce/) | 28/43 (65%) | wired | wired | wired |
| [WooCommerce](/svelte-commerce/backends/woocommerce/) | 27/43 (63%) | wired | wired | no endpoint |
| [Magento](/svelte-commerce/backends/magento/) | 26/43 (60%) | wired | wired | wired |
| [Spree](/svelte-commerce/backends/spree/) | 26/43 (60%) | wired | wired | wired |
| [X-Cart](/svelte-commerce/backends/x-cart/) | 26/43 (60%) | wired | wired | wired |
| [Shopify](/svelte-commerce/backends/shopify/) | 16/27 (59%) | wired | wired | wired |
| [EverShop](/svelte-commerce/backends/evershop/) | 25/43 (58%) | wired | wired | wired |
| [Spryker](/svelte-commerce/backends/spryker/) | 25/43 (58%) | wired | wired | wired |
| [nopCommerce](/svelte-commerce/backends/nopcommerce/) | 24/43 (56%) | wired | wired | wired |
| [PrestaShop](/svelte-commerce/backends/prestashop/) | 24/43 (56%) | wired | wired | no endpoint |
| [Sylius](/svelte-commerce/backends/sylius/) | 24/43 (56%) | wired | wired | wired |
| [Swell](/svelte-commerce/backends/swell/) | 23/43 (53%) | wired | wired | wired |
| [Bagisto](/svelte-commerce/backends/bagisto/) | 22/43 (51%) | wired | wired | wired |
| [commercetools](/svelte-commerce/backends/commercetools/) | 21/43 (49%) | wired | wired | wired |
| [OroCommerce](/svelte-commerce/backends/orocommerce/) | 21/43 (49%) | wired | wired | wired |
| [Sharetribe](/svelte-commerce/backends/sharetribe/) | 21/43 (49%) | not yet | wired | wired |
| [CS-Cart](/svelte-commerce/backends/cs-cart/) | 20/43 (47%) | wired | wired | no endpoint |
| [Shuup](/svelte-commerce/backends/shuup/) | 19/43 (44%) | wired | wired | wired |
| [Django Oscar](/svelte-commerce/backends/django-oscar/) | 15/43 (35%) | wired | wired | wired |
| [OpenCart](/svelte-commerce/backends/opencart/) | 9/43 (21%) | wired | wired | no endpoint |

</div>

The median connector wires 24 or 25 services — a little over half the surface.

## The buying path: cart, checkout, sign-in

Twenty-three of the 26 wire the cart, 25 wire checkout and 20 wire sign-in. Nineteen wire all three.

The missing sign-ins split two ways. Four platforms have nothing to sign in against: WooCommerce, where creating a customer returns no session; PrestaShop and CS-Cart; and OpenCart. A store on any of them sells by guest checkout. On Medusa and Saleor, sign-in is simply not wired yet.

The number to be most careful with is Saleor’s. It wires 28 services, more than Magento, and none of the three that take money. Medusa, at 31, is missing the cart. Svelte Commerce’s own notes say both connectors predate the current wiring pass and are next for the source check the others have had. Until then, a high score on either describes browsing, not buying.

Package versions are no better a guide. Saleor’s connector is at 1.0.3 and Medusa’s at 2.1.5, while most of the connectors that can sell are at 0.4.0 or 0.5.0.

## Where the gaps cluster

Beyond the buying path, the known gaps are features a store can often launch without, and they repeat:

- **Wishlist** — missing on 13 of the 26
- **Coupon** — 10. The source notes put the recurring problem in *lookup*: validating a code on its own, rather than applying it to a cart.
- **Vendor**, for marketplace sellers — 10
- **Reviews** — 9
- **CMS pages** — 8

Country, state, currency, address and payment-method services each go missing on five. Vendure, Broadleaf and Virto Commerce list no known gaps at all, and Litekart is the reference the others are measured against.

If your store depends on one of these features — reviews, say, or a coupon field that checks a code before checkout — read the gap list for your platform first. A 26 of 43 with your feature wired beats a 28 of 43 without it.

## Three tiers

The rule, applied mechanically. A connector is not usable yet if anything a store cannot sell without — catalogue, cart or checkout — is unwired. Of the rest, it is ready to sell if at least 26 of the 43 services are wired, and usable with work if fewer are. Sign-in is left out of the rule: where it is missing, checkout is still wired, so the store sells to guests.

**Ready to sell — 9.** Litekart, Vendure, Broadleaf, Shopware, Virto Commerce, WooCommerce, Magento, Spree and X-Cart. All but WooCommerce also wire sign-in; on WooCommerce, shoppers check out as guests. What remains is small: Shopware lacks coupon lookup, Magento lacks reviews and wishlists because neither module has a REST surface, and X-Cart lacks vendors.

**Usable with work — 13.** EverShop, Spryker, nopCommerce, PrestaShop, Sylius, Swell, Bagisto, commercetools, OroCommerce, CS-Cart, Shuup, Shopify and Django Oscar. Each wires cart and checkout; what you give up is its gap list. Shopify lands here because 59% of a smaller surface is 16 services. nopCommerce targets the API-Frontend plugin, since its core ships no REST API. Django Oscar is the thinnest, at 15 with search among its gaps, and runs against django-oscar-api, a package separate from Oscar core.

**Not usable yet — 4.** Saleor and Medusa, for the reasons above. Sharetribe has no cart by design: it is a marketplace, mapping listings to products and transactions to orders, so it does not suit a basket-and-checkout store. And OpenCart, whose core API is for admin and order management, with no product, category or search controller at all. Its 9 of 43 is the honest ceiling of that API, not a to-do list.

## The caveat that applies to all 26

Every connector was written against its platform’s authoritative source — the OpenAPI spec, the RAML, the router registration or the controller code. Where a route could not be verified it was left as an explicit placeholder rather than a guessed path. But **none has been exercised against a live production instance of its platform**. A wired service issues a request; nothing yet shows that the request is right for your version, your extensions or your data.

One qualification from this site’s own evidence: the stores on the [live projects page](/live-projects/) run Svelte Commerce against the Litekart API, the platform the shared surface is modelled on. For the other 25, treat a tier as a shortlist, not a verdict. Point a storefront at a sandbox of your platform and place test orders before you commit. If you maintain one of these platforms, a sandbox is the most useful thing you could offer the project.

## Where GoCommerce’s connector sits

GoCommerce is not one of the 26. Its connector, `@misiki/gocommerce-connector`, is early — 0.1.0 on npm — and the coverage script has not measured it, so there is no number to rank.

What it covers is the path from shelf to placed order: catalogue, cart, checkout and order lookup. It does not cover customer accounts, because GoCommerce checkout is guest checkout, and it has no search index. A service it does not map throws `UnsupportedByGoCommerce`, naming the service, rather than returning empty. No store we know of runs the pair in production.

So it sits outside the tiers: its buying path is mapped, and nothing else about it is comparable yet. The [connector status page](/gocommerce-svelte-commerce-connector/) says where it stands.

## Further reading

- [Svelte Commerce backends](/svelte-commerce/backends/) — the full table, with each connector’s known gaps.
- [Svelte Commerce](/svelte-commerce/) — the storefront, and how to switch its backend.
- [GoCommerce](/gocommerce/) — the Go backend and admin, for owning the engine as well as the storefront.
