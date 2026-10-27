/**
 * Rival prices in the visitor's currency, without an exchange rate.
 *
 * Every rival price lives once, in src/data/prices.json, as an amount on one of
 * the rival's own published price lists (a list is one currency, one source URL
 * and the date it was read). A page never converts: for each site currency it
 * shows the rival's own list in that currency, or, where the rival publishes
 * none, its nearest published list, in that list's currency. All variants are
 * in the HTML; CSS shows the one matching <html data-cur>, which a head script
 * sets before first paint, so switching currency never shifts the layout.
 *
 * Data files write {p:rival/item} (or {p:rival/item*12} for a multiple of a
 * published price); <Priced> renders it and plain() gives the text for meta
 * tags and JSON-LD. A worked example's hypothetical amount, which is no one's
 * price, is written {ex:USD 10000}.
 */
import registry from '../data/prices.json'
import { formatMoney } from './format-money.mjs'

export { formatMoney }

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED'] as const
export type Currency = (typeof CURRENCIES)[number]

/** Shown with JavaScript off. India-first targeting; see docs/decisions.md. */
export const DEFAULT_CURRENCY: Currency = 'INR'

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian rupees', USD: 'US dollars', EUR: 'euros', GBP: 'pounds sterling',
  AUD: 'Australian dollars', CAD: 'Canadian dollars', SGD: 'Singapore dollars', AED: 'UAE dirhams',
}

/** Where a rival has no list in the chosen currency, the first of these it has. */
const NEAREST: Currency[] = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'SGD', 'AED']

/**
 * One published price list. `for` names the site currency whose visitors it
 * is for, when that is not its own: Shopify prices its UAE plans in US dollars,
 * different from its US list, so that list is `"currency": "USD", "for": "AED"`.
 */
export interface PriceList { currency: Currency; for?: Currency; label: string; url: string; read: string }
const serves = (l: PriceList) => l.for ?? l.currency
/**
 * A country Shopify sells in: whether Shopify Payments is offered, and its fee per plan on orders another provider takes.
 * `gstUrl` is set where Shopify adds GST to its fees (India): its page saying so.
 */
interface MarketFacts { name: string; payments: boolean; fees: Record<string, number>; feeUrl: string; paymentsUrl: string; gstUrl?: string; read: string }
interface Rival { name: string; lists: Record<string, PriceList>; prices: Record<string, Record<string, number>>; markets?: Record<string, MarketFacts> }
const rivals = registry.rivals as unknown as Record<string, Rival>

/** One rendering of a price, shown for every site currency in `curs`. */
export interface Variant { curs: Currency[]; text: string }

function rivalOf(id: string): Rival {
  const r = rivals[id]
  if (!r) throw new Error(`prices.json has no rival "${id}"`)
  return r
}

/** The published amounts of one item, keyed by the site currency each list serves. */
function amounts(ref: string): Partial<Record<Currency, { amount: number; list: PriceList }>> {
  const [rivalId, item] = ref.split('/')
  const r = rivalOf(rivalId)
  const byList = r.prices[item]
  if (!byList) throw new Error(`prices.json has no price "${ref}"`)
  const out: Partial<Record<Currency, { amount: number; list: PriceList }>> = {}
  for (const [listId, amount] of Object.entries(byList)) {
    const list = r.lists[listId]
    if (!list) throw new Error(`prices.json: "${ref}" names list "${listId}", which ${rivalId} does not have`)
    out[serves(list)] = { amount, list }
  }
  return out
}

/** The currency shown for `cur`: the rival's own list in it, or its nearest. */
const shownIn = (have: Partial<Record<Currency, unknown>>, cur: Currency): Currency =>
  have[cur] ? cur : NEAREST.find((c) => have[c])!

/** A text per site currency, with equal texts merged into one rendering. */
export const byCurrency = (textFor: (cur: Currency) => string): Variant[] => {
  const out: Variant[] = []
  for (const cur of CURRENCIES) {
    const text = textFor(cur)
    const v = out.find((x) => x.text === text)
    if (v) v.curs.push(cur)
    else out.push({ curs: [cur], text })
  }
  return out
}

function variants(ref: string, times = 1): Variant[] {
  const have = amounts(ref)
  return byCurrency((cur) => {
    const { amount, list } = have[shownIn(have, cur)]!
    return formatMoney(amount * times, list.currency)
  })
}

const TOKEN = /\{(p|ex):([^}]+)\}/g

