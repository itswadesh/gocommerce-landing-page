# kitcommerce.store — Landing Page Implementation Brief

Repository: `itswadesh/gocommerce-landing-page`

## Source of Truth

`kitcommerce.store` is **not a separate ecommerce product**.

It is the presentation / marketing website for two personal open-source ecommerce projects:

- **Svelte-Commerce** — storefront
- **GoCommerce** — admin + backend

Both projects are independently usable, but they also complement each other well as a full ecommerce stack.

The site should present these two projects clearly and credibly without inventing a separate "Kitcommerce platform", "Kitcommerce product", or "Kitcommerce ecosystem" layer.

## Core Positioning

The homepage should communicate this immediately:

> **Open-source ecommerce with Go + Svelte**  
> Two independent projects that work great together:  
> **GoCommerce** for backend and admin.  
> **Svelte-Commerce** for the storefront.

The visitor should understand within 15–30 seconds:
1. There are two projects.
2. Both are open source.
3. GoCommerce handles backend + admin.
4. Svelte-Commerce handles the storefront.
5. They can work together.
6. They can also be adopted separately.
7. `kitcommerce.store` is the website that presents them.

## Important Branding Rule

Do **not** position Kitcommerce as:
- a third product
- an umbrella product
- a parent product
- a separate framework
- a separate runtime
- a separate backend
- a separate storefront

`kitcommerce.store` is simply the website / brand-facing home for presenting the two projects.

## Homepage Structure

Recommended order:
1. Hero
2. The two projects
3. How they work together
4. Architecture
5. GoCommerce details
6. Svelte-Commerce details
7. Quick Start
8. Technical proof / credibility
9. GitHub activity
10. Roadmap
11. FAQ
12. Final CTA

## Hero Section

### Recommended headline

**Open-source ecommerce with Go + Svelte**

### Recommended supporting copy

> Build modern ecommerce with two independent open-source projects: GoCommerce for backend and admin, and Svelte-Commerce for the storefront.

Alternative:

> A modern open-source ecommerce stack built from two standalone projects — GoCommerce for backend and admin, Svelte-Commerce for the storefront.

### Primary CTAs
- Explore GoCommerce
- Explore Svelte-Commerce

### Secondary CTA
- View on GitHub

Avoid CTAs such as:
- Explore Kitcommerce Platform
- Start with Kitcommerce
- Build with Kitcommerce

because that implies Kitcommerce itself is another product.

## Present the Two Projects Equally

### GoCommerce

**Backend + Admin**

Suggested copy:

> A Go-based ecommerce backend with APIs, PostgreSQL, and an integrated admin interface.

Highlight:
- Go
- ecommerce APIs
- PostgreSQL
- admin interface
- OpenAPI
- modular architecture
- self-hosting
- performance
- extensibility

CTAs:
- Explore GoCommerce
- GitHub

### Svelte-Commerce

**Storefront**

Suggested copy:

> An open-source storefront built with Svelte for fast, flexible, headless ecommerce experiences.

Highlight:
- Svelte / SvelteKit
- storefront
- headless architecture
- customizable UI
- performance
- SEO-friendly rendering
- backend-independent architecture

CTAs:
- Explore Svelte-Commerce
- GitHub

## How They Work Together

Suggested heading:

**Use them independently. Or use them together.**

Suggested copy:

> GoCommerce and Svelte-Commerce are standalone projects. Use either one with your existing stack, or combine them for a complete Go + Svelte ecommerce architecture.

Visual:

```text
Customer
   |
   v
Svelte-Commerce
Storefront
   |
   | API
   v
GoCommerce
Backend + Admin
   |
   v
PostgreSQL
```

Add a small note:

> Svelte-Commerce can work with other commerce backends, and GoCommerce can power other storefronts.

## Architecture Section

```text
┌──────────────────────────────┐
│       Svelte-Commerce        │
│          Storefront          │
│      Svelte / SvelteKit      │
└──────────────┬───────────────┘
               │
               │ APIs
               ▼
┌──────────────────────────────┐
│         GoCommerce           │
│       Backend + Admin        │
│             Go               │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          PostgreSQL          │
└──────────────────────────────┘
```

