/**
 * The shape of one backend page. Each JSON file beside this one is a page at
 * /svelte-commerce/backends/<slug>/, rendered by
 * src/pages/svelte-commerce/backends/[slug].astro.
 *
 * Coverage is not in these files. The wired/total count, the package and its
 * version, the cart/checkout/auth states and the known gaps come from
 * src/data/connectors.json, joined on `name`, so the matrix on
 * /svelte-commerce/backends/ and these pages cannot disagree.
 *
 * Rules every file keeps, because the pages are only worth reading if they do:
 *   - Each file summarises docs/<BACKEND>.md in the Svelte Commerce
 *     repository (`docUrl`). Commands and environment variable names are the
 *     guide's own, character for character; the prose is restructured, not
 *     pasted.
 *   - Where the guide and the code disagree, the code wins and the page says
 *     so. Anything added beyond the guide — an environment variable's meaning,
 *     a platform setting, a reason an order cannot be placed — was read in the
 *     connector's own source (github.com/misiki-in/<platform>-connector) or in
 *     the storefront's, never assumed.
 *   - `limitations` names every gap connectors.json records for this backend,
 *     plus the guide's own limitations.
 *   - `verdict` answers the question a reader arrives with — can I run a store
 *     on this today? — plainly, including when the answer is no.
 *   - Prose names Svelte Commerce, never KitCommerce, and follows the site's
 *     voice: British spelling, curly apostrophes, no hype.
 *
 * Inline code in any prose field is written between backticks; the page
 * renders it as <code>, and strips the backticks for the FAQPage JSON-LD.
 */

/** One step of the quick start: a comment line, then the commands to copy. */
export interface QuickStep {
  /** What the step does, lower case, rendered as a shell comment. */
  text: string
  /** The commands, one per line, exactly as they are to be run. */
  cmd?: string
}

export interface EnvVar {
  /** The variable's name, exactly as the storefront reads it. */
  name: string
  /** True when the storefront will not boot, or cannot reach the backend, without it. */
  required: boolean
  /** What it does, and anything that makes it dangerous to set. */
  note: string
}

export interface Backend {
  /** Lower-case name, spaces and dots as hyphens: "virto-commerce". */
  slug: string
  /** Exactly as in connectors.json — the page joins coverage on it. */
  name: string
  /** ≤ 60 characters. */
  title: string
  /** ≤ 160 characters. */
  description: string
  /** One or two sentences under the heading. */
  lede: string
  /** The plain answer to "can I run a store on this today?", shown first. */
  verdict: string
  /** Steps rendered into one copyable code block, or a ready-made code string. */
  quickStart: QuickStep[] | string
  /** A note under the quick start, e.g. where it departs from the guide and why. */
  quickStartNote?: string
  env: EnvVar[]
  /** Fineprint under the environment table: forwarding rules, variables the guide lists that nothing reads. */
  envNote?: string
  /** What to change on the platform itself before the storefront will work. */
  backendSettings: string[]
  /** Short paragraphs: how the connector talks to the platform. */
  howItWorks: string[]
  limitations: string[]
  troubleshooting: { problem: string; fix: string }[]
  /** Three to five. Rendered visibly and as FAQPage JSON-LD. */
  faq: { q: string; a: string }[]
  /** The question the guide puts to this platform's maintainers, if it has one. */
  openQuestion?: string
  /** Said after the caveat every page carries, when this backend needs more said. */
  caveatExtra?: string
  /** The guide this file summarises, on GitHub. */
  docUrl: string
  /** ISO date the guide and the connector's source were read for this file. */
  read: string
}
