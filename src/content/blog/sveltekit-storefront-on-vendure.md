---
title: "A SvelteKit storefront on Vendure: setup, Vendure settings and what is missing"
seoTitle: "SvelteKit Storefront for Vendure: Setup and Settings"
description: "Run a SvelteKit storefront on Vendure with Svelte Commerce: swap in the Vendure connector, set one URL, change two Vendure options. How it talks to the Shop API, and its gaps."
author: itswadesh
tags: ["SvelteKit", "Vendure", "headless commerce", "GraphQL", "Svelte Commerce"]
---

To run a SvelteKit storefront on Vendure, use [Svelte Commerce](/svelte-commerce/) with its Vendure connector: install `@misiki/vendure-connector`, set `PUBLIC_VENDURE_API_URL`, and change two settings on the Vendure server. Products, cart, checkout, sign-in, orders and addresses then come live from Vendure’s GraphQL Shop API.

This post covers why Vendure rather than Medusa or WooCommerce, the setup, the Vendure configuration, how the connector talks to the Shop API, and what does not work yet. The Svelte Commerce facts are from its repository: `docs/VENDURE.md`, `docs/CONNECTORS.md` and the published connector package, version 2.0.40. The Vendure facts are from Vendure’s documentation, linked where they are used.

## Why Vendure, and not Medusa or WooCommerce?

Because its connector is the most complete. Svelte Commerce measures each connector against a shared set of 43 services, with a script that counts a service only if it really issues a request. From `docs/CONNECTORS.md`:

<div class="tbl-scroll">

| Backend | Services wired | Cart | Checkout | Sign-in |
| :-- | :-- | :-- | :-- | :-- |
| [Vendure](/svelte-commerce/backends/vendure/) | 39 of 43 | wired | wired | wired |
| [Medusa](/svelte-commerce/backends/medusa/) | 31 of 43 | not yet | wired | not yet |
| [WooCommerce](/svelte-commerce/backends/woocommerce/) | 27 of 43 | wired | wired | no endpoint |

</div>

Medusa’s connector has no cart or sign-in wired yet, so a shopper cannot fill a basket. WooCommerce has no core endpoint for customer login: `POST /customers` creates an account but returns no session, so the connector’s sign-in throws rather than fake one. Vendure is tied with Litekart, the reference backend, for the most services wired. [Choosing a backend for a SvelteKit storefront](/blog/choosing-a-backend-for-a-sveltekit-storefront/) ranks all 26.

One caveat applies to every connector, Vendure’s included. The connectors were written against each platform’s published API, and none has yet been run against a live production instance.

## How do you set it up?

Clone the storefront, swap the stock Litekart connector for Vendure’s, and point it at your server:

```sh
git clone https://github.com/itswadesh/svelte-commerce
cd svelte-commerce
npm uninstall @misiki/litekart-connector
npm i @misiki/vendure-connector
echo PUBLIC_VENDURE_API_URL=http://localhost:3000 >> .env
npm run dev
```

Give the server’s base URL, not the GraphQL endpoint. The connector appends `/shop-api` itself, which is Vendure’s default `shopApiPath`.

Nothing in the storefront names a connector. `vite.config.ts` picks whichever `@misiki/*-connector` is installed. If you keep more than one installed, set `PUBLIC_CONNECTOR=@misiki/vendure-connector` to choose. If `PUBLIC_VENDURE_API_URL` is set while another connector is active, the server hook stops at boot with an error that says so, rather than half-working.

## What do you change on the Vendure server?

Two things, from the Svelte Commerce Vendure guide, and one more that the connector’s code implies. In `vendure-config.ts`:

```ts
// inside your existing VendureConfig
apiOptions: {
  cors: {
    origin: ['https://shop.example.com'],
    credentials: true,
  },
},
authOptions: {
  requireVerification: false,
  tokenMethod: ['bearer', 'cookie'],
},
```

**`requireVerification: false`.** Vendure’s [AuthOptions reference](https://docs.vendure.io/reference/typescript-api/auth/auth-options/) says this setting decides whether new accounts must verify their email address with a token first. The default is `true`. The Svelte Commerce guide requires `false`.

**CORS with credentials.** The browser calls Vendure directly and the connector sends `credentials: 'include'`. So `Access-Control-Allow-Origin` must be the exact storefront origin, not `*`, and `Access-Control-Allow-Credentials` must be `true`. Vendure’s [ApiOptions reference](https://docs.vendure.io/reference/typescript-api/configuration/api-options/) gives the default as `{ origin: true, credentials: true }`, which reflects any origin. If you have narrowed it for production, keep `credentials: true` and list the storefront’s origin.

**Bearer tokens.** The connector reads the `vendure-auth-token` response header and sends it back as `Authorization: Bearer <token>`. Vendure sends that header only when `tokenMethod` includes `'bearer'`. The reference gives `'cookie'` as the default, while the [storefront connection guide](https://docs.vendure.io/guides/storefront/connect-api/) shows both enabled. When bearer is on, Vendure adds the header to `Access-Control-Expose-Headers` by itself, so the browser can read it.

The connector’s cash-on-delivery path calls `addPaymentToOrder` with the method code `standard-payment`. So the server needs a payment method with that code for that path to complete.

## How does the connector talk to Vendure?

Every call is a GraphQL `POST` to `<PUBLIC_VENDURE_API_URL>/shop-api`. Both SvelteKit hooks, `hooks.server.ts` and `hooks.client.ts`, hand the URL to the connector at boot. Server rendering and the browser therefore reach the same server.

Sessions use the bearer token above. To pick a Vendure channel, the connector sets the `vendure-token` header, Vendure’s default `channelTokenKey`.

Checkout uses the standard Shop API mutations: `setCustomerForOrder`, `setOrderShippingAddress` and `setOrderShippingMethod`, then `transitionOrderToState` to move the order to `ArrangingPayment`, and `addPaymentToOrder`. It refuses to start payment on an order with no customer, because Vendure will not move such an order to `ArrangingPayment`. Vendure’s order code comes back as the storefront’s order number.

Store identity does not come from Vendure. The name, logo, currency, menus and feature switches come from `src/lib/core/connectors/default-store.json`, overridden by the default export of `kitcommerce.config.ts`. Until you override it, the store is called “Test”.

## What does not work yet?

From the Svelte Commerce Vendure guide:

- **Not implemented for Vendure**: wishlist, reviews, coupons, several currencies and regions, faceted search through Meilisearch, CMS content and multi-vendor.
- **Legal and CMS pages** render their layout with empty content, and the blog is empty.
- **The wishlist** shows an empty state, and toggling it says the wishlist is not available on this store. The cart’s coupon drawer lists no coupons.
- **No sign-in by one-time code.** Vendure has no OTP, so sign-in is email and password, which Vendure supports natively along with sign-up and password reset.
- **The search icon in the navigation is hidden** by default, because its autocomplete is Litekart’s Meilisearch. Vendure’s own search still runs the `/products` page.
- **The shopping assistant** is Litekart-only and stays hidden.

If sign-in or the cart works locally but not once deployed, it is almost always CORS: the deployed storefront’s origin is missing from Vendure’s `cors` setting. The [Vendure backend page](/svelte-commerce/backends/vendure/) lists the other errors you may see and their fixes.

## What if you want a Go backend instead?

Svelte Commerce also runs on [GoCommerce](/gocommerce/), an engine written in Go, through `@misiki/gocommerce-connector`. [Headless commerce in Go](/blog/headless-commerce-in-go/) covers that setup and its gaps, and the [modules list](/integrations/) shows the payment and shipping integrations it ships with.
