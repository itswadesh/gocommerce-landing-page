---
title: "Building an ecommerce backend in Go: the parts that are hard"
seoTitle: "Building an Ecommerce Backend in Go"
description: "What an ecommerce backend in Go has to get right: integer money, variants, stock reserved inside checkout, idempotent orders, verified webhooks and an outbox."
author: itswadesh
tags: ["Go", "golang", "ecommerce backend", "PostgreSQL", "GoCommerce"]
---

An ecommerce backend in Go is a PostgreSQL schema plus a few state changes that must never half-happen: reserving stock, placing an order once, recording a payment, and telling the rest of the system about it. Go’s standard library covers the plumbing. HTTP, JSON, HMAC and SQL are all in it. The work is in the domain.

This post walks through those hard parts in the order a request meets them. Each section shows how [GoCommerce](/gocommerce/), an MIT-licensed engine written in Go, handles it, with the file to read. The last section says where GoCommerce stops, so you can decide whether to build on it or write your own.

## What does the backend have to own?

Seven things, and they are tightly connected: products and their variants, inventory, carts, checkout, orders, payments and fulfillment. Checkout alone touches carts, stock, orders, payments and events in one transaction.

That connection is why GoCommerce keeps the whole domain in one Go package, `core/`. Its architecture notes say plainly that splitting a commerce domain into packages produces import cycles, which then get broken with interfaces that exist only to break them. Integrations live outside, in `ext/`, as separate packages. Go’s visibility rules then stop them reaching into the engine’s internals.

## How should a Go backend store money?

Store money as an integer number of minor units plus a currency code. Never use a float, and never a formatted string. GoCommerce sends every amount as:

```json
{ "amount_minor": 1999, "currency": "USD" }
```

The decimal places belong to the currency and the symbol belongs to the reader, so neither is stored. A percentage gets the same care. A discount or a commission is stored in basis points, so 250 means 2.5% and cannot drift the way 0.025 can.

## Why make the variant the thing you sell?

A shopper buys a size and a colour, not a product. Make the variant the sellable unit. It carries the SKU, the price, the stock and the order lines. A product with no options still gets one default variant. Then the simple case uses the same tables as the complex one, and nothing has to be migrated when a shop adds sizes later.

Enforce the rule in the database. In GoCommerce each variant stores its normalised option selection in `option_key`, and a unique index on `(product_id, option_key)` stops two variants claiming the same combination (`core/schema.go`).

## How do you stop two shoppers buying the last unit?

Reserve stock inside the checkout transaction, and lock rows in a fixed order. GoCommerce’s checkout sorts the cart lines by variant id before it touches stock. Two checkouts that share variants then take their locks in the same order and cannot deadlock each other (`core/checkout.go`).

In the same loop it compares each line’s price in the cart with the variant’s price now. If they differ, the line is not charged. The checkout returns a conflict naming the line, the reason (`price_changed`, `inactive` or `insufficient_stock`) and the current price, and the storefront shows the shopper the new figure before anything is taken.

## How do you make checkout safe to retry?

Make the client send an `Idempotency-Key` header, store a hash of the request beside the key, and answer a repeat with the first result. A phone that loses signal after tapping Pay will retry, and the retry must not place a second order. GoCommerce refuses a reused key that arrives with a different request, and refuses a second request while the first is still running.

The other rule is to never hold a database transaction open across a network call. GoCommerce commits the order first, then asks the payment gateway. A gateway having a slow day must not become the database having a slow day.

## How does an order learn it was paid?

From the gateway’s webhook, verified before anything is believed. The gateway signs the raw request body with a secret you share, and you recompute the signature over the exact bytes you received. [Verifying a Razorpay webhook in Go](/blog/razorpay-webhook-verification-in-go/) shows the code, the duplicate handling and the mistakes to avoid.

Every source of “paid” then goes through one function. In GoCommerce a REST call, a webhook, a CSV import, an MCP tool call and an admin action all end in the same domain service, `Payments.MarkPaid` for a payment. It refuses to mark a refunded or cancelled order paid, and a webhook replayed after the order is already paid changes nothing.

## How do you make sure an event is never lost?

Write the event in the same transaction as the change it describes, into an outbox table, and publish it after the commit. If the process dies between committing an order and announcing it, you keep the order and lose the announcement, and nothing notices. With an outbox, the announcement is a row that is still there after a restart.

