---
title: "Run many stores from one Docker Compose file"
description: "GoCommerce’s platform mode runs many stores from one process and one PostgreSQL database. What the Compose file starts, what is shared, and what is missing."
author: itswadesh
tags: ["GoCommerce", "multi-store", "Docker Compose", "self-hosting"]
---

An agency with a shop per client, or a supplier with a store per dealer, can host them two ways: one install per store, each upgraded on its own, or one install that holds them all.

GoCommerce does the second in what it calls platform mode, and the repository now ships `docker-compose.platform.yml` to start it with one command. If your “stores” are one merchant’s storefronts over one catalogue, you want channels instead — the [multi-store page](/solutions/multi-store/) explains both.

## What platform mode is

`gocommerce platform` serves many stores from one process and one PostgreSQL database. Each store is an ordinary GoCommerce store, with its own operators, admin panel, API, background work and modules. Nothing in the engine knows it is one of many.

<div class="tbl-scroll">

| Question | Answer |
| :-- | :-- |
| How are stores kept apart? | A PostgreSQL schema per store, `store_<slug>`, not a `store_id` column a query could forget. Each store’s engine is pointed at its own schema. |
| Where is the list of stores? | In the platform’s own schema, `gocommerce_platform`: stores and their domains. |
| How does a request find its store? | By the host it was sent to: `<slug>.<base domain>`, or a custom domain attached to the store. An unknown host gets a JSON 404. |
| How is a store created? | From the console or the platform API, all or nothing: schema, migrations, first owner and domains. |
| Who manages stores? | Whoever holds the platform token. It opens no store’s admin API, and no store’s token opens the platform. |

</div>

## What the Compose file starts

Two services and two volumes, with the same names as the single-store `docker-compose.yml`.

<div class="tbl-scroll">

| Piece | What it is |
| :-- | :-- |
| `gocommerce` | The engine, built from the repository’s `Dockerfile` and run as `platform`, on port `${PORT:-8080}`. |
| `postgres` | `postgres:17-alpine`. The engine waits for its health check before starting. |
| `media` volume | Uploads, at `/data/media`. Each store writes to its own folder, `/data/media/<slug>`. |
| `pgdata` volume | The database: every store’s schema, and the platform’s. |

</div>

The engine starts with 20 module flags — the same list as the single-store file: `-identity`, `-webhooks`, `-menus`, `-reviews`, `-contact`, `-newsletter`, `-resend`, `-sendgrid`, `-twilio`, `-msg91`, `-invoices`, `-cms`, `-faq`, `-wishlist`, `-gateways`, `-carriers`, `-feeds`, `-sitemaps`, `-b2b` and `-recovery`. Each one sits idle until a store configures it. `-import-amazon` is left out because it drives a real Chrome, and `-meilisearch` and `-klaviyo` are not in the list either.

## Bring it up

Compose refuses to start without these three variables, and the platform token must be at least 16 characters.

<div class="code-block">
<div class="code-head"><p>Start the platform</p><button class="copy" data-copy="code-platform-up">Copy</button></div>

<pre id="code-platform-up"><code>git clone https://github.com/itswadesh/gocommerce
cd gocommerce
POSTGRES_PASSWORD=... \
GOCOMMERCE_PLATFORM_TOKEN=... \
GOCOMMERCE_BASE_DOMAIN=shops.example.com \
docker compose -f docker-compose.platform.yml up --build</code></pre>

<p class="code-note">From <code>docker-compose.platform.yml</code>. Set <code>GOCOMMERCE_PLATFORM_HOST</code> to put the console somewhere other than <code>platform.shops.example.com</code>.</p>
</div>

Then point `*.shops.example.com` at the server. One wildcard DNS record covers the console and every `<slug>` address.

## Add a store

Open the platform host in a browser. `/` goes to the console at `/platform`. Sign in with the platform token and choose “New store”.

Or call the platform API. Sending the `Host` header yourself works before DNS does:

<div class="code-block">
<div class="code-head"><p>Create a store, then attach its own domain</p><button class="copy" data-copy="code-platform-store">Copy</button></div>

<pre id="code-platform-store"><code>curl -X POST http://127.0.0.1:8080/api/platform/tenants \
  -H "Host: platform.shops.example.com" \
  -H "Authorization: Bearer $GOCOMMERCE_PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"slug": "acme", "name": "Acme", "owner_email": "owner@acme.example", "currency": "EUR"}'

