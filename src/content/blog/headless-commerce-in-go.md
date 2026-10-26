---
title: "Headless commerce in Go: an API engine and a storefront you choose"
seoTitle: "Headless Commerce in Go (Golang): API Engine + Storefront"
description: "Headless commerce in Go with GoCommerce: a REST API and OpenAPI contract, guest carts by token, CORS or a proxy, and a SvelteKit storefront that plugs in."
author: itswadesh
tags: ["Go", "golang", "headless commerce", "REST API", "SvelteKit", "GoCommerce", "Svelte Commerce"]
---

Headless commerce in Go means a Go service that owns the catalogue, carts, orders and payments behind an HTTP API, while the storefront is a separate application in whatever framework you like. [GoCommerce](/gocommerce/) is built that way. One Go binary and one PostgreSQL database answer `/api/...`, and the shop window is yours.

This post covers what the API gives a storefront, how a browser on another origin reaches it, and which pieces are still missing. The storefront examples use [Svelte Commerce](/svelte-commerce/), a SvelteKit storefront with a GoCommerce connector, but any HTTP client works.

## What does a headless storefront need from the API?

Four flows: browse the catalogue, keep a basket, check out, and show the order afterwards. In GoCommerce they map onto these public routes:

```
GET  /api/products             /api/products/slug/{slug}
GET  /api/categories           /api/collections
POST /api/carts                /api/carts/{cartId}/line-items
POST /api/checkout/{code}      the payment method's code: cod, razorpay, stripe…
GET  /api/orders/{number}?token=…
```

A guest needs no account. Creating a cart returns its `id`, and that id is the cart’s token, the only credential a guest holds. Checkout takes the cart and an email address. The `identity` module adds shopper accounts on top, and the project’s rule is that it may never make an account required.

Every response has one of two shapes, `{"data": ...}` or `{"error": {"code", "message"}}`, including 404s. A client that decodes JSON never meets a plain-text error page. Money is always an integer and a currency, `{"amount_minor": 1999, "currency": "USD"}`, so the storefront formats prices for its own locale.

## Is the API documented?

Yes, by the server itself. `GET /doc` returns the OpenAPI document for the build that is running, and `GET /docs` is a browsable reference. A test fails if a route the engine mounts is missing from `/doc`, so the contract cannot drift from the code.

Lists paginate either way: `?limit=20&offset=40` or `?limit=20&page=3`. The `meta` block reports both, plus `total` and `total_pages`, so a pager needs no arithmetic.

## How does a browser on another origin call it?

You have two options, and the choice is about deployment, not code.

**Allow the origin.** Set `GOCOMMERCE_CORS_ORIGINS` (or `Config.CORSOrigins` in Go) to the storefront’s origin, for example `https://shop.example.com`. The engine then answers preflights and sets `Access-Control-Allow-Origin` for that origin. It never allows credentials. Storefront sessions travel as bearer tokens that the page sets on purpose, so a cookie the browser would attach on its own is never involved. With the setting empty, which is the default, the engine sends no CORS headers at all.

**Proxy a path.** Serve a path on the storefront’s own origin, such as `/gocommerce/`, from the engine. The GoCommerce connector’s README shows the Caddy and nginx lines, and the connector reads the path from `PUBLIC_GOCOMMERCE_PROXY_PATH`. Server-side rendering keeps calling the engine directly either way.

## Where does the admin panel go?

It ships inside the same binary, as a SvelteKit app compiled to static files and embedded with `go:embed`. It is a client of the same public API and has no private endpoints, so anything the panel does, `curl` can do.

The panel owns `/`, because the API lives under `/api`. So the engine cannot also serve your storefront at the root. Give the storefront its own origin, or put a proxy in front. If you want an API-only binary, build with `-tags no_admin`. That leaves the root free and carries no JavaScript.

## How do you plug in a storefront?

With Svelte Commerce, you swap its stock connector for GoCommerce’s and point it at the engine:

```sh
npm uninstall @misiki/litekart-connector
npm i @misiki/gocommerce-connector
echo PUBLIC_GOCOMMERCE_API_URL=https://api.shop.example >> .env
```

Start the engine with the modules the storefront has screens for, for example:

```sh
gocommerce -identity -wishlist -reviews -cms -faq -menus serve
```

The flags go before the command, because Go’s `flag` package stops reading at the first word that is not a flag. Each one is optional. Without `-identity` there is no sign-in, though guest checkout still works. Without `-reviews` products show no stars. The [connector page](/gocommerce-svelte-commerce-connector/) maps each storefront service to the engine route it calls, and [the GoCommerce and Svelte Commerce stack](/go-svelte-ecommerce/) shows how the two fit together.

To use your own frontend instead, call the routes above from it. The connector’s source is a working reference for every flow.

## What is missing?

The connector’s README keeps a list of the places where the storefront and the engine do not meet yet. These are the ones you will notice first:

- **The cart shows no tax.** The engine works out tax when the order is placed, not on the cart. The basket shows subtotal minus discount plus delivery, and the order shows the real figures.
- **No search facets.** Search returns hits and a total, not distributions, so category facets and the price slider are not shown.
- **Attribute filters work on the whole-shop listing only**, not inside a category.
- **Payment flows are partial.** Cash on delivery and Razorpay’s checkout modal work directly. GoCommerce’s Stripe uses a Payment Element, which this storefront does not mount.
- **A guest’s order-success page shows no details.** A guest order is readable only with the access token that checkout returned, which stays in the browser that placed the order.

On the engine side, the API is REST only, with no GraphQL, and a store settles in one currency.

## Is Go a good fit for this?

For the engine, yes, for one practical reason. The whole store, its modules and its admin panel compile into one binary, with `pgx` as the only production dependency. Deploying it means copying a file and giving it a database URL. The storefront is a different job with different tools, which is the point of going headless.

Next: [building an ecommerce backend in Go](/blog/ecommerce-backend-in-go/) covers what happens inside the engine during checkout, and the [modules list](/integrations/) shows the payment, shipping and email integrations you can add.
