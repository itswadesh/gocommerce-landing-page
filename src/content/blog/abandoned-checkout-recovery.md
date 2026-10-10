---
title: "Abandoned checkouts: reminders that stop the moment a basket becomes an order"
seoTitle: "Abandoned Checkout Recovery in GoCommerce"
description: "GoCommerce now spots a basket left behind within minutes, sends a short run of reminder emails, and credits the order that brings it back. Here is how."
author: itswadesh
tags: ["GoCommerce", "abandoned checkouts", "cart recovery", "email"]
---

A shopper who typed their email and then left is the order closest to happening. GoCommerce’s new `cart-recovery` module notices that basket within minutes, emails the shopper a few times, and stops the moment the basket becomes an order. Then it shows you which orders it actually brought back.

## What counts as abandoned

A basket with something in it that sits untouched long enough gets a record of its own, with the items and prices as they were.

<div class="tbl-scroll">

| Type | What it means | Idle time before it counts (default) |
| :-- | :-- | :-- |
| Checkout | The shopper typed an email, which a guest does at checkout’s first step | 10 minutes |
| Cart | No email was typed | 30 minutes |

</div>

A cart can be emailed only when it carries a verified address, such as a signed-in shopper’s confirmed email. It is listed either way.

Baskets that went idle before you installed the module are shown, but the reminders never go to them — nobody wants a backlog mailed on day one.

A shopper who comes back and leaves again resumes the same record, and the next reminder waits for that visit to go quiet.

## The reminder sequence

Checkouts and carts each get a sequence: an on/off switch, the idle time, and up to five “wait, then send” steps. Each wait counts from the step before; the first from when the basket was marked abandoned.

<div class="tbl-scroll">

| Step | Checkout (default) | Cart (default) | Email it sends |
| :-- | :-- | :-- | :-- |
| 1 | 1 hour | 2 hours | `cart.recovery.1` — “You left something in your basket” |
| 2 | 20 hours | 24 hours | `cart.recovery.2` — “Still thinking it over?” |
| 3 | 48 hours | — | `cart.recovery.3` — “Last chance for the items in your basket” |

</div>

The idle time can be 1 minute to 7 days, and each wait 1 minute to 30 days. Both sequences live on Marketing › Automations; the emails’ wording is edited on Notifications › Setup Email, with the store’s other emails.

Nothing is decided early. Before every send, the module checks the basket as it is now:

<div class="tbl-scroll">

| Check | If it fails |
| :-- | :-- |
| The basket still exists | The record is marked expired |
| It has not become an order | Nothing more is sent |
| Reminders are not suppressed for it | Nothing is sent |
| The shopper has not been in it within the idle time | The step moves to when the visit counts as over |
| It has an email address | Held until the shopper comes back with one |
| At least one item can still be bought | Held until the shopper comes back to it |
| The automation is on | Held until it is switched on and saved |
| An email provider is set up | Held until one is, and the automation is saved |

</div>

A held reminder shows its reason. If the provider refuses a message, the module retries after 10 minutes, then 20. After three failed tries it stops with “sending kept failing”; saving the automation tries again.

## The link back

Where a reminder’s link goes depends on two addresses you set.

<div class="tbl-scroll">

| You set | The link | Click counted? |
| :-- | :-- | :-- |
| A storefront address and `GOCOMMERCE_PANEL_URL` | `<panel URL>/x/cart-recovery/r/<token>`, which counts the click, then `<storefront>/cart/<cart token>` | Yes |
| A storefront address only | Straight to `<storefront>/cart/<cart token>` | No |
| No storefront address | No link; the default email gives a basket reference instead | — |

</div>

If the basket was already bought or has gone, a counted link opens the storefront’s home page instead.

## How an order is credited

The engine’s `order.created` event now carries `cart_id`, the basket the order came from. The module marks that record **recovered**, with the order number and total, and notes whether any reminder — automatic or by hand — went out first. So the figures keep “recovered after a reminder” apart from “came back on their own”.

<div class="tbl-scroll">

