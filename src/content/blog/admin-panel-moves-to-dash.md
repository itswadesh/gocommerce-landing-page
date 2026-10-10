---
title: "GoCommerce’s admin panel moves to /dash"
description: "Every GoCommerce admin screen now lives under /dash, and sign-in under /admin/auth. Old bookmarks and emailed links still redirect. Here is what to check."
author: itswadesh
tags: ["GoCommerce", "admin panel", "upgrading"]
---

The GoCommerce admin panel has new addresses. Every store screen now sits under `/dash`. The screens you use before you have a session — sign-in, password reset, accepting an invitation — sit under `/admin/auth`.

Old bookmarks and links already emailed still work. They redirect, and they keep their query string. The one exception is a link to a module’s screen, covered below.

The API does not move. Nothing that calls `/api` has to change.

## Where things are now

<div class="tbl-scroll">

| What | Address |
| :-- | :-- |
| Home | `/dash` |
| Any store screen | `/dash/<screen>`, such as `/dash/orders` or `/dash/orders/<id>` |
| A module’s own screen | `/dash/x/<slug>` |
| Sign in | `/admin/auth/login` |
| Reset a staff password | `/admin/auth/reset-password/<token>` |
| Accept an invitation | `/admin/auth/accept-invite/<token>` |
| Select a store | `/select-store` — reserved for the planned store switcher, not built yet |
| API reference | `/docs`, unchanged |
| The store’s bare address | `/` sends you to `/dash`, or to sign-in first |

</div>

The panel is still served at the root of the store’s address, by the same binary.

## Why

The KitCommerce admin keeps its screens under `/dash` and its sign-in at `/admin/auth/login`. GoCommerce now uses the same scheme, so a person who works in both finds orders at `/dash/orders` in each.

Most screens keep GoCommerce’s own names, so the two panels share the shape of an address, not every address. A few screens were renamed in the move; the table below lists them.

The move was also done first, before custom roles and the planned store switcher, so that later work lands on the final addresses.

## What happens to old addresses

The panel redirects old screen addresses to their new ones. The query string is kept, and so is the part after `#`. So `/orders?status=open` lands on `/dash/orders?status=open`.

<div class="tbl-scroll">

| Old address | New address |
| :-- | :-- |
| `/` | `/dash` |
| `/orders`, `/orders/<id>` | `/dash/orders`, `/dash/orders/<id>` |
| Any other screen, such as `/discounts` or `/settings/api-keys` | The same path under `/dash` |
| `/shipping` | `/dash/shipping-settings` |
| `/shipping/providers` | `/dash/shipping-settings/providers` |
| `/carts` | `/dash/checkouts` |
| `/locations` | `/dash/warehouses` |
| `/settings/superusers` | `/dash/settings/teams` |
| `/reset-password/<token>` | `/admin/auth/reset-password/<token>` |
| `/accept-invite/<token>` | `/admin/auth/accept-invite/<token>` |
| `/_` and `/_/…`, the panel’s first home | `/`, then `/dash` |

</div>

If you are signed out, you sign in first and then land on the screen you asked for. The panel carries that screen in a `next` value and follows it only to a `/dash` address on the same store. Anything else lands on `/dash`.

The live demo link on this site still fills in the demo account. The redirect to sign-in keeps the part after `#`, where those details travel.

### Which status code

The code asks for a 308, a permanent redirect. But the panel is a single-page app that never renders on the server, so the redirect happens in the browser. The engine answers the old address with the panel’s page and a 200. Then the panel’s router moves to the new address.

A person with a browser never notices. A tool that does not run JavaScript — curl, an uptime check, a link checker — sees a 200 at the old address, not a 308.

The one redirect the server sends itself is the oldest. `/_` and `/_/…` answer with a 301 to `/`, and drop the rest of the path.

## What to check

<div class="tbl-scroll">

| If you… | Do this |
| :-- | :-- |
| Pass every path to the store through a reverse proxy | Nothing. |
| Pass only some paths, or protect the panel by path | Add `/dash` and `/admin/auth` to the rule. |
| Set `GOCOMMERCE_PANEL_URL` (`Config.PanelURL`) | Nothing. Reset emails add `/admin/auth/reset-password/<token>` to it. |
| Send invitations | Nothing. `accept_url` now points at `/admin/auth/accept-invite/<token>`. |
| Link to panel screens from your own emails, docs or tools | Update them to `/dash` when convenient. Old links redirect. |
| Link to a module’s screen at `/x/<slug>` | Update it to `/dash/x/<slug>`. The engine keeps `/x` for module APIs, so opening the old address directly gets the engine’s JSON 404, not a redirect. |
| Check panel pages with curl or a monitor | Use the new address. The old one answers 200 either way. |
| Call the API from scripts | Nothing. |

</div>

## What it does not change

- **The API.** Every path under `/api`, a module’s `/x/` routes, `/health`, `/doc` (the OpenAPI document) and `/docs` (the API reference) stay where they were. The only engine code that changed is the two links it writes: invitations and staff password resets.
- **The other apps in the panel.** `/platform`, the platform console, and `/portal`, the trade portal for business buyers, do not move.
- **The screens.** Only their addresses moved. What each one shows and does is the same.

## How the mapping is held in place

One function, `dashPath` in `admin/src/lib/paths.js`, holds the whole mapping from old address to new. The same function drove the rewrite of the panel’s own links and now runs the redirects, so the two cannot disagree.

Tests pin the renames and the paths that must never move: the panel’s files, `/api`, `/docs`, `/platform` and `/portal`. They also pin the rule that `next` never leaves `/dash`. Another test fails if any link in the panel’s source still points at an old address.

## Further reading

- [The GoCommerce admin](/gocommerce/admin/) — every screen, captured from one seeded store.
- [GoCommerce](/gocommerce/) — the engine in full: its modules, its admin and the one-command start.
- [Updates](/updates/) — every change to GoCommerce, as it ships.
- [How the panel is served](https://github.com/itswadesh/gocommerce/blob/main/docs/admin-panel.md) — `docs/admin-panel.md` in the repository.