function tokenVariants(kind: string, body: string): Variant[] {
  if (kind === 'ex') {
    const [cur, n] = body.split(' ')
    if (!CURRENCIES.includes(cur as Currency) || !Number.isFinite(Number(n))) throw new Error(`Bad example amount {ex:${body}}`)
    return [{ curs: [...CURRENCIES], text: formatMoney(Number(n), cur as Currency) }]
  }
  const [ref, times = '1'] = body.split('*')
  const [item, pin] = ref.split('@')
  if (!pin) return variants(item, Number(times))
  // A page about one market quotes that market's list whatever the visitor picks.
  const e = Object.values(amounts(item)).find((x) => x!.list === rivalOf(item.split('/')[0]).lists[pin])
  if (!e) throw new Error(`prices.json: "${item}" has no amount on list "${pin}"`)
  return [{ curs: [...CURRENCIES], text: formatMoney(e.amount * Number(times), e.list.currency) }]
}

/** A data string split into text and prices, for <Priced>. */
export function parts(s: string): (string | Variant[])[] {
  const out: (string | Variant[])[] = []
  let last = 0
  for (const m of s.matchAll(TOKEN)) {
    out.push(s.slice(last, m.index), tokenVariants(m[1], m[2]))
    last = m.index! + m[0].length
  }
  out.push(s.slice(last))
  return out.filter((p) => p !== '')
}

/** The string as text in the default currency: for <title>, meta and JSON-LD. */
export const plain = (s: string) =>
  s.replace(TOKEN, (_, kind, body) => tokenVariants(kind, body).find((v) => v.curs.includes(DEFAULT_CURRENCY))!.text)

/** Every {p:…} reference in a data structure. */
export const refsIn = (data: unknown) => [...JSON.stringify(data).matchAll(/\{p:([^}*]+)/g)].map((m) => m[1])

/** The references that change with the visitor's currency: those not pinned to one list. */
export const currencyRefs = (refs: string[]) => refs.filter((r) => !r.includes('@'))

/**
 * For a page's references: per rival, the site currencies it publishes no list
 * in, and what is shown instead. Rendered as the note under the currency picker.
 */
export function fallbackNotes(refs: string[]): Variant[] {
  const byRival = new Map<string, string[]>()
  for (const ref of new Set(refs)) {
    const rivalId = ref.split('/')[0]
    byRival.set(rivalId, [...(byRival.get(rivalId) ?? []), ref])
  }
  return byCurrency((cur) => {
    const lines: string[] = []
    for (const [rivalId, list] of byRival) {
      const shown = new Set(list.map((ref) => { const have = amounts(ref); return have[shownIn(have, cur)]!.list.currency }))
      shown.delete(cur)
      if (!shown.size) continue
      const what = [...shown].map((c) => CURRENCY_NAMES[c]).join(' and ')
      const name = rivalOf(rivalId).name
      lines.push(list.some((ref) => amounts(ref)[cur]?.list.currency === cur)
        ? `Some of ${name}’s prices here have no list in ${CURRENCY_NAMES[cur]}, so they are shown in ${what}, as ${name} publishes them.`
        : `${name} publishes no prices in ${CURRENCY_NAMES[cur]}, so its prices are shown in ${what}, as ${name} publishes them.`)
    }
    return lines.join(' ')
  })
}

/** The price lists a page's references were read from, for its Sources list: one per page, whatever its ?currency=. */
export function listsFor(refs: string[]): PriceList[] {
  const seen = new Map<string, PriceList>()
  for (const ref of refs) {
    const [item, pin] = ref.split('@')
    const pinned = pin && rivalOf(item.split('/')[0]).lists[pin]
    for (const { list } of Object.values(amounts(item)) as { list: PriceList }[]) {
      const page = list.url.split('?')[0]
      if ((!pinned || list === pinned) && !seen.has(page)) seen.set(page, list)
    }
  }
  return [...seen.values()]
}

export interface Market extends MarketFacts {
  list: PriceList
  plans: { name: string; monthly: number; yearly: number; fee: number }[]
}

const PLANS = ['basic', 'grow', 'advanced']

/** Shopify's market for each site currency: its own list in it, or the nearest one it has. */
export function shopifyMarkets(): Record<Currency, Market> {
  const shop = rivalOf('shopify')
  const have: Partial<Record<Currency, Market>> = {}
  for (const [listId, facts] of Object.entries(shop.markets ?? {})) {
    const list = shop.lists[listId]
    const plans = PLANS.map((k) => ({
      name: k[0].toUpperCase() + k.slice(1),
      monthly: shop.prices[`${k}-monthly`]?.[listId],
      yearly: shop.prices[`${k}-yearly`]?.[listId],
      fee: facts.fees[k],
    }))
    if (plans.some((p) => p.monthly === undefined || p.yearly === undefined || p.fee === undefined)) {
      throw new Error(`prices.json: Shopify market "${listId}" lacks a plan price or fee`)
    }
    have[serves(list)] = { ...facts, list, plans }
  }
  return Object.fromEntries(CURRENCIES.map((cur) => [cur, have[shownIn(have, cur)]!])) as Record<Currency, Market>
}