| Status | Meaning |
| :-- | :-- |
| Abandoned | Recorded; nothing scheduled, and the reason shown |
| Scheduled | A reminder is planned |
| Contacted | At least one reminder has gone out |
| Recovered | It became an order — final |
| Suppressed | Staff stopped the reminders, with a reason |
| Expired | The basket was deleted by the store’s retention clean-up |

</div>

## What staff can do

Orders › Abandoned checkouts lists every record. A record’s page shows the basket then and now — a price that moved, a line that sold out — the address’s past orders, and a timeline of what happened and who did it.

<div class="tbl-scroll">

| Action | Right | Given by default to |
| :-- | :-- | :-- |
| See the list, records and figures | `abandonment.read` | Owner, Manager, Staff |
| Send a reminder now, copy the link | `abandonment.contact` | Owner, Manager, Staff |
| Suppress, with a reason | `abandonment.suppress` | Owner, Manager, Staff |
| Change the automation | `abandonment.automate` | Owner, Manager |

</div>

**Send now** picks one of the three emails and does not move the sequence on. **Copy link** is for pasting into a chat; it goes on the timeline, because the link opens the basket for whoever holds it. **Suppress** asks why: contacted manually, asked for no more contact, invalid customer, fraud or test, or other, with a note.

If an action cannot happen — the basket was just bought, say — the screen says why.

## The figures

Six cards sit above the list and filter with it: abandoned, potential revenue, recovery emails sent, recovered orders, recovered revenue, and the recovery rate (recovered ÷ abandoned).

Marketing › Recovery analytics adds three views:

- **A funnel:** abandoned, recoverable, emailed, link clicked, recovered. The last stage counts only orders placed after a reminder.
- **Recovered revenue over time,** by day, week or month.
- **Carts against checkouts:** abandoned, recovered and the rate for each.

## How to turn it on

<div class="tbl-scroll">

| What | How |
| :-- | :-- |
| The module | The `-recovery` flag — already on in both Docker Compose files |
| Where the basket lives | `STOREFRONT_URL`, or the automation screen, which wins |
| Counted clicks | `GOCOMMERCE_PANEL_URL`, where the store’s panel is reached (a multi-store platform uses each store’s domain) |
| An email provider | `-resend` or `-sendgrid` with its key; without one, reminders are held |

</div>

<div class="code-block">
<div class="code-head"><p>One store with recovery on</p><button class="copy" data-copy="code-recovery">Copy</button></div>

<pre id="code-recovery"><code><span class="cm"># Where the shopper's basket lives</span>
<span class="k">export</span> STOREFRONT_URL=<span class="s">https://shop.example.com</span>
<span class="cm"># The engine's public address, so clicks are counted</span>
<span class="k">export</span> GOCOMMERCE_PANEL_URL=<span class="s">https://admin.example.com</span>
<span class="cm"># An email provider; without one, nothing is sent</span>
<span class="k">export</span> RESEND_API_KEY=<span class="s">your-resend-api-key</span>

./gocommerce -recovery -resend serve</code></pre>

<p class="code-note">Flags and variables from <code>cmd/gocommerce/main.go</code>. As for any store, the database comes from <code>DATABASE_URL</code> and the admin token from <code>GOCOMMERCE_ADMIN_TOKEN</code>.</p>
</div>

For developers: the module adds no third-party dependency and sends through the store’s installed email notifier. Its admin routes are under `/api/admin/x/cart-recovery/`. The one engine change is `cart_id` on `order.created`, explained in decision D82 of `PLAN.md`.

## What it does not do yet

- **SMS or WhatsApp.** A basket carries no phone number, so these steps are listed but switched off.
- **Create a discount or notify staff** as a step. Listed, not built.
- **Chase a failed payment.** Once checkout runs, the basket is an order, and nothing reopens it.
- **Wait for payment before crediting.** A recovery counts when the order is created, so an order whose payment then fails still counts.
- **Count clicks without `GOCOMMERCE_PANEL_URL`.** The link still works; the click is not counted.

## Further reading

- [Checkout features](/features/checkout/) — abandoned checkouts beside the rest of checkout.
- [The admin panel](/gocommerce/admin/) — the screens these live in.
- [GoCommerce](/gocommerce/) — the engine and its modules.
- [The source on GitHub](https://github.com/itswadesh/gocommerce) — the module is `ext/cart-recovery`.