Where Redis, search, queues, storage, payments or other optional infrastructure is supported, show them as integrations around the core rather than mandatory parts of the identity.

## GoCommerce Section

Recommended heading:

**GoCommerce — ecommerce backend + admin built with Go**

Suggested description:

> GoCommerce provides the backend foundation for ecommerce applications, including commerce APIs, PostgreSQL persistence and an admin experience.

Focus on actual capabilities.

Possible proof points:
- REST / OpenAPI APIs
- PostgreSQL
- admin interface
- products
- variants
- inventory
- customers
- carts
- orders
- discounts
- authentication
- extensible modules
- Docker / self-hosting

Only include capabilities that actually exist.

Avoid:
> "The backend of Kitcommerce"

Prefer:
> "A standalone ecommerce backend that pairs naturally with Svelte-Commerce."

## Svelte-Commerce Section

Recommended heading:

**Svelte-Commerce — a modern open-source ecommerce storefront**

Suggested description:

> Svelte-Commerce provides a fast, customizable storefront for headless ecommerce, built around the Svelte ecosystem.

Focus on:
- Svelte / SvelteKit
- storefront UX
- performance
- customizable components
- responsive design
- SEO
- headless architecture
- backend flexibility

Avoid:
> "The frontend of Kitcommerce"

Prefer:
> "A standalone storefront that can connect to GoCommerce or another compatible commerce backend."

## Quick Start

Create separate quick-start paths.

### Start with GoCommerce

```bash
# GoCommerce quick-start command(s)
```

### Start with Svelte-Commerce

```bash
# Svelte-Commerce quick-start command(s)
```

If supported, optionally add:

### Run both together

```bash
# combined development setup
```

Do not make the combined setup the only onboarding route.

## GitHub Must Be Central

Preserve the repositories:
- `itswadesh/gocommerce`
- `itswadesh/svelte-commerce`

Do not rename them solely to match `kitcommerce.store`.

Each major project section should have a visible GitHub CTA.

Where appropriate, surface live repository information such as:
- stars
- forks
- latest release
- recent commits
- open issues
- contributors

Do not show stale metrics manually if they can become inaccurate.

## Technical Credibility

Preserve and strengthen:
- architecture diagrams
- actual module list
- test count / coverage, where meaningful
- OpenAPI support
- PostgreSQL
- Docker
- deployment instructions
- release history
- recent GitHub commits
- documentation
- examples
- benchmarks, if genuine

Avoid inflated marketing claims.

## Product Relationship Table

| | GoCommerce | Svelte-Commerce |
|---|---|---|
| Role | Backend + Admin | Storefront |
| Primary language | Go | Svelte / SvelteKit |
| Can be used standalone | Yes | Yes |
| Can work together | Yes | Yes |
| Open source | Yes | Yes |
| Repository | `itswadesh/gocommerce` | `itswadesh/svelte-commerce` |

## Navigation

Recommended navigation:
- Home
- GoCommerce
- Svelte-Commerce
- Architecture
- Docs
- GitHub

Optional:
- Roadmap
- Examples
- Community

Avoid a top-level item called "Kitcommerce Platform" unless it simply links to the homepage.

## SEO Strategy

### Homepage targets
- open source ecommerce Go Svelte
- Go Svelte ecommerce
- open source ecommerce stack
- Go ecommerce backend Svelte storefront
- headless ecommerce Go Svelte

### GoCommerce targets
- Go ecommerce
- Golang ecommerce
- Go ecommerce backend
- Go ecommerce framework
- open source ecommerce backend Go
- Go ecommerce API
- self hosted ecommerce Go

### Svelte-Commerce targets
- Svelte ecommerce
- SvelteKit ecommerce
- Svelte storefront
- open source Svelte ecommerce
- headless ecommerce Svelte
- Svelte ecommerce template
- Svelte ecommerce frontend

## Metadata

