/**
 * Which page links to which, decided once from the data files rather than
 * typed into each template. A new comparison or module joins its siblings'
 * links the moment its data file exists.
 */
import type { Comparison } from '../data/compare/_schema'
import type { Integration } from '../data/integrations/_schema'
import { fill } from './pricing'

const bySlug = <T extends { slug: string }>(a: T, b: T) => a.slug.localeCompare(b.slug)
export const comparisons = Object.values(import.meta.glob<Comparison>('../data/compare/*.json', { eager: true, import: 'default' })).sort(bySlug)
export const integrations = Object.values(import.meta.glob<Integration>('../data/integrations/*.json', { eager: true, import: 'default' })).map(fill).sort(bySlug)

const find = <T extends { slug: string }>(list: T[], slug: string) => {
  const hit = list.find((x) => x.slug === slug)
  if (!hit) throw new Error(`src/lib/related.ts names "${slug}", which has no data file`)
  return hit
}

// The rivals people search for most by name, from the search audit of
// 26 October 2026: the hosted default, the two open-source giants, and the
// two headless engines a Go backend is weighed against.
export const featuredComparisons = ['kitcommerce-vs-shopify', 'kitcommerce-vs-woocommerce', 'kitcommerce-vs-magento', 'kitcommerce-vs-medusa', 'kitcommerce-vs-saleor'].map((s) => find(comparisons, s))

// The modules the home page names, in the order its strip shows them.
export const featuredModules = ['payments-stripe', 'payments-razorpay', 'payments-adyen', 'fulfill-shiprocket', 'fulfill-delhivery', 'notify-twilio', 'notify-sendgrid', 'search-meilisearch'].map((s) => find(integrations, s))

/** The other comparisons in this one's hub group. */
export const siblingComparisons = (c: Comparison) => comparisons.filter((x) => x.group === c.group && x.slug !== c.slug)

/** A comparison as a LinkCards item: its search-led heading and its hub summary. */
export const compareCard = (x: Comparison) => fill({ href: `/compare/${x.slug}/`, label: x.h1, summary: x.summary })

// A category with too few modules of its own borrows from its nearest one.
const NEAR: Partial<Record<Integration['category'], Integration['category']>> = { Search: 'Marketing', Migration: 'Platform' }

/** Four modules to read next: the ones after this in its category, wrapping round, so every module is linked from its neighbours. */
export function relatedModules(i: Integration): Integration[] {
  const same = integrations.filter((x) => x.category === i.category)
  const at = same.findIndex((x) => x.slug === i.slug)
  const ring = [...same.slice(at + 1), ...same.slice(0, at)]
  const near = NEAR[i.category]
  return [...ring, ...(near ? integrations.filter((x) => x.category === near) : [])].slice(0, 4)
}

type Link = { href: string; text: string }
const FEATURE: Record<Integration['category'], Link> = {
  Payments: { href: '/features/checkout/', text: 'Checkout and payments in GoCommerce' },
  Shipping: { href: '/features/operations/', text: 'Orders, stock and shipping in GoCommerce' },
  Messaging: { href: '/solutions/d2c/', text: 'What modules add to a direct-to-consumer store' },
  Marketing: { href: '/solutions/d2c/', text: 'What modules add to a direct-to-consumer store' },
  Search: { href: '/features/development/', text: 'How modules extend GoCommerce' },
  Platform: { href: '/features/development/', text: 'How modules extend GoCommerce' },
  Migration: { href: '/compare/kitcommerce-vs-shopify/', text: find(comparisons, 'kitcommerce-vs-shopify').h1 },
}
const FEATURE_BY_SLUG: Record<string, Link> = {
  'ai-gateway': { href: '/features/ai/', text: 'AI in GoCommerce: the gateway, agent keys and MCP' },
  mcp: { href: '/features/ai/', text: 'AI in GoCommerce: the gateway, agent keys and MCP' },
  'cart-recovery': { href: '/features/checkout/', text: 'Checkout and abandoned checkouts in GoCommerce' },
}

/** The feature or solution page this module belongs to. */
export const featureFor = (i: Integration): Link => FEATURE_BY_SLUG[i.slug] ?? FEATURE[i.category]
