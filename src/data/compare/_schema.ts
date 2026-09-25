/**
 * The shape of one comparison page. Each JSON file beside this one is a page
 * at /compare/<slug>/, rendered by src/pages/compare/[slug].astro and listed
 * on the hub by `group`.
 *
 * Rules every file keeps, because the pages are only worth reading if they do:
 *   - Every figure about the other platform comes from a page in `sources`,
 *     checked on the `checked` date. No figure without a source.
 *   - Every claim about GoCommerce or Svelte Commerce is one this site already
 *     makes elsewhere, or is checkable in the repositories.
 *   - `themWhen` is a real answer. If the other platform is the better choice
 *     for most readers, it says so.
 *   - Prose names GoCommerce and Svelte Commerce. "KitCommerce" appears only
 *     in `title`, `label` and the og fields, never as a product in the body.
 */
export interface Comparison {
  slug: string
  /** The other platform's name, as it writes it. */
  platform: string
  platformUrl: string
  /** Footer and hub link text, e.g. "KitCommerce vs Shopify". */
  label: string
  /** Hub section this page is listed under. */
  group: 'Shopify' | 'Indian SaaS builders' | 'Open-source platforms' | 'Global SaaS' | 'Headless open source'
  /** One line for the hub card. */
  summary: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  h1: string
  lede: string
  /** Three short facts under the heading: a bold figure and its words. */
  facts: { b: string; t: string }[]
  glanceLede: string
  /** [aspect, the other platform, GoCommerce + Svelte Commerce] */
  rows: [string, string, string][]
  cost?: { title: string; lede: string; caption: string; head: string[]; rows: string[][]; note?: string }
  themWhen: string[]
  usWhen: string[]
  /** Anything this comparison adds to the shared "what you take on" list. */
  takeOnExtra?: string[]
  move?: { title: string; paras: string[] }
  faq: { q: string; a: string }[]
  sources: { label: string; url: string }[]
  /** ISO date the other platform's facts were checked. */
  checked: string
}
