/**
 * One features page. Each JSON file beside this one is /features/<slug>/.
 *
 * Every tile is checked against the GoCommerce repository and names the file
 * that does the work in `source`. `status: "partial"` tiles say what is
 * missing inside `text`. Anything the code does not do goes in `notYet`,
 * never in a tile. Source of truth for the first three pages: a tile-by-tile
 * audit of GoCommerce at commit 1498c68 (21 September 2026).
 */
export interface FeaturePage {
  slug: string
  /** Short name: "Checkout", "Operations", "Development". */
  name: string
  /** One line for the /features/ hub. */
  summary: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  kicker: string
  h1: string
  lede: string
  facts: { b: string; t: string }[]
  groups: { name: string; lede?: string; tiles: { title: string; status: 'yes' | 'partial'; text: string; source?: string }[] }[]
  notYetLede: string
  notYet: { name: string; why: string }[]
  faq: { q: string; a: string }[]
}
