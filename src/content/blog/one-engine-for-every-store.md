---
title: "Planned: one GoCommerce engine for every store"
description: "GoCommerce plans to merge platform mode into the ordinary engine: one set of tables where every row carries its store, row security as the net, one sign-in and a store switcher. What changes, and what does not."
author: itswadesh
tags: ["GoCommerce", "multi-store", "multi-tenant", "roadmap"]
---

This is a plan, not a release. Nothing below is in a tagged version yet, and the details may move while it is built.

Today GoCommerce runs two ways. `gocommerce serve` runs one store. [Platform mode](/blog/many-stores-one-docker-compose/) runs many, each in a PostgreSQL schema of its own. Two ways means two deploys, two upgrade paths, and features that reach one before the other. The plan is to keep one: every install serves as many stores as it holds.

## What changes

<div class="tbl-scroll">

| Today | Planned |
| :-- | :-- |
| `serve` for one store, `platform` for many | `serve` for any number of stores. The `platform` command and `docker-compose.platform.yml` go away. |
| A PostgreSQL schema per store | One set of tables. Every row carries a `store_id`. |
| A sign-in per store | One sign-in. A person belongs to any number of stores, with a role in each. |
| Find a store by its address | Its address still works. A store can also be named in a header, a cookie or a `?store=` parameter. |
| Slugs, SKUs and codes unique per install | Unique per store. Two stores can both sell `TEE-01`, and each numbers its orders from `GC-000001`. |

</div>

## How stores stay apart

A shared table is only as safe as the query that forgets its filter. So there are two layers, and the second does not trust the first.

<div class="tbl-scroll">

| Layer | What it does |
| :-- | :-- |
| Every statement names its store | Each query filters by `store_id`, and each insert sets it. A test reads the source and fails the build on any statement that does not. |
| PostgreSQL row security | Every store table carries a policy that shows and accepts only the current store’s rows. A query that forgot its filter gets no rows, not someone else’s. |
| Links stay inside a store | Foreign keys include the store, so the database refuses a cart line in one store that points at a product in another. |
| The engine cannot switch it off | Row security does not apply to superusers, so the engine signs in as an ordinary login. `gocommerce doctor` fails if it does not. |

</div>

Custom SQL reports run SQL the merchant writes, and that SQL could try to name a different store. They are switched off until each store gets a reporting login of its own that the policy is tied to.

## Moving between stores

The account menu at the foot of the admin sidebar becomes a store switcher. It lists your stores and your role in each.

Switching keeps your place. From Orders you land on the new store’s Orders, with your filters kept. From a single order you land on the new store’s order list, because that order belongs to the store you left. If your role in the new store cannot open the page, you land on the dashboard and are told why.

Each browser tab keeps its own store. Switch in one tab, and a form open in another still saves to the store it was opened in.

## Upgrading

<div class="tbl-scroll">

| You run | What happens |
| :-- | :-- |
| A single-store install, any 1.x | It upgrades in place and becomes store #1. No ids or order numbers change, and clients send nothing new. |
| Platform mode, 1.1 or 1.2 | It is not converted automatically. The release notes will say how to move. |

</div>

## Order of work

<div class="tbl-scroll">

| Part | Contents |
| :-- | :-- |
| 1. Foundation | Stores, `store_id` on the core tables, row security, how a request finds its store, background work per store |
| 2. Modules | The same for every installable module’s tables |
| 3. Accounts and stores | One sign-in, store creation, the store switcher |
| 4. The rest | Custom domains with DNS checks, deleting a store, media and search per store, reports back on |

</div>

Parts 1 and 2 ship together. A half-converted engine would keep some tables per store and leave others shared, so they are released in one step. Each part gets its own entry on [the updates page](/updates/) when it lands.
