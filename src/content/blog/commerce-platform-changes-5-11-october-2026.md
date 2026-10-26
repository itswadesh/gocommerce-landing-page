---
title: "Commerce platform changes, 5–11 October 2026"
seoTitle: "Commerce platform changes, 5–11 October 2026"
description: "Vendure 3.7.4 fixes an API-key escalation and overselling, Saleor fixes stock and duplicate cart lines, and Shopify sets 2 November as the end of its Global Catalog REST API."
author: itswadesh
tags: ["Vendure", "Saleor", "Shopify", "security", "inventory"]
---

The week’s most important change came from Vendure. Version 3.7.4 closes an API-key privilege escalation and stops two shoppers buying the last unit at once. Saleor fixed stock and cart bugs of the same kind. Shopify gave a firm date, 2 November, for when its Global Catalog REST API stops answering.

<div class="tbl-scroll">

| Date | Platform | What changed |
| :-- | :-- | :-- |
| 5 October | [Vendure 3.7.4](https://github.com/vendure-ecommerce/vendure/releases/tag/v3.7.4) | Fixes a high-severity API-key privilege escalation and a low-severity oversell under concurrent checkouts. Allocation is now capped at the stock available. |
| 6–9 October | [Saleor 3.23.39–3.23.41](https://github.com/saleor/saleor/releases) | Fixes wrong stock totals when two or more warehouses hold the same quantity, and duplicate checkout lines from additions sent at once. 3.23.40 carries Django’s security patches. 3.22.73 backports them. |
| 7 October | [Shopify Customer Account API](https://shopify.dev/changelog/posts/per-customer-request-limit-for-the-customer-account-api) | A limit of 3,000 requests a minute per customer per store, shared across all apps. Over it, the API answers `429` with `Retry-After`. |
| 8 October | [Shopify UI extensions](https://shopify.dev/changelog/posts/metafield-owner-types-required-for-checkout-and-customer-account-ui-extensions) | Checkout and customer-account extensions must declare a metafield’s `owner_type`. It is optional in API version 2026-10 and required in 2027-01, where a deploy without it is blocked. |
| 9 October | [Shopify Global Catalog](https://shopify.dev/changelog/posts/global-catalog-rest-api-stops-serving-traffic-on-november-2-2026) | The REST endpoints stop serving traffic on 2 November 2026. The replacement is Global Catalog MCP, which implements UCP. |
| 9 October | [Shopify Catalog API](https://shopify.dev/changelog/posts/catalog-api-now-returns-compare-at-prices-as-list_price) | Compare-at prices now come back as an optional `list_price` per variant, and `list_price_range` per product. |

</div>

## Vendure: two buyers, one unit

The oversell fix is the one most stores should copy into their tests. Two checkouts arrive together for the last unit, and both see one in stock. If the check and the write are separate steps, both succeed. Vendure 3.7.4 now caps allocation at the stock available and locks the rows it reads. When a checkout comes up short, it raises a `StockShortfallEvent`.

The API-key fix matters wherever more than one person administers a store. A lower-privileged admin could manage keys belonging to a higher-privileged one. Upgrade, and check any custom stock strategy before you do, because allocation behaviour changed.

GoCommerce reserves stock in a single statement. The `UPDATE` that adds to `reserved` only matches while `on_hand - reserved` covers the quantity. A second checkout for the last unit re-checks that condition after the first one commits, matches no row, and gets an out-of-stock answer. The [inventory notes](https://github.com/itswadesh/gocommerce/blob/main/skills/inventory.md) explain why a read followed by a write would sell the same unit twice.

## Saleor: stock across warehouses, and repeated clicks

Both Saleor bugs come from the same everyday events: a shopper tapping “Add to cart” several times, or a product stocked in more than one warehouse. They are worth testing against any backend:

- Send several identical add-to-cart requests at once. The cart should hold one line with the right quantity.
- Stock two warehouses with the same quantity. The total should be the sum, not one of them.

## Shopify: one deadline, and some housekeeping

If anything you run calls `discover.shopifyapps.com/global/`, that call stops working on 2 November. Move it to Global Catalog MCP before then. Saved-catalog requests are included.

The other Shopify changes affect apps and headless storefronts built on Shopify:

- A client of the Customer Account API should obey `Retry-After` rather than retry at once. The limit is shared by every app on the store.
- An extension targeting API version 2027-01 needs an explicit `owner_type` on each metafield it declares.
- A storefront that shows a “was” price can now read it from `list_price`, in the buyer’s market.

## Sources

Every entry above links to its release or changelog post. Each was read on 26 October 2026.
