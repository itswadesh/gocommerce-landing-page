---
title: "Custom roles, and adding team members by email"
description: "A GoCommerce store can now make, rename and delete its own roles, and add people to its team by email. What a role can do, who can grant it, and the gaps."
author: itswadesh
tags: ["GoCommerce", "admin panel", "roles and permissions", "team"]
---

A GoCommerce store used to have four fixed roles. You could change what Manager and Staff were allowed to do, but you could not add a role of your own. If you wanted a “Packer” or a “Content editor”, you bent Staff into one.

Now a store can make its own roles, rename any role and delete the ones it does not use. The Team screen adds people the way the KitCommerce admin does: an email, a role, then a choice of how they join.

## What a role is

A role is a name plus a set of rights. A right is one thing a person may do, written as `area.verb`: `orders.refund`, `catalog.write`, `team.read`. The core has 48 of them, and a module can bring its own — the reviews module adds `reviews.moderate`, for example.

Each person on the team holds one role. A change to it takes effect on their next request; nobody has to sign in again.

## The roles a store starts with

<div class="tbl-scroll">

| Role | What it can do by default | Change its rights? | Delete it? |
| :-- | :-- | :-- | :-- |
| Owner | Everything, including deciding who else can | No | No |
| Manager | Products, stock, discounts, prices, orders and refunds, customers, reports. Not the team, roles, tax or shipping settings, plugins, import or export | Yes, and reset to defaults | Yes, once nobody holds it |
| Staff | Sees the shop and moves orders along. No refunds, no price changes, no access changes | Yes, and reset to defaults | Yes, once nobody holds it |
| Vendor | Nothing until you grant it. A seller only ever sees their own offers and the orders that carry them | Yes, and reset to defaults | No |
| Your own | Whatever you grant, plus `catalog.read` | Yes | Yes, once nobody holds it |

</div>

Every role, Owner included, can be renamed and given a description. The key underneath — `owner`, `staff` — never changes.

## Making a role

Go to Settings → Roles and press **Add role**. Give it a name and, if you like, a description. Before you save, the panel shows the key it will use: “Content editor” becomes `content_editor`. The key is permanent, because it is written on everyone in the role.

Saving opens the role’s own page, where you pick its rights. A new role starts with `catalog.read`, which every role keeps: a role that cannot see the catalogue can sign in and do nothing.

The same works from a script:

<div class="code-block">
<div class="code-head"><p>Make a role through the API</p><button class="copy" data-copy="code-make-role">Copy</button></div>

<pre id="code-make-role"><code>curl -X POST https://your-store.example/api/admin/roles \
  -H <span class="s">"Authorization: Bearer $GOCOMMERCE_ADMIN_TOKEN"</span> \
  -H <span class="s">"Content-Type: application/json"</span> \
  -d <span class="s">'{"key": "packer", "title": "Packer", "rights": ["orders.read", "orders.fulfill"]}'</span></code></pre>

<p class="code-note">The key must match <code>^[a-z][a-z0-9_]{0,39}$</code>, and the reply is the new role with <code>catalog.read</code> added. From <code>skills/team.md</code> and <code>core/roles.go</code>.</p>
</div>

<div class="tbl-scroll">

| Route | What it does | Right needed |
| :-- | :-- | :-- |
| `GET /api/admin/roles` | Every role, its rights and how many hold it | `roles.write` |
| `POST /api/admin/roles` | Make a role | `roles.write` |
| `PUT /api/admin/roles/{role}` | Replace a role’s rights | `roles.write` |
| `PATCH /api/admin/roles/{role}` | Rename it, or change its description | `roles.write` |
| `POST /api/admin/roles/{role}/reset` | Put a starting role back on its defaults | `roles.write` |
| `DELETE /api/admin/roles/{role}` | Delete a role nobody holds | `roles.write` |
| `GET /api/admin/roles/names` | Role names, for screens that assign one | `team.read` |

</div>

One change for scripts: `DELETE /api/admin/roles/{role}` used to reset a role. It now deletes it. Resetting is `POST …/reset`.

## Who can grant what

Two rights control access, and they are kept apart on purpose:

- `roles.write` decides what a role means — which rights it carries.
- `team.write` decides who holds which role: adding, removing and moving people.

By default only Owner has either. Grant them with care: a role with `roles.write` can widen itself, and a person with `team.write` can make someone an owner. The engine does stop one mistake — you cannot remove `roles.write` from your own role and lock yourself out.

## Adding a team member

Go to Settings → Team and press **Add team member**. Enter an email and pick a role. Your own roles are in the list. Vendor is not, because a seller’s login is made from that seller’s page.

If the address is already on the team, the panel says so and stops. Otherwise a “User Account Not Found” dialog asks how they should join:

<div class="tbl-scroll">

| Choice | What happens |
| :-- | :-- |
| Create Account | You set a password of at least 8 characters. The account exists at once, and you tell them the password. |
| Send Invite | The engine makes a one-time link. They open it, choose their own password and are signed in. |

</div>

About that link:

- It works for 7 days.
- It is shown once. The store keeps only a hash of it, so copy it before you close the drawer. **Resend** makes a fresh one.
- A new invitation to the same address cancels the old link.
- If two people open the same link at once, only one becomes an operator.

GoCommerce does not email the link. Copy it and send it however you like.

## Deleting a role

A role can be deleted only when nothing holds it. That means no team member in it, no open invitation into it, and no unrevoked API key acting in it. Otherwise the engine answers `409 role_in_use`, counting each. The Roles screen shows a Holders count, and a role’s page offers **Delete role** only at zero.

Owner and Vendor are never deleted. Owner is the way back into a store that has been set up wrong. Vendor is the role seller logins are filed under.

If someone assigns a role at the moment it is deleted, they get a plain `400` — “not a role in this store” — rather than a server error.

## Upgrading

Upgrading changes nobody’s access. A migration stores Owner, Manager, Staff and Vendor as rows, and every existing team member keeps the role they had.

## What it does not do yet

<div class="tbl-scroll">

| Gap | Today |
| :-- | :-- |
| Invitation emails | Send Invite makes a link. You copy and send it. |
| API keys in your own roles | A key can act only as Owner, Manager, Staff or Vendor. |
| A second seller role | Row-scoping for sellers is tied to the role named `vendor`. |
| Changing a key | The name changes; the key is permanent. |
| One sign-in across stores | Designed, not built. The same email on two stores is two separate accounts. |

</div>

## Further reading

- [GoCommerce admin](/gocommerce/admin/) — the panel these screens live in.
- [Multi-store](/solutions/multi-store/) — channels, and many stores from one install.
- [`skills/team.md`](https://github.com/itswadesh/gocommerce/blob/main/skills/team.md) — roles, rights and access in full.
- [The commit](https://github.com/itswadesh/gocommerce/commit/683de63dba38daf9220fb236e861a5da5dc68d7a) that added custom roles.