### Homepage title

**GoCommerce + Svelte-Commerce | Open Source Ecommerce with Go & Svelte**

Alternative:

**Open Source Ecommerce with Go + Svelte | GoCommerce & Svelte-Commerce**

### Homepage description

> Explore GoCommerce, an open-source ecommerce backend and admin built with Go, and Svelte-Commerce, a modern open-source storefront built with Svelte.

### GoCommerce page

**GoCommerce — Open Source Ecommerce Backend + Admin in Go**

### Svelte-Commerce page

**Svelte-Commerce — Open Source Ecommerce Storefront for Svelte**

## GEO / AI Search Optimization

### What is GoCommerce?

> GoCommerce is an open-source ecommerce backend and admin application built with Go.

### What is Svelte-Commerce?

> Svelte-Commerce is an open-source ecommerce storefront built with Svelte.

### What is kitcommerce.store?

> kitcommerce.store is the website that presents GoCommerce and Svelte-Commerce, two open-source ecommerce projects.

### Do GoCommerce and Svelte-Commerce require each other?

> No. Both projects can be used independently, but they can also be combined to build a complete ecommerce stack.

### Can Svelte-Commerce work with another ecommerce backend?

> Yes. Svelte-Commerce is a headless storefront capable of integrating with compatible commerce backends.

### Can GoCommerce work with another frontend?

> Yes. GoCommerce exposes commerce backend functionality that can be consumed by compatible storefronts and applications.

Use FAQ structured data where appropriate.

## Copy Rules

Prefer:
- two open-source ecommerce projects
- backend + admin
- storefront
- Go
- Svelte
- SvelteKit
- PostgreSQL
- headless
- self-hostable
- standalone
- composable
- can be used together
- developer-focused

Avoid:
- Kitcommerce platform
- Kitcommerce framework
- Kitcommerce engine
- powered by Kitcommerce
- built on Kitcommerce
- Kitcommerce backend
- Kitcommerce storefront
- GoCommerce is a Kitcommerce module
- Svelte-Commerce is a Kitcommerce module

unless a future actual product called Kitcommerce is created.

## Visual Direction

The site should visually communicate **two projects, one website**.

```text
             Ecommerce Project
                    |
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
   Svelte-Commerce        GoCommerce
      Storefront        Admin + Backend
```

Or show the normal request flow:

```text
Browser
   ↓
Svelte-Commerce
   ↓
GoCommerce API
   ↓
PostgreSQL
```

Avoid putting a large "Kitcommerce" box around them because that visually creates a third software product.

## Homepage CTA Strategy

Recommended final CTA:

**Choose where you want to start**

### Building a storefront?
**Explore Svelte-Commerce**

### Need a commerce backend + admin?
**Explore GoCommerce**

### Want the complete setup?
**See how they work together**

## Repository Naming

Keep:
- `itswadesh/gocommerce`
- `itswadesh/svelte-commerce`

No need to create or rename them to:
- `kitcommerce/backend`
- `kitcommerce/storefront`
- `kitcommerce/gocommerce`
- `kitcommerce/svelte-commerce`

## PR Acceptance Criteria

The website update is complete when:
- A visitor immediately understands that there are two projects.
- GoCommerce is clearly backend + admin.
- Svelte-Commerce is clearly the storefront.
- Both are clearly standalone.
- Their compatibility is explained.
- `kitcommerce.store` is not presented as a third software product.
- No unnecessary umbrella-product language remains.
- Both GitHub repositories receive prominent CTAs.
- Quick Start supports separate adoption paths.
- Technical proof is retained.
- SEO targets GoCommerce and Svelte-Commerce individually.
- Homepage SEO captures the Go + Svelte combination.
- FAQ content accurately explains the relationship.
- Repository names remain unchanged.

## Final Positioning Summary

> **Two open-source ecommerce projects. One backend. One storefront. Use them separately or together.**

- **GoCommerce** → Admin + Backend
- **Svelte-Commerce** → Storefront
- **kitcommerce.store** → The website that presents them
