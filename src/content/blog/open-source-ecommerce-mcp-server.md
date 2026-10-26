---
title: "An open-source ecommerce MCP server: what to check before you let an agent in"
seoTitle: "Open-Source Ecommerce MCP Server: What to Check"
description: "What to look for in an open-source ecommerce MCP server: transport, credentials, read and write tools, audit. GoCommerce’s MCP module checked against each, gaps included."
author: itswadesh
tags: ["MCP", "Model Context Protocol", "AI agents", "ecommerce", "Go", "GoCommerce"]
---

An ecommerce MCP server lets an AI agent work with a store through tools: list products, look up an order, change a price. Before you connect one, check five things: how the agent connects, what credential it holds, which tools change the store, whether every call is recorded, and whether the server is part of the store or a separate process with a database login.

This post goes through those five, then shows how the MCP module in [GoCommerce](/gocommerce/) answers each. GoCommerce is an MIT-licensed commerce engine written in Go. Its MCP server is the package `ext/mcp`, about 2,250 lines of Go including its tests, with no third-party dependency. Where it falls short of the current MCP specification, this post says so.

## 1. How does the agent connect?

MCP has two standard transports. The [transports page of the specification](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports) defines **stdio**, where the client starts the server as a subprocess and they exchange newline-delimited JSON-RPC messages, and **Streamable HTTP**, which replaced the older HTTP-with-SSE transport of revision 2024-11-05.

A desktop agent usually wants stdio. A hosted agent needs HTTP. A store’s MCP server is easier to adopt if it offers both.

GoCommerce offers both. Over HTTP the endpoint is `POST /api/admin/x/mcp`. It answers each JSON-RPC request with one `application/json` response, and answers a notification with `202 Accepted`. For stdio, you call `mcp.ServeStdio(app, m)` from `main()` instead of `ListenAndServe`:

```go
package main

import (
	"log"
	"os"

	"github.com/itswadesh/gocommerce/core"
	"github.com/itswadesh/gocommerce/ext/mcp"
)

func main() {
	agent := mcp.New(mcp.Config{ServerName: "my-store", ReadOnly: true})
	app, err := gocommerce.New(gocommerce.Config{
		DBURL:       os.Getenv("DATABASE_URL"),
		AdminTokens: []string{os.Getenv("GOCOMMERCE_ADMIN_TOKEN")},
	}, agent)
	if err != nil {
		log.Fatal(err)
	}
	if len(os.Args) > 1 && os.Args[1] == "mcp" {
		log.Fatal(mcp.ServeStdio(app, agent))
	}
	log.Fatal(app.ListenAndServe())
}
```

Logs go to standard error, so they never mix with the protocol on standard output. Over stdio there is no request to authenticate. The process that launched the server is treated as the operator, so `ReadOnly` is the setting that limits it there. On an install that holds several stores, set `Config.DefaultStore` so the server knows which one to work in.

The module is not in the reference `gocommerce` binary’s flags. You add it in your own `main()`, as above or as `examples/store/main.go` does.

**Where it falls short.** It advertises protocol revision `2024-11-05`, the one before Streamable HTTP. In practice its HTTP endpoint behaves like a minimal Streamable HTTP server: POST only, a JSON reply and no server-sent events. It has no sessions and does not read the `MCP-Protocol-Version` header. It offers tools only, with no resources or prompts.

## 2. What credential does the agent hold?

An agent should hold a credential made for it. That means narrower than a staff login, with an expiry, a rate limit, and nothing that can mint more credentials. Be wary of a server that asks for a database connection string or the owner’s API key.

GoCommerce puts the MCP endpoint behind the engine’s admin authentication, and it has a separate kind of key for agents (`core/agent_keys.go`). An agent key:

- carries a list of rights picked from its issuer’s own, rather than a role, so nothing widens it later;
- expires after 90 days unless the issuer chooses otherwise, and after 365 days at most;
- is limited to 60 calls a minute by default, counted in PostgreSQL, so a loop in an agent gets a 429 on every replica;
- is stored only as a hash and shown once;
- can never hold certain rights, such as reading API keys, changing roles, editing payment and shipping credentials, exporting data or running custom SQL reports;
- sees personal data masked.

In this release an agent key can only read. Writes by agents are planned to go through an approval queue, where a person approves each change. The queue exists, in the `ai-gateway` module, but no actions are registered with it yet.

## 3. Which tools change the store?

Read tools are low risk. A tool that marks an order paid or issues a refund moves money. A good server says which is which, can turn off every tool that changes something, and checks each tool’s permission separately.

GoCommerce has 19 built-in tools. Nine read: `store_info`, `store_health`, `list_products`, `get_product`, `list_low_stock_variants`, `list_orders`, `get_order`, `list_customers` and `sales_report`. Ten change the store: `update_variant_inventory`, `mark_order_paid`, `cancel_order`, `create_fulfillment`, `mark_order_delivered`, `create_product`, `update_product`, `set_variant_price`, `create_discount` and `refund_order`.

Each tool is marked with the MCP `readOnlyHint` annotation. `Config{ReadOnly: true}` withholds every tool that changes something. An agent key is never shown those tools in `tools/list`, and is refused them if it calls one anyway. Each tool names the rights it needs, and they are checked against the caller for every call. So a role that may only edit the catalogue cannot reach `mark_order_paid`.

The tools call the same domain services as the REST API and the admin panel. `mark_order_paid` goes through the same code path as a payment webhook, so the agent cannot create a state the rest of the engine does not understand. Your own tools can be added through `Config.Tools`.

## 4. Is every call recorded?

When an agent can cancel an order, you need to be able to answer “which agent did that, with what arguments, and did it work?”

GoCommerce writes every tool call to an `mcp_audit` table: the tool, its arguments and the outcome, including calls that were refused. `GET /api/admin/x/mcp/audit` lists them, and reading the log is a separate right from calling the tools.

## 5. Is the server part of the store?

An MCP server that is a separate service with its own database login can do anything that login can, whatever the store’s rules say. A server inside the store goes through the store’s own checks.

GoCommerce’s is inside. It is a module in the same binary and uses the same rights, the same domain services and the same events. The agent never gets database access. There is also no SQL tool.

## What GoCommerce’s MCP server does not do

- **It does not follow the newest protocol revision**, as described under the first check.
- **It is not a shopper’s buying agent.** The tools are for running a store, not for an agent that buys on a customer’s behalf. GoCommerce has no ACP, UCP or AP2 support; the post on [agentic commerce on an open stack](/blog/agentic-commerce-open-stack/) covers that ground.
- **Agent keys cannot write yet.** To let an agent change the store today, it has to call with an admin token or a staff account that holds the rights, and then the agent can do whatever those rights allow.

## How do you try it?

Wire the module in as above, start the store, and send `initialize` and `tools/list`:

```sh
curl -s localhost:8080/api/admin/x/mcp \
  -H "Authorization: Bearer $GOCOMMERCE_ADMIN_TOKEN" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

The [MCP module page](/integrations/mcp/) lists its settings, and the [GoCommerce MCP page](/gocommerce/mcp/) walks through a full session and how to point an AI client at it. For the rest of the engine, see [building an ecommerce backend in Go](/blog/ecommerce-backend-in-go/). For a storefront in front of the same store, see [Svelte Commerce](/svelte-commerce/).
