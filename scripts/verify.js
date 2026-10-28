/**
 * Enforce the site's naming rules mechanically.
 *
 * KitCommerce is the platform whose packages are GoCommerce and Svelte
 * Commerce, and the rules that keep that honest are easy to break by
 * accident: a "KitCommerce Cloud" or an "enterprise edition" reads naturally
 * and describes something that does not exist, and the package names drift
 * ("Go Commerce", "SvelteCommerce"). A rule nothing checks is a rule that
 * drifts, so this checks it.
 *
 *   node scripts/verify.js
 *
 * Exits non-zero on any violation, naming the file, the line and the text.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// __dirname does not exist in an ES module; derive it from this file's URL.
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

// Built output, not source, and discovered rather than listed.
//
// Two reasons. A hardcoded list silently stops covering a page the moment one
// is added, and this list had already gone stale once. And the Astro migration
// left the old hand-written HTML at the repository root — still tracked, no
// longer shipped — so checking those was auditing files nobody will ever load
// while reporting success, which is the one thing a checker must never do.
//
// dist/ is what Cloudflare serves, so dist/ is what gets audited. Run
// `npm run build` first, or this checks the previous build.
const DIST = path.join(ROOT, 'dist')
const { hostedFee, feeBasis, gstIndia, signupUrl } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'pricing.json'), 'utf8'))

function htmlUnder(dir, base = '') {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name
    if (entry.isDirectory()) {
      // _astro holds hashed bundles: generated, and carrying no prose.
      if (entry.name === '_astro') continue
      out.push(...htmlUnder(path.join(dir, entry.name), rel))
    } else if (entry.name.endsWith('.html')) {
      out.push(rel)
    }
  }
  return out
}

if (!fs.existsSync(DIST)) {
  console.error('No dist/ — run `npm run build` before verifying.')
  process.exit(1)
}

// llms.txt and README.md stay out of scope on purpose: both quote the forbidden
// phrasings in order to forbid them, and a checker that cannot tell a rule from
// a violation would make the rule unwritable.
const PAGES = htmlUnder(DIST)

const RULES = [
  {
    // Since 25 September 2026 KitCommerce is the platform — GoCommerce and
    // Svelte Commerce are its packages — so "KitCommerce platform" is
    // allowed. What it does not have is an edition, a tier, a cloud or an
    // enterprise version, and a sentence claiming one describes something that
    // does not exist.
    re: /KitCommerce\s+(edition|tier|cloud|enterprise|pro|plus|premium)\b/gi,
    why: 'KitCommerce has no edition, tier, cloud or enterprise version. Its packages are MIT licensed and free to run yourself; hosting on kitcommerce.store is priced per sale and has no product name.',
  },
  {
    // Until 26 October 2026 the site said there was nothing to pay at all.
    // Since then a store hosted on kitcommerce.store pays a share of every
    // successful order (src/data/pricing.json), so these phrasings are false.
    re: /\b(free,? for life|no hosted (offering|version|tier|option)|hosted tier|nothing to (buy|pay)|no customer pays|no paid editions?)\b/gi,
    why: 'Stores hosted on kitcommerce.store pay a share of every successful order; only self-hosting is free. See src/data/pricing.json.',
  },
  {
    // A data file's {hostedFee}, {modules} or kin that no page filled in (src/lib/pricing.ts).
    re: /\{(hostedFee|hostedFeeText|hostedFeeShort|feeBasis|plusGst|modules|binaryModules|paymentModules|fulfilmentModules|apiOperations|coreOperations|moduleOperations|adminScreens|tests|testsFloor|mcpTools|mcpReadTools|mcpWriteTools|coreRights|migrations|events|agentRules|agentNotes|skillGuides|backends|otherBackends)\}/g,
    why: 'Unfilled token: render this data through fill() from src/lib/pricing.ts.',
  },
  {
    // A {p:…} price that no page rendered (src/lib/money.ts).
    re: /\{(p|ex):[^}]*\}/g,
    why: 'Unrendered price: render this string through <Priced> (src/components/Priced.astro).',
  },
  {
    // The hosted fee is typed once, in src/data/pricing.json.
    re: /\b[\d.]+% of every successful order/gi,
    why: `The hosted fee is ${hostedFee} of ${feeBasis}, from src/data/pricing.json.`,
    allow: (line, match) => match.startsWith(hostedFee + ' '),
  },
  {
    // Until 28 October 2026 the fee was worded "of each successful sale". The
    // owner's own words are "every successful order", and the site uses one wording.
    re: /\b[\d.]+% of each (successful )?sale\b/gi,
    why: `Word the fee as pricing.json does: "${hostedFee} of ${feeBasis}".`,
    allow: (line, match) => !match.startsWith(hostedFee + ' '),
  },
  {
    // The GST rate on the hosted fee is typed once too, as gstIndia.
    re: /\b[\d.]+% GST on the fee/gi,
    why: `Stores in India pay ${gstIndia} GST on the hosted fee, from src/data/pricing.json.`,
    allow: (line, match) => match.startsWith(gstIndia + ' '),
  },
  {
    // The repository slug is svelte-commerce; the project in prose is two words.
    re: /Svelte-Commerce/g,
    why: 'In prose the project is "Svelte Commerce". The hyphen belongs to the repository slug only.',
    allow: (line) => /github\.com|href=|srcset=|\/svelte-commerce/i.test(line),
  },
  {
    re: /\bGo\s+Commerce\b/g,
    why: 'One word: GoCommerce.',
  },
  {
    re: /\bSvelteCommerce\b/g,
    why: 'Two words: Svelte Commerce.',
  },
  {
    re: /\bKit\s+Commerce\b/g,
    why: 'One word: KitCommerce.',
  },
]

// What a reader and a crawler see. Comments are stripped because this file's own
// explanatory comments in the HTML legitimately discuss the rules, and script
// and style because neither is prose.
function visibleText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .replace(/<script[\s\S]*?<\/script>/gi, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
    .replace(/<style[\s\S]*?<\/style>/gi, (m) => '\n'.repeat((m.match(/\n/g) || []).length))
}

let violations = 0
let scanned = 0

for (const page of PAGES) {
  const file = path.join(DIST, page)
  if (!fs.existsSync(file)) {
    console.error(`  MISSING  ${page}`)
    violations++
    continue
  }
  scanned++

  // Line numbers are preserved by the stripping above, so a reported line
  // number points at the real one in the file.
  const lines = visibleText(fs.readFileSync(file, 'utf8')).split('\n')

  for (const [i, line] of lines.entries()) {
    for (const rule of RULES) {
      rule.re.lastIndex = 0
      let m
      while ((m = rule.re.exec(line))) {
        if (rule.allow && rule.allow(line, m[0])) continue
        console.error(`  ${page}:${i + 1}  "${m[0].trim()}"`)
        console.error(`      ${rule.why}`)
        violations++
      }
    }
  }
}

// Pages written for stores in India (every solution page, and comparisons
// marked "market": "IN") state the fee with its GST, as the owner decided on
// 27 October 2026. Tags are dropped first, so "<b>1%</b> of every order" counts.
// Pages with a currency picker show the GST to rupee visitors in a variant
// span, which this cannot tell from the fee's own text, so they are not held here.
const dataJson = (dir) => fs.readdirSync(path.join(ROOT, 'src', 'data', dir)).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', dir, f), 'utf8')))
const indiaPages = [
  ...dataJson('solutions').map((p) => p.path),
  ...dataJson('compare').filter((c) => c.market === 'IN').map((c) => `/compare/${c.slug}/`),
].map((p) => p.slice(1) + 'index.html')
for (const page of indiaPages) {
  const file = path.join(DIST, page)
  if (!fs.existsSync(file)) {
    console.error(`  MISSING  ${page}`)
    violations++
    continue
  }
  for (const [i, line] of visibleText(fs.readFileSync(file, 'utf8')).split('\n').entries()) {
    for (const m of line.replace(/<[^>]+>/g, '').matchAll(new RegExp(`(?<![\\d.])${hostedFee.replace('.', '\\.')} of every (successful )?order\\b(?!.{0,120}GST)`, 'g'))) {
      console.error(`  ${page}:${i + 1}  "${m[0]}"`)
      console.error(`      A page for Indian stores states the fee with its GST: "${hostedFee} of ${feeBasis}, plus ${gstIndia} GST on the fee".`)
      violations++
    }
  }
}

// llms.txt is out of the rules' scope (see above), so its statement of the
// price is held to pricing.json here instead.
const llms = fs.readFileSync(path.join(DIST, 'llms.txt'), 'utf8')
for (const m of llms.matchAll(/\b[\d.]+% of (every successful order|each (successful )?sale)/g)) {
  if (m[0] !== `${hostedFee} of ${feeBasis}`) {
    console.error(`  llms.txt  "${m[0]}" disagrees with src/data/pricing.json (${hostedFee} of ${feeBasis})`)
    violations++
  }
}
for (const m of llms.matchAll(/\b[\d.]+% GST/g)) {
  if (!m[0].startsWith(gstIndia + ' ')) {
    console.error(`  llms.txt  "${m[0]}" disagrees with src/data/pricing.json (${gstIndia} GST)`)
    violations++
  }
}
if (!llms.includes(signupUrl)) {
  console.error(`  llms.txt  does not name the sign-up page, ${signupUrl}`)
  violations++
}

// ── Counts: every figure the site states about the two packages agrees with
// src/data/facts.json (scripts/read-facts.mjs reads it from GoCommerce) and
// src/data/connectors.json. Each rule names a phrase, the figures it may
// carry, and a floor under which the phrase means something else ("2
// modules"). Blog posts are dated and keep the figures of their day.
const facts = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'facts.json'), 'utf8'))
const backendCount = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'connectors.json'), 'utf8')).connectors.length
const floor100 = Math.floor(facts.tests / 100) * 100
const COUNTS = [
  [/(\d[\d,]*) (?:MIT |GoCommerce |Go )?modules\b/g, 20, [facts.modules], 'modules'],
  [/(\d+) (?:payment|gateway) modules\b/g, 0, [facts.paymentModules], 'paymentModules'],
  [/(\d+) (?:fulfilment|shipping|carrier) modules\b/g, 0, [facts.fulfilmentModules], 'fulfilmentModules'],
  [/(\d+) (?:store |built-in |MCP )?tools\b/g, 15, [facts.mcpTools], 'mcpTools'],
  [/(\d[\d,]*) (?:documented (?:REST |API )?|REST |API |HTTP )?operations\b/g, 100, [facts.apiOperations, facts.coreOperations, facts.moduleOperations], 'apiOperations'],
  [/(\d[\d,]*)\+? tests\b/g, 500, [facts.tests, floor100], 'tests'],
  [/(\d+) (?:Svelte |embedded )?admin screens\b|(\d+)-screen (?:Svelte )?admin\b/g, 0, [facts.adminScreens], 'adminScreens'],
  [/(\d+) (?:other |measured )?(?:commerce |Svelte Commerce |backend )?(?:backends|connectors|backend connectors|backend integrations)\b/g, 20, [backendCount, backendCount - 1], 'connectors.json'],
  [/(\d+) (?:architectural |architecture )?rules\b/g, 10, [facts.agentRules], 'agentRules'],
  [/(\d+) task guides\b/g, 0, [facts.skillGuides], 'skillGuides'],
  [/(\d+) core rights\b/g, 0, [facts.coreRights], 'coreRights'],
  [/(\d+) migrations\b/g, 10, [facts.migrations], 'migrations'],
  [/(\d+) commerce events\b/g, 0, [facts.events], 'events'],
]
let countsChecked = 0
const checkCounts = (where, text) => {
  for (const [re, min, allowed, key] of COUNTS) {
    for (const m of text.matchAll(re)) {
      const value = Number((m[1] ?? m[2]).replace(/,/g, ''))
      if (value < min) continue
      countsChecked++
      if (!allowed.includes(value)) {
        console.error(`  ${where}  "${m[0]}" disagrees with ${key} (${allowed.join(' or ')}). Render it from src/lib/facts.ts.`)
        violations++
      }
    }
  }
}
for (const page of PAGES) {
  if (page.startsWith('blog/')) continue
  checkCounts(page, visibleText(fs.readFileSync(path.join(DIST, page), 'utf8')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
}
checkCounts('llms.txt', llms)

// ── The connector's version is said once, in src/data/connector.json, and is
// npm's latest. A version near "GoCommerce … connector" anywhere else is a stale
// copy. The npm check is skipped, saying so, when npm cannot be reached.
const connector = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'connector.json'), 'utf8'))
const checkConnector = (where, text) => {
  for (const m of text.matchAll(/(?:GoCommerce[^.]{0,60}?connector|gocommerce-connector|connector between them)[^.]{0,60}?\b(\d+\.\d+\.\d+)\b/gi)) {
    if (m[1] !== connector.version) {
      console.error(`  ${where}  "${m[0].slice(-60)}" names connector ${m[1]}; src/data/connector.json says ${connector.version}.`)
      violations++
    }
  }
}
for (const page of PAGES) checkConnector(page, visibleText(fs.readFileSync(path.join(DIST, page), 'utf8')).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '))
checkConnector('llms.txt', llms)
let npmVersion = ''
try { npmVersion = execSync(`npm view ${connector.package} version`, { encoding: 'utf8', timeout: 30000, stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch {}
if (!npmVersion) console.log(`npm not reached; connector.json's ${connector.version} not checked against it.`)
else if (npmVersion !== connector.version) {
  console.error(`  connector.json says ${connector.package} ${connector.version}; npm's latest is ${npmVersion}. Check what changed, then update it.`)
  violations++
}

// ── Prices: every rival price is on a published list, with its source and date
//
// Since 26 October 2026 prices are shown in the visitor's currency, never
// converted (docs/decisions.md). That holds only while every amount sits in
// src/data/prices.json on a list naming its currency, URL and read date, and
// no amount is typed anywhere else.
const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'AED']
const today = new Date().toISOString().slice(0, 10)
const { rivals } = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'prices.json'), 'utf8'))
let priceCount = 0
for (const [id, r] of Object.entries(rivals)) {
  for (const [listId, l] of Object.entries(r.lists)) {
    const bad = !CURRENCIES.includes(l.currency) || (l.for && !CURRENCIES.includes(l.for)) ? `currency ${l.currency} (for ${l.for}) is not one the site shows`
      : !/^https:\/\//.test(l.url || '') ? 'no https source URL'
      : !/^\d{4}-\d{2}-\d{2}$/.test(l.read || '') || l.read > today ? 'no read date, or one in the future'
      : !l.label ? 'no label' : ''
    if (bad) { console.error(`  prices.json ${id}.lists.${listId}: ${bad}`); violations++ }
  }
  for (const [listId, m] of Object.entries(r.markets ?? {})) {
    if (!r.lists[listId] || !/^https:\/\//.test(m.feeUrl || '') || !/^https:\/\//.test(m.paymentsUrl || '') || !/^\d{4}-\d{2}-\d{2}$/.test(m.read || '')) {
      console.error(`  prices.json ${id}.markets.${listId}: needs a list of its own, a source for its fees and for Shopify Payments, and a read date`)
      violations++
    }
  }
  for (const [item, byList] of Object.entries(r.prices)) {
    for (const [listId, amount] of Object.entries(byList)) {
      priceCount++
      if (!r.lists[listId]) { console.error(`  prices.json ${id}.prices.${item}: list "${listId}" does not exist, so the price has no source`); violations++ }
      if (typeof amount !== 'number' || !(amount >= 0)) { console.error(`  prices.json ${id}.prices.${item}.${listId}: ${amount} is not an amount`); violations++ }
    }
  }
}

// An amount of money with no source: a currency sign or code before a number
// that is not zero. Zero is what the MIT code costs, not anyone's price.
const MONEY = /(?:[₹€£]|\b(?:US|CA|A|S|NZ)?\$|\$|\b(?:Rs\.?|INR|USD|EUR|GBP|AUD|CAD|SGD|AED) ?)\s?(?!0(?![\d,.]*[1-9]))\d[\d,.]*/g

