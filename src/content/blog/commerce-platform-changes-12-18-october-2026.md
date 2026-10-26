---
title: "Commerce platform changes, 12–18 October 2026"
seoTitle: "Commerce platform changes, 12–18 October 2026"
description: "Shopify’s Hydrogen now works outside React, Vendure 3.8 adds MCP tools and fixes an Admin API session flaw, Shop MCP opens checkout to agents, and Saleor adds per-channel variant availability."
author: itswadesh
tags: ["Shopify", "Hydrogen", "Vendure", "Saleor", "MCP", "headless"]
---

Shopify’s Hydrogen stopped being a React framework this week. Version 2026-10 is a JavaScript library that any framework can use for carts, prices and customer accounts. Vendure 3.8 shipped MCP tools of its own, with a migration to plan for. Shopify opened its catalogue and Shop Pay checkout to AI agents through Shop MCP.

<div class="tbl-scroll">

| Date | Platform | What changed |
| :-- | :-- | :-- |
| 12 October | [Vendure 3.8](https://github.com/vendure-ecommerce/vendure/releases/tag/v3.8.0) | An MCP plugin with 42 tools (18 for the shop, 24 for the admin), encrypted secret fields, and price recalculation at checkout. It fixes a high-severity flaw in Admin API sessions. Database migrations are required. |
| 12 October | [Shopify cart webhooks](https://shopify.dev/changelog/posts/unchanged-carts-no-longer-trigger-carts-update-webhooks) | `carts/update` no longer fires when a request leaves the cart unchanged, from the Ajax API or the Storefront API. |
| 13 October | [Shop MCP](https://shopify.dev/changelog/posts/add-shopping-and-shop-pay-checkout-to-any-agent-with-shop-mcp) | One connection gives an agent catalogue search, carts and Shop Pay checkout. Search needs no API key. A purchase needs the buyer’s confirmation. There are no webhooks yet, so an agent polls `get_checkout` for status. |
| 14 October | [Hydrogen 2026-10](https://shopify.dev/changelog/blog/hydrogen-2026-10-is-now-available) | Generally available as a framework-agnostic JavaScript library. It handles carts, variants, international pricing, customer accounts and consent-aware analytics. Your framework keeps routing and rendering. Existing Hydrogen storefronts keep working. |
| 16 October | [Checkout MCP and Cart MCP](https://shopify.dev/changelog/posts/checkout-mcp-and-cart-mcp-now-support-ucp-buyer-consent) | Support UCP buyer consent, including email and SMS choices. Missing data is flagged, and it can block checkout. |
| 16 October | [Saleor 3.23.42](https://github.com/saleor/saleor/releases/tag/3.23.42) | Variant availability per channel, and translatable full descriptions for categories and collections. |

</div>

## Hydrogen outside React

Until now, Hydrogen meant a React storefront. The 2026-10 library keeps Shopify’s commerce logic and leaves the rest to your framework, so a storefront in another framework, SvelteKit included, can use it. It also bundles 20 skills for coding agents, kept in step with the library through `npx @shopify/hydrogen skills sync`.

For anyone choosing a storefront stack, the question shifts. “Which framework does the platform support?” matters less. “Which backend does the storefront depend on?” matters more. [Svelte Commerce](/svelte-commerce/) runs one SvelteKit storefront against many backends, and our [guide to choosing a backend for a SvelteKit storefront](/blog/choosing-a-backend-for-a-sveltekit-storefront/) compares them.

## Vendure 3.8: plan the upgrade

Vendure 3.8 is a release to schedule, not to drop in:

- **The session fix.** A Shop API session belonging to a user who is also an administrator could be replayed against the Admin API. After the upgrade, admins sign in again once.
- **The migrations.** One adds a unique constraint on translation tables. A store with partly cancelled order lines from before the upgrade also needs the promotion-data migration in the same deployment.
- **The new features.** MCP tools for the shop and the admin, secret fields stored encrypted, and prices recalculated at checkout.

Run the upgrade in staging first, and re-test checkout totals. Recalculating prices at checkout is the point of the change, so a total that moves is expected.

## Shop MCP: agents that can pay

Shop MCP puts search of Shopify’s catalogue, carts and Shop Pay into one agent connection. The buyer confirms every purchase. Since there are no webhooks yet, an agent has to poll for order status. Consent support arrived for Checkout MCP and Cart MCP on 16 October, and missing consent data can stop a checkout.

GoCommerce takes a different route. Its [MCP module](/gocommerce/mcp/) runs inside your own store, and an agent works with the same permissions as the API key it holds. See [an open stack for agentic commerce](/blog/agentic-commerce-open-stack/).

## Cart webhooks that stay quiet

A shopper who sends the same cart update twice no longer triggers a second `carts/update`. A cart-recovery tool that treated every webhook as a sign the shopper was still active will now see less activity. Keep “last time the shopper did something” separate from “last time the cart changed”. Then test that repeated identical updates neither duplicate a reminder nor reset its timer.

## Saleor: a listed product is not every variant

With variant availability per channel, a product can be listed in a channel while some of its variants can’t be bought there. A storefront should check the variant, not only the product, before it offers “Add to cart”.

## Sources

Every entry above links to its release or changelog post. Each was read on 26 October 2026.
