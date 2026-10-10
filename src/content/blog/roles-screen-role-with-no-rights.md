---
title: "Fixed: the Roles screen stopped on a role with no rights"
description: "In GoCommerce v1.0.0 to v1.2.0, Settings → Roles stopped before listing any roles. Why a role with no rights caused it, what changed, and what to do now."
author: itswadesh
tags: ["GoCommerce", "admin panel", "bug fix", "roles and permissions"]
---

If you opened **Settings → Roles** in the GoCommerce admin and the list of roles never appeared, this was why. It is fixed on `main` in commit [c1ddf61](https://github.com/itswadesh/gocommerce/commit/c1ddf619f30cb0700f1c1170500e14920c1c4f02).

## What you saw

The Roles screen opened, but the table of roles did not fill in. Nothing was wrong with your roles or your data. The screen hit an error while drawing the list, and stopped there.

## When it happened

Every time, as long as the Vendor role had no rights — which is how it ships. Vendor carries nothing until a store grants it something, so a seller cannot see anyone else’s data on their first sign-in.

<div class="tbl-scroll">

| Question | Answer |
| :-- | :-- |
| Who saw it | Anyone allowed to open Roles — by default, the Owner |
| Since | The Vendor role arrived on 20 September 2026 |
| Releases affected | v1.0.0, v1.1.0 and v1.2.0 |
| Fixed | On `main`, 9 October 2026, after v1.2.0 |

</div>

## Why

In Go, an empty list can be “nil”, and nil becomes `null` in JSON instead of `[]`. The engine sent the Vendor role’s rights as `null`. The Roles screen asked that list for its length, got an error instead of a number, and stopped.

## What changed

The engine now always sends an empty set of rights as `[]`. The change is five lines in `core/rights_registry.go`. A new test fails if the roles response ever carries `"rights":null` or `"default":null` again.

The same `null` reached one other place. A vendor account’s own sign-in record carried it too, and the panel reads a missing rights list as a static admin token, so it showed that seller the full menu. The engine still refused anything the seller had no right to. With `[]`, the panel now hides those menus as well.

## What you need to do

Update to a build of `main` that includes c1ddf61 (9 October or later), or to the first release after v1.2.0. The fix is in the engine only: no migration, no setting, and no rebuild of the panel. Nothing was saved wrong, so there is nothing to repair.

## Further reading

- [Custom roles, and adding team members by email](/blog/custom-roles-and-team-members/) — the feature this fix shipped with.
- [GoCommerce admin](/gocommerce/admin/) — the panel, screen by screen.
- [The fix on GitHub](https://github.com/itswadesh/gocommerce/commit/c1ddf619f30cb0700f1c1170500e14920c1c4f02) — the diff and its test.
