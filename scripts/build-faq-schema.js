/**
 * Generate each page's FAQPage JSON-LD from the FAQ that is actually on it.
 *
 * The playbook's rule is one fact, one source of truth: hand-written schema
 * drifts from the visible copy the first time somebody edits one and not the
 * other, and structured data that contradicts the page is worse than none —
 * it is the version a search engine trusts and a reader never sees.
 *
 * So the visible <details> blocks are the source. This reads them and rewrites
 * the block between the FAQ-SCHEMA markers, for every page that has them.
 *
 *   node scripts/build-faq-schema.js          # check only, exits 1 if stale
 *   node scripts/build-faq-schema.js --write  # rewrite them
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const START = '<!-- FAQ-SCHEMA:start -->'
const END = '<!-- FAQ-SCHEMA:end -->'
const write = process.argv.includes('--write')

// One entry per indexable page. The canonical URL is what the @id is built
// from, so it has to match the page's own <link rel="canonical"> exactly —
// a mismatch here would point the FAQ at a URL that does not exist.
const PAGES = [
  { file: 'index.html', url: 'https://kitcommerce.store/' },
  { file: 'gocommerce/index.html', url: 'https://kitcommerce.store/gocommerce/' },
  { file: 'svelte-commerce/index.html', url: 'https://kitcommerce.store/svelte-commerce/' },
]

// Entities and tags have to go: schema carries text, not markup. A literal
// "&mdash;" inside a JSON-LD answer is what a search engine would quote.
function clean(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&harr;/g, '↔')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

let stale = 0
let checked = 0

for (const page of PAGES) {
  const file = path.join(ROOT, page.file)
  if (!fs.existsSync(file)) throw new Error(`missing page: ${page.file}`)

  const html = fs.readFileSync(file, 'utf8')

  const at = html.indexOf(START)
  const to = html.indexOf(END)
  if (at < 0 || to < 0) throw new Error(`FAQ-SCHEMA markers not found in ${page.file}`)

  // Canonical has to agree with the URL this script builds @id from, or the
  // structured data would describe a page that is not this one.
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)
  if (!canonical) throw new Error(`no canonical in ${page.file}`)
  if (canonical[1] !== page.url) {
    throw new Error(`canonical mismatch in ${page.file}: page says ${canonical[1]}, this script says ${page.url}`)
  }

  const section = html.match(/<section id="faq"[\s\S]*?<\/section>/)
  if (!section) throw new Error(`no #faq section in ${page.file}`)

  const pairs = []
  const re = /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g
  let m
  while ((m = re.exec(section[0]))) pairs.push({ q: clean(m[1]), a: clean(m[2]) })
  if (!pairs.length) throw new Error(`found #faq but no details/summary pairs in ${page.file}`)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': page.url + '#faq',
    mainEntity: pairs.map((p) => ({
      '@type': 'Question',
      name: p.q,
      acceptedAnswer: { '@type': 'Answer', text: p.a },
    })),
  }

  const block =
    START +
    '\n<script type="application/ld+json">' +
    JSON.stringify(schema) +
    '</script>\n' +
    END

  checked += pairs.length

  const current = html.slice(at, to + END.length)
  if (current === block) {
    console.log(`  ${page.file} — current, ${pairs.length} question(s)`)
    continue
  }

  if (!write) {
    console.error(`  ${page.file} — STALE, ${pairs.length} question(s) on the page`)
    stale++
    continue
  }

  fs.writeFileSync(file, html.slice(0, at) + block + html.slice(to + END.length))
  console.log(`  ${page.file} — rewritten, ${pairs.length} question(s)`)
}

if (stale) {
  console.error(`\n${stale} page(s) stale. Run: node scripts/build-faq-schema.js --write`)
  process.exit(1)
}

console.log(`\nFAQ schema OK across ${PAGES.length} pages, ${checked} questions total.`)
