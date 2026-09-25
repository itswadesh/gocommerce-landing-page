/**
 * The shape of one module page. Each JSON file beside this one is a page at
 * /integrations/<slug>/, rendered by src/pages/integrations/[slug].astro.
 * The slug is the module's directory under ext/ in the GoCommerce repository,
 * so the page, the directory and the import path can never disagree.
 *
 * Rules every file keeps, because the pages are only worth reading if they do:
 *   - Everything here is read from the module's own source: its package doc,
 *     its Config struct, the plugin fields it registers, its routes, its
 *     tests. Nothing about the module is inferred from the vendor's marketing.
 *   - A module gets a page only when its source tells a real setup story —
 *     what it does, what it needs, how it is wired. A module whose package
 *     doc is a sentence stays a line on /integrations/ and nothing more.
 *   - No production claims. No store is known to run GoCommerce in
 *     production, so no page says a module is proven, used or relied on.
 *   - `limits` is a real list. What the code does not do — no refunds, one
 *     currency, no tracking updates, no tests — is written down, not left
 *     for the reader to discover.
 *   - Prose names GoCommerce. "KitCommerce" appears nowhere in these files.
 */
export interface Integration {
  /** The directory under ext/, e.g. "payments-razorpay". Also the URL slug. */
  slug: string
  /** The vendor or product as it writes its own name ("Razorpay", "NimbusPost"),
   *  or the module's plain name when it talks to no third party ("Webhooks"). */
  name: string
  /** Breadcrumb, kicker and the first head-fact. */
  category: 'Payments' | 'Shipping' | 'Messaging' | 'Search' | 'Marketing' | 'Migration' | 'Platform'
  /** <title>. 60 characters at most. */
  title: string
  /** Meta description. 160 characters at most. */
  description: string
  /** Shorter social-card copy. Optional; the title and description serve otherwise. */
  ogTitle?: string
  ogDescription?: string
  h1: string
  lede: string
  /** What it does, in the module's own words where possible. The first
   *  paragraph is the statement's lead. */
  what: string[]
  /** One sentence above the configuration table: where these values can be set. */
  configLede: string
  /** Every setting the module reads. `field` is the Go Config field (or the
   *  plugin key when the field exists only in the panel); `panel` is the label
   *  the admin's settings drawer shows; `env` is the variable the package doc
   *  or the reference binary reads it from — the module itself reads Config,
   *  never the environment. */
  config: { field: string; panel?: string; env?: string; required: boolean; note: string }[]
  /** Ordered setup steps, rendered as a numbered row: a bold heading and a line. Four reads best. */
  setup: { b: string; t: string }[]
  /** The Go that installs it: the package doc's own example, filled out into
   *  imports and a call. Plain text; the page highlights it. */
  code: string
  /** Shown in the code block's header, e.g. "main.go". */
  codeTitle: string
  /** Under the code: where the snippet came from, and anything it leaves out. */
  codeNote: string
  /** Short tiles: webhooks, idempotency, refunds, retries — only what the code does. */
  howItWorks: { b: string; t: string }[]
  /** What it does not do, and anything a store should know before relying on it. */
  limits: { b: string; t: string }[]
  /** Whether the package has a *_test.go file. */
  tested: boolean
  /** Top-level Test functions across the package's *_test.go files. */
  testCount: number
  /** Operations in the package's openapi.json; 0 when it mounts no routes of its own. */
  apiOps: number
  /** The vendor's own site. Omitted when the module talks to no third party. */
  vendorUrl?: string
  /** How the vendor is described in JSON-LD. Required with vendorUrl. */
  vendorType?: 'Organization' | 'SoftwareApplication' | 'CreativeWork'
  /** The vendor's name when it is not `name`, e.g. "Model Context Protocol" for "MCP". */
  vendorName?: string
  /** Overrides the standard trademark sentence, e.g. when there are two
   *  owners or the module reads a published format rather than calling an API.
   *  An empty string suppresses it (for a module that names no third party). */
  trademark?: string
  faq: { q: string; a: string }[]
}