curl -X POST http://127.0.0.1:8080/api/platform/tenants/acme/domains \
  -H "Host: platform.shops.example.com" \
  -H "Authorization: Bearer $GOCOMMERCE_PLATFORM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"domain": "shop.acme.example"}'</code></pre>

<p class="code-note">Routes from <code>platform/http.go</code>. The full contract is at <code>GET /api/platform/doc</code>.</p>
</div>

The first response holds the store, its own admin token and — if you gave no password — the owner’s generated one. Both are shown once. The store’s admin panel and API answer at `acme.shops.example.com` straight away.

Slugs `platform`, `api`, `www` and `admin` are reserved, and a custom domain cannot sit under the base domain. A suspended store answers 503. A store can be deleted only once suspended, with its slug repeated as `?confirm=acme`.

## What stores share, and what they do not

<div class="tbl-scroll">

| | Shared | Per store |
| :-- | :-- | :-- |
| Process | One process, one binary | Its own engine inside it, with its own background work |
| Database | One PostgreSQL database | Its own schema, and a connection pool of up to 4 |
| Admin panel | The same build | Its own operators and sign-in, on its own host |
| Admin token | — | Its own, minted at creation, opening this store and no other |
| Modules | The same 20 flags for every store | Each module’s settings, such as keys on the Plugins screen |
| Provider keys you add to the environment, like `RESEND_API_KEY` | Used by every store | Until a store sets its own on its Plugins screen |
| Currency and languages | Defaults from the flags | Can be set when the store is created |
| Media | One `media` volume | Its own folder |
| Custom SQL reports | One template login, `GOCOMMERCE_REPORTS_DATABASE_URL` (off when unset) | Its own read-only login, granted only its own schema |

</div>

## One store or many

<div class="tbl-scroll">

| | `docker-compose.yml` | `docker-compose.platform.yml` |
| :-- | :-- | :-- |
| Command | `serve` | `platform` |
| Stores | One | As many as you create |
| Tables | The `public` schema | `store_<slug>` per store, plus `gocommerce_platform` |
| Required variables | `POSTGRES_PASSWORD`, `GOCOMMERCE_ADMIN_TOKEN`, `GOCOMMERCE_ADMIN_PASSWORD` | `POSTGRES_PASSWORD`, `GOCOMMERCE_PLATFORM_TOKEN`, `GOCOMMERCE_BASE_DOMAIN` |
| First operator | From `GOCOMMERCE_ADMIN_EMAIL` and `GOCOMMERCE_ADMIN_PASSWORD` | The owner email given when the store is created |
| Address | Whatever host reaches port 8080 | `<slug>.<base domain>`, or an attached domain |
| Uploads | `/data/media` | `/data/media/<slug>` |
| Services and volumes | `gocommerce`, `postgres`; `media`, `pgdata` | The same names |

</div>

The names match on purpose: point an existing single-store deployment at the platform file and its volume is kept. Its tables stay in the `public` schema, untouched. The platform creates its stores beside them, and does not serve the old one.

## What it does not do yet

- **No TLS.** The Compose file serves plain HTTP, on port 8080 by default, and has no proxy. Put one in front. For custom domains, have it ask `GET /api/platform/tls/allowed?domain=` before issuing a certificate — Caddy’s `on_demand_tls` does this.
- **No per-store module choice.** Every store runs the modules the process started with.
- **No per-store backup.** One `pg_dump` covers every store, because they share a database. There is no command to back up or restore one store. Back up the `media` volume too.
- **No sign-up or billing.** Only the platform token creates stores, and there are no plans, quotas or invoices for them.
- **Connections are yours to watch.** Every store’s pool can take four connections, and no flag changes that. The Compose file runs PostgreSQL with its default settings, so raise `max_connections` or add PgBouncer as stores grow.

Migrations run store by store when the process starts. A store that fails to start answers 503, and the console counts it under “failed to start”.

## Further reading

- [Multi-store](/solutions/multi-store/) — channels for one merchant’s storefronts, and platform mode for many stores.
- [GoCommerce](/gocommerce/) — the engine, its modules and its admin panel.
- [Platform mode in the repository](https://github.com/itswadesh/gocommerce/blob/main/skills/infrastructure.md#running-many-stores-platform-mode) — the full guide.
