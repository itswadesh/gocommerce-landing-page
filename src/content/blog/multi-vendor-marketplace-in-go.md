---
title: "A multi-vendor marketplace in Go: the data model, and how far GoCommerce has got"
seoTitle: "Open-Source Multi-Vendor Marketplace in Go: Where It Stands"
description: "How to model sellers and offers for a multi-vendor marketplace in Go, and what GoCommerce has built: vendors, offers, scoped seller logins. Selling from an offer and payouts are not built."
author: itswadesh
tags: ["Go", "golang", "multi-vendor marketplace", "marketplace", "PostgreSQL", "GoCommerce"]
---

GoCommerce cannot run a multi-vendor marketplace yet. It has the seller side: vendor records with moderation, offers that let several sellers list one product at their own price and stock, and seller logins that see only their own rows. It does not yet sell from an offer, record the seller on the order, or pay sellers out.

That is an unusual opening for a post aimed at people searching for an open-source marketplace in Go. But the search turns up no Go project that does all of it, and the data model GoCommerce chose is worth reading if you are building one. This post covers both.

## What does a marketplace need that a shop does not?

Four things a single-merchant store never has to think about:

1. **Sellers as records**, with a state: arrived, approved, suspended.
2. **Several sellers for one product**, each with their own price and stock.
3. **Seller logins that see only their own data**, on every screen, including the ones written before sellers existed.
4. **Money split by seller**: who sold which line, the store’s commission, and a payout.

The first three are about data and access. The fourth is about orders and money, and it is the large one.

## Should the seller be a column on the variant?

No. A `variants.vendor_id` column is the simple schema, and GoCommerce’s migration notes explain why it is wrong for a marketplace. It says two sellers of the same trainers are two products. The shop then lists the trainers twice and no shopper can compare the prices.

GoCommerce uses an **offer** instead: a row that joins one vendor to one variant, with its own price and stock. From migration M47 in `core/schema.go`:

```sql
CREATE TABLE vendor_offers (
    id              bigserial PRIMARY KEY,
    vendor_id       bigint  NOT NULL REFERENCES vendors (id) ON DELETE CASCADE,
    variant_id      bigint  NOT NULL REFERENCES variants (id) ON DELETE CASCADE,
    price_minor     bigint  NOT NULL CHECK (price_minor >= 0),
    stock_on_hand   integer NOT NULL DEFAULT 0 CHECK (stock_on_hand >= 0),
    stock_reserved  integer NOT NULL DEFAULT 0 CHECK (stock_reserved >= 0),
    track_inventory boolean NOT NULL DEFAULT true,
    status          text    NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'paused')),
    CONSTRAINT vendor_offers_one_per_variant UNIQUE (vendor_id, variant_id),
    CONSTRAINT vendor_offers_reserved_within_on_hand CHECK (stock_reserved <= stock_on_hand)
);
```

(The real table also has `metadata` and timestamps.) Three choices in it are worth copying:

- **The offer is on the variant, not the product.** Sellers differ on the large size and agree on the small one, and price belongs to the sellable thing.
- **One offer per seller per variant**, enforced by a unique constraint. A seller who wants two prices for the same thing is describing two things.
- **Reserved stock cannot exceed stock on hand**, enforced by a `CHECK`. The service checks it first, and the database is the last line.

The variant keeps its own price and stock. That is the store’s own offer, the shop selling its own stock. So a store with no vendors behaves exactly as before, and the migration is additive.

## How do sellers get in, and who approves them?

A vendor row starts `pending`. Only `approved` sellers are shown to shoppers, and `suspended` keeps the row, its history and its offers while hiding them. The commission rate is stored on the vendor in basis points: 250 means 2.5%.

Public routes list what a shopper may see:

```
GET /api/vendors                 approved sellers
GET /api/vendors/{slug}          one seller's public page
GET /api/variants/{id}/offers    who sells this variant
```

The admin panel has a Vendors screen. Creating a vendor is an admin action. There is no seller self-sign-up route in the code today.

## How do you keep a seller out of everybody else’s orders?

Close every admin route to sellers by default, and open the few they need on purpose. This is the part of GoCommerce’s design most worth borrowing.

A vendor account is an ordinary operator account with the role `vendor` and a `vendor_id`. A database `CHECK` says that role and that column go together. A vendor account names exactly one vendor, and no other account names any. Without that, an account with the vendor role and no vendor would be the one every scoping rule fails open on.

Then the engine wraps every admin handler in a check that refuses vendor accounts with a 403, unless the route was mounted with `HandleVendorFunc`. Only the vendor and offer routes are, plus reading the product catalogue the seller offers against. A route somebody adds next year without thinking about sellers is closed to them. Forgetting costs a seller a 403, not a leak of every competitor’s margins.

Inside an opened route, the handler narrows the rows to the seller’s own. “Who sells this variant” returns only the seller’s own offer when a seller asks, so a competitor’s price stays hidden.

## What is not built yet?

This list is from the code and from `PLAN.md`, where marketplace settlement is item 10 on the deferred list:

- **Checkout does not sell from an offer.** The cart and checkout price and reserve stock against the variant, not against a seller’s offer. The migration says so in as many words: “Nothing sells from an offer yet.” The offer has its reserved-stock column ready for that work.
- **The order line does not record the seller.** Per-seller fulfilment and per-seller reports need it.
- **Commission is recorded, not settled.** There is no payout ledger, no settlement run and no seller statement. The Payouts report in the panel is about payment methods, not sellers.
- **One currency.** An offer is priced in the store’s currency. Sellers who price in different currencies would need a multi-currency store first, which is also deferred.

If your marketplace needs split payments through a gateway such as [Razorpay Route](https://razorpay.com/docs/payments/route/) or [Stripe Connect](https://docs.stripe.com/connect), none of that is in GoCommerce either.

## What should you do if you need a marketplace now?

If the marketplace is the product, building on GoCommerce today means writing the selling half yourself: offer-aware reservation in checkout, the vendor on the order line, and a settlement ledger. The schema and the access rules above are a sound base for it. Because a GoCommerce store is a Go program you compose, that work would be engine changes, not a module. Modules may not write the core commerce tables.

If what you actually have is one business with several shops, or an agency with a shop per client, you want something else. That is many stores from one install, which GoCommerce does run today. The [multi-store page](/solutions/multi-store/) and the post on [running many stores from one Docker Compose file](/blog/many-stores-one-docker-compose/) cover it.

The [marketplace solution page](/solutions/marketplace/) shows the seller path through the panel. [Building an ecommerce backend in Go](/blog/ecommerce-backend-in-go/) covers the checkout and stock reservation the offer would have to plug into. The [GoCommerce overview](/gocommerce/) and the [modules](/integrations/) cover the rest of the engine, and [Svelte Commerce](/svelte-commerce/) is the storefront that runs on it.