// Rival prices live in the comparisons and on /pricing/, so that is where an
// amount outside a {p:…} or {ex:…} token is a price with no source. Elsewhere
// amounts are other facts, cited where they stand: a GST threshold, what a
// module prints for ₹1,234.50, a demo order in a test report.
const COMPARE = path.join(ROOT, 'src', 'data', 'compare')
for (const file of fs.readdirSync(COMPARE).filter((f) => f.endsWith('.json')).map((f) => path.join(COMPARE, f))) {
  const text = fs.readFileSync(file, 'utf8').replace(/\{(p|ex):[^}]+\}/g, '')
  for (const m of text.matchAll(MONEY)) {
    console.error(`  ${path.relative(ROOT, file)}  "${m[0]}" is typed by hand. Put it in src/data/prices.json with its source and write {p:rival/item}.`)
    violations++
  }
}

// A comparison's summary, label, h1 and tagline are reused as plain link cards
// on pages with no currency picker, so they carry no prices.
for (const f of fs.readdirSync(path.join(ROOT, 'src', 'data', 'compare')).filter((f) => f.endsWith('.json'))) {
  const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'compare', f), 'utf8'))
  for (const k of ['summary', 'label', 'h1', 'tagline']) {
    if (/\{(p|ex):/.test(c[k] || '')) { console.error(`  compare/${f} ${k}: no prices here; it is shown as a link card elsewhere`); violations++ }
  }
}

// In the built comparison and pricing pages' body text: anything outside a rendered price.
for (const page of PAGES) {
  if (!/^(compare|pricing)\//.test(page)) continue
  const html = fs.readFileSync(path.join(DIST, page), 'utf8')
  const body = visibleText(html.slice(html.indexOf('<body')))
    .replace(/<span class="px">(?:<span data-c="[^"]*">[^<]*<\/span>)+<\/span>/g, '')
    .replace(/<(code|pre)\b[\s\S]*?<\/\1>/g, '')
  for (const m of body.matchAll(MONEY)) {
    console.error(`  ${page}  "${m[0]}" is not rendered from src/data/prices.json, so it has no source.`)
    violations++
  }
}

if (violations) {
  console.error(`\n${violations} naming violation(s) across ${scanned} page(s).`)
  process.exit(1)
}

console.log(`Naming rules hold across ${scanned} pages; ${priceCount} published prices, each with its source and date, and none typed by hand; ${countsChecked} stated counts agree with facts.json (GoCommerce ${facts.commit}).`)