GoCommerce’s dispatcher claims unsent rows with `FOR UPDATE SKIP LOCKED`, so several instances never deliver the same row at once (`core/outbox.go`). Delivery is at least once. A handler must therefore be safe to run twice, which [docs/events.md](https://github.com/itswadesh/gocommerce/blob/main/docs/events.md) states as part of the contract.

## What does this look like as Go code?

In GoCommerce a store is a small Go program. You pass the engine its configuration and the modules you want, and anything a module needs is visible in `main()`. This one takes Razorpay payments and adds a module of its own that logs every paid order:

```go
package main

import (
	"context"
	"log"
	"os"

	"github.com/itswadesh/gocommerce/core"
	razorpay "github.com/itswadesh/gocommerce/ext/payments-razorpay"
)

// paidLog writes a line for every paid order.
type paidLog struct{}

func (paidLog) Name() string                       { return "paid-log" }
func (paidLog) Migrations() []gocommerce.Migration { return nil }

func (paidLog) Register(app *gocommerce.App) error {
	logger := app.Log()
	app.Subscribe("order.paid", func(ctx context.Context, e gocommerce.Event) error {
		var o gocommerce.OrderEvent
		if err := e.Decode(&o); err != nil {
			return err
		}
		logger.Info("order paid", "number", o.Number, "total_minor", o.TotalMinor, "currency", o.Currency)
		return nil
	})
	return nil
}

func main() {
	app, err := gocommerce.New(
		gocommerce.Config{
			DBURL:       os.Getenv("DATABASE_URL"),
			Currency:    "INR",
			AdminTokens: []string{os.Getenv("GOCOMMERCE_ADMIN_TOKEN")},
		},
		razorpay.New(razorpay.Config{
			KeyID:         os.Getenv("RAZORPAY_KEY_ID"),
			KeySecret:     os.Getenv("RAZORPAY_KEY_SECRET"),
			WebhookSecret: os.Getenv("RAZORPAY_WEBHOOK_SECRET"),
		}),
		paidLog{},
	)
	if err != nil {
		log.Fatal(err)
	}
	log.Fatal(app.ListenAndServe())
}
```

The import path is `github.com/itswadesh/gocommerce/core` and the package is named `gocommerce`, so the code reads as above. A module is any value with `Name`, `Migrations` and `Register`. It may own tables of its own and mount routes under `/x/<name>/`. It may not write the engine’s commerce tables, so it calls a service such as `app.Pay().MarkPaid` instead. [Writing a module](https://github.com/itswadesh/gocommerce/blob/main/docs/writing-a-module.md) lists what `Register` can do. The Razorpay module above is one of the [modules on the integrations page](/integrations/payments-razorpay/).

The only production dependency is `github.com/jackc/pgx/v5`. A CI job fails the build if `go.mod` gains another one, or if anything under `ext/` imports a package outside the standard library and the engine. So the payment, shipping and email modules talk to their vendors over `net/http`, with no SDKs.

## Where does GoCommerce fall short?

These are the limits a backend developer meets first, from the repository as it is today:

- **PostgreSQL only.** The SQLite plan was archived (`docs/PLAN-r2-sqlite-archived.md`). You need PostgreSQL 16 or later.
- **One currency per store.** A store settles in one currency and every order records it. Multi-currency is on the deferred list in `PLAN.md`.
- **REST only.** The API is JSON over HTTP, described by an OpenAPI document served at `/doc`. There is no GraphQL.
- **The admin panel takes the root path.** The same binary serves the API and the panel, so it cannot also serve a storefront at `/`. The storefront runs as its own application. [Headless commerce in Go](/blog/headless-commerce-in-go/) covers how the two connect.
- **Marketplace settlement is not built.** Sellers and their offers exist, but nothing pays sellers out. [The marketplace post](/blog/multi-vendor-marketplace-in-go/) has the detail.
- **A young project.** The first commit is from 31 August 2026. The repository has 259 test files, but no public case study yet.

## Build it yourself, or start from an engine?

If your shop has one product and one gateway, a few hundred lines of Go over PostgreSQL will do, and the sections above are the checklist. Past that, you will rebuild stock reservation, idempotency, webhook handling and an outbox, and they are easy to get subtly wrong. GoCommerce is one way to skip that. Its code is short enough to read before you trust it.

To try it, start with the [GoCommerce overview](/gocommerce/), the [modules](/integrations/) and the [quick start in the README](https://github.com/itswadesh/gocommerce#quick-start). For a storefront in front of it, [Svelte Commerce](/svelte-commerce/) is a SvelteKit storefront with a GoCommerce connector.
