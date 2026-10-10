---
title: "Custom reports now stay in their own store"
description: "Custom SQL reports in GoCommerce no longer run as the engine’s database login. They run as a read-only login, and on a platform each store gets its own."
author: itswadesh
tags: ["GoCommerce", "security", "PostgreSQL", "multi-store"]
---

Custom reports used to run as the engine’s own database login. Now they run as a separate login that can only read — and on a platform, each store gets a login that reaches only that store.

## What custom reports are

A custom report is a SQL query saved on the panel’s Reports screen, for questions only your shop has — which wholesale customers have not ordered since March, say.

<div class="tbl-scroll">

| Rule | Value |
| :-- | :-- |
| Who can write one | `reports.write` — only the owner role, by default |
| Who can run a saved one | `reports.read` — owner, manager and staff, by default |
| What it may be | One `SELECT` or `WITH` statement |
| Limits | 15 seconds, 1,000 rows |

</div>

Every run is a read-only transaction, always rolled back, so PostgreSQL refuses inserts, updates, deletes and schema changes. That has not changed.

## What was wrong

A read-only transaction stops writes, but not PostgreSQL’s maintenance functions, which are plain `SELECT`s. So what a report could do came down to its login — the engine’s.

- **Reach beyond the store.** In both bundled compose files, the engine’s login is a PostgreSQL superuser. A report could then end other connections, fill the disk with replication slots, or read files off the database server.
- **Other stores on a platform.** In platform mode, stores share one database, each in its own schema, and every store’s engine uses the same platform login. `search_path` only decides where unqualified names are looked up; it is not a permission. A report that named another store’s schema could read its tables, and the platform’s own.

## What changed

Reports now run on their own small connection pool, with their own login.

<div class="tbl-scroll">

| | Before | After |
| :-- | :-- | :-- |
| Login a report runs as | The engine’s own | A role granted only `SELECT` — `gocommerce_reports` by default |
| Superuser | Yes, in both compose files | No — `doctor` fails if it is |
| Ending the engine’s connections, replication slots, reading files | Allowed under a superuser | Refused by PostgreSQL |
| Platform: another store’s tables | Readable by naming its schema | Refused |
| No reports login set up | Not applicable | Reports do not run (`reports_disabled`) |
| Connections | Shared with the engine | Up to 4 per store, closed after use |

</div>

On a platform, `GOCOMMERCE_REPORTS_DATABASE_URL` is a template. Booting a store creates its own login — `reports_<store id>`, prefixed with the `-namespace` if one is set — with the template’s password and read on that store’s schema only. It belongs to no other role, so it cannot switch into another store’s. It is dropped with the store. A test proves one store’s report can neither read another’s table nor take its role.

With no reports login, the feature is off; it never falls back to the engine’s login. Saved reports stay, and saving and listing still work.

## What to do after upgrading

Custom reports stay off until you set up the login.

<div class="tbl-scroll">

| Install | Do this |
| :-- | :-- |
| New, with `docker-compose.yml` | Set `REPORTS_DB_PASSWORD` before the first start, and `GOCOMMERCE_REPORTS_DATABASE_URL` to log in as `gocommerce_reports` with it. |
| Existing single store | Run `scripts/reports-role.sql` once, then set `GOCOMMERCE_REPORTS_DATABASE_URL` (or `-reports-db`). |
| Platform | Create the template role with `-v grant_schema=no` — `docker-compose.platform.yml` does so on a fresh volume from `REPORTS_DB_PASSWORD`. The platform’s login needs `CREATEROLE`. Existing stores get their own login on the next boot. |

</div>

<div class="code-block">
<div class="code-head"><p>Turn custom reports on for an existing store</p><button class="copy" data-copy="code-reports-role">Copy</button></div>

<pre id="code-reports-role"><code><span class="cm"># once, as a superuser; add -v grant_schema=no on a platform</span>
psql <span class="s">"$DATABASE_URL"</span> -v reports_password=<span class="s">"a-strong-password"</span> -f scripts/reports-role.sql

<span class="cm"># then, for the engine</span>
GOCOMMERCE_REPORTS_DATABASE_URL=postgres://gocommerce_reports:a-strong-password@HOST:PORT/DB</code></pre>

<p class="code-note">Adapted from <code>scripts/reports-role.sql</code>. Safe to re-run, to change the password or re-grant after new tables.</p>
</div>

On a single store, if the URL is set but cannot log in, the engine will not start. On a platform, a store whose own login cannot be set up keeps serving with reports off, and the platform logs an error.

`gocommerce doctor`, and Settings → Diagnostics in the panel, now run a “custom reports” check:

<div class="tbl-scroll">

| Result | What it means |
| :-- | :-- |
| warn — “disabled: no reports database role is configured” | The feature is off. Safe. |
| warn — “custom reports run as …, the engine’s own database role” | Give reports a separate role. |
| FAIL — “the custom-reports role is a superuser” | Fix this first. |
| ok — “reports run as …, a non-superuser role” | Set up as intended. |

</div>

A warning leaves `doctor` reporting healthy. A failure makes it exit non-zero.

## Who was affected

Every tagged release up to v1.2.0 runs reports the old way. The fix is on `main` and is not in a tagged release yet. If you run a platform, build from `main` rather than wait for the next release.

- **Single-store installs.** A report could read the whole store, and still can. It loses reach beyond the store — which needed a superuser login, as in the bundled compose file.
- **Platform installs**, since v1.1.0. The same, plus one store’s report could read every other store’s data. This is the serious case: each store’s owner may be a different business.

In both, only someone holding `reports.write` could write the SQL.

## What it does not cover

- **Reading inside a store is not sandboxed.** The reports login reads every table in its store, customers’ addresses included. Give `reports.write` only to people you trust with all of it.
- **The engine’s own login is unchanged.** It is still a superuser in both compose files; reports just no longer use it.
- **One password.** On a platform, every store’s reports login shares the template’s password — the operator’s, never a store’s.
- **Names are visible.** Any login can list schemas and roles, so a report can see that other stores exist — not read them.

## Further reading

- [Multi-store](/solutions/multi-store/) — many stores from one install.
- [Operations](/features/operations/) — `doctor` and day-to-day running.
- [The fix on GitHub](https://github.com/itswadesh/gocommerce/commit/b1ab7b15320df78213ef57831256528c22963672) — code, tests and reasoning.
