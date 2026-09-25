---
title: "The API is the storefront now: agentic commerce on an open stack"
seoTitle: "Agentic Commerce on an Open Stack: GoCommerce and MCP"
description: "Agents are a new door into a store. What GoCommerce and Svelte Commerce give an agent today, what they do not, and why an open engine matters more now."
author: itswadesh
tags: ["agentic commerce", "MCP", "GoCommerce", "Svelte Commerce"]
---

Search changed how people find a shop. Mobile changed what a shop has to be in the hand. Agents are changing something more basic: who is on the other side of the counter.

When the visitor is a program acting for a person, it does not look at the hero image. It asks questions — what is in stock, what does it cost, can it arrive by Friday — and it wants answers it can check. Whatever answers those questions is the storefront. More and more often, that is the API.

Saleor made this argument well in [The Open End-to-End AI Ecommerce Stack](https://saleor.io/blog/end-to-end-agentic-commerce). This post takes the same argument to the two projects we build — GoCommerce, the backend and admin, and Svelte Commerce, the storefront — and is specific about what exists today and what does not.

## The API is the storefront now

An agent reads structure: products, variants, prices, stock and the rules that connect them. If that structure lives behind templates, an agent has to scrape and guess. If it lives behind a documented API, the agent can ask.

GoCommerce was built API-first. It has 342 REST operations, each documented in OpenAPI — 238 in the core, the rest in the modules that add them. The admin panel uses the same contract, so there is no private API that the panel gets and you do not.

A few of the repository’s rules matter more to a machine client than to a person:

- **Every served route appears in the OpenAPI document.** A test enforces it, so the spec an agent reads is the API it gets.
- **Every response is JSON**, even a 404 from the router. A client decoding JSON never receives a plain-text error.
- **Money is integer minor units plus a currency code**, never a float or a formatted string. An agent never has to guess how a price was rounded.

None of this was added for agents. It is what an API needs anyway; agents just punish its absence faster.

## An agent that can run the store, through the same door

The `mcp` module exposes a GoCommerce store over the Model Context Protocol, with 19 tools. An agent can read the store — products, orders, customers, low-stock variants, a sales report, the store’s health. It can change the catalogue — create and update products, set a variant’s price, adjust inventory, create a discount. And it can move orders along — mark one paid, fulfil it, mark it delivered, cancel it or refund it.

What it cannot do is reach around the engine. Every tool calls the same domain service a REST request would, never the database directly. There is one state machine and one place where an order becomes paid, whether a person, an application or an agent asked.

Installing it is one entry in the store’s `main()`:

<div class="code-block">
<div class="code-head"><p>The store as tools for an agent</p><button class="copy" data-copy="code-mcp">Copy</button></div>

<pre id="code-mcp"><code><span class="k">import</span> (
	<span class="s">"github.com/itswadesh/gocommerce/core"</span>
	<span class="s">"github.com/itswadesh/gocommerce/ext/mcp"</span>
)

modules := []gocommerce.<span class="t">Module</span>{
	<span class="cm">// Served at /api/admin/x/mcp. ReadOnly withholds every tool that changes state.</span>
	mcp.<span class="f">New</span>(mcp.<span class="t">Config</span>{ServerName: <span class="s">"my-store"</span>, ReadOnly: <span class="k">true</span>}),
}</code></pre>

<p class="code-note">Adapted from <code>examples/store/main.go</code> and <code>ext/mcp/mcp.go</code>. Install with <code>go get github.com/itswadesh/gocommerce@latest</code>.</p>
</div>

The endpoint inherits admin authentication, so the store’s admin token is the agent’s credential. `ReadOnly` is worth keeping on while you decide how far to trust the agent on the other end. Each tool names the rights it needs, and every state-changing call — including a refused one — is written to an audit table. A desktop agent that speaks stdio can run the store as a subprocess instead.

This is the operator’s agent — the one you point at your own store to ask what is running low, or to refund an order. It is not a shopper’s agent buying from outside. That door comes below.

## Coding agents read the rules before they edit

The other agent in the room is the one changing the code. AI does not lower the bar for correctness. It raises it, because a wrong change now arrives faster and reads more confidently.

So the GoCommerce repository is written to be read by one. `AGENTS.md` sets out 18 rules — fourteen architectural ones and four addressed to AI agents specifically. Modules never write core tables. A state change and its event commit in the same transaction. Guest checkout is permanent. And for agents: a new MCP tool wraps a service method, so the safe surface stays safe.

Beside it, `skills/` holds 16 files: fifteen task guides — carts, checkout, discounts, inventory, orders, payments and the rest — and a README that routes between them. An agent loads the guide that matches its job instead of reading the whole repository. One production dependency keeps the graph it must understand small, and over 1,000 tests catch the edit that got it wrong.

## The machine-readable doors already open

Agents are not the first machines to read a catalogue. Google Merchant Center and Meta’s catalogue have done it for years, and the `feeds` module publishes both: Google’s RSS feed and Meta’s catalogue CSV, one item per variant, generated on request from the live catalogue. A platform that fetches daily is never more than a day behind your prices.

On the storefront side, Svelte Commerce renders finished HTML on the server. A crawler, or an AI reader fetching a product page, gets the product, its price and its description in the response, not an empty shell waiting for JavaScript.

A caveat: the Svelte Commerce connector for GoCommerce is early — 0.1.0 on npm, covering catalogue, cart, checkout and order lookup. Customer accounts and search are not covered yet, and no store we know of runs the pair in production. Svelte Commerce also runs against 26 other commerce backends, and a GoCommerce store’s storefront can instead be one you write against the API.

## What is not built: ACP, UCP and AP2

Buying agents are getting protocols of their own. The Agentic Commerce Protocol (ACP), developed by Stripe and OpenAI, lets an agent run a checkout with a business; ChatGPT was the first platform to implement it. The Universal Commerce Protocol (UCP) is an open standard co-developed by Google, Shopify and a long list of retailers and platforms. The Agent Payments Protocol (AP2), published by Google, covers an agent paying on a person’s behalf.

GoCommerce implements none of them today, so a buying agent cannot check out of a GoCommerce store through any of them. If that matters this quarter, choose a platform that ships one — Saleor, for instance, already supports ACP.

Adding one would follow how everything else is built: a module in `ext/`, like the 44 there now, with its own routes, calling the same cart, checkout, inventory and payment services the REST API does. A channel could decide which products an agent sees and at what price. An order placed through a protocol would reserve stock, apply price lists and discounts, and become paid in the same place as every other order. The core should not need to change.

That is the direction the architecture points. It is not a dated roadmap item, and this post is not a promise.

## Why ownership matters more when new doors open

Every new door — a search engine, a marketplace, an assistant — brings customers, and each would happily own the relationship. Let them send the customers. Do not let them own the store.

Both projects are MIT licensed. You own the engine the agents talk to: its code, its database, its audit trail and its rules. If a protocol changes, you — or anyone you hire — can change the module that speaks it, without waiting on a vendor’s roadmap. And an agent unsure how a refund works can read the source instead of guessing.

The cost is that you run it. There is no hosted offering, and no store we know of runs GoCommerce in production yet. That is the trade: more to operate, and nothing between you and the next door but your own code.

## Further reading

- [Vibe-coding commerce](/vibe-coding-commerce/) — working on a store with AI coding agents.
- [Open source](/open-source/) — the licences, and what they let you do.
- [GoCommerce](/gocommerce/) — the engine in full: its modules, its admin and the one-command start.
