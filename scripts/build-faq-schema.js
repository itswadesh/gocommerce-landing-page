/**
 * Generate the FAQPage JSON-LD from the FAQ that is actually on the page.
 *
 * The playbook's rule is one fact, one source of truth: hand-written schema
 * drifts from the visible copy the first time somebody edits one and not the
 * other, and structured data that contradicts the page is worse than none —
 * it is the version a search engine trusts and a reader never sees.
 *
 * So the visible <details> blocks are the source. This reads them and rewrites
 * the block between the FAQ-SCHEMA markers.
 *
 *   node scripts/build-faq-schema.js          # check only, exits 1 if stale
 *   node scripts/build-faq-schema.js --write  # rewrite it
 */
const fs = require('fs')
const path = require('path')

const FILE = path.join(__dirname, '..', 'index.html')
const START = '<!-- FAQ-SCHEMA:start -->'
const END = '<!-- FAQ-SCHEMA:end -->'
const write = process.argv.includes('--write')

const html = fs.readFileSync(FILE, 'utf8')

// Pull the FAQ section, then each question/answer pair out of it.
const section = html.match(/<section id="faq"[\s\S]*?<\/section>/)
if (!section) throw new Error('no #faq section in index.html')

const pairs = []
const re = /<details>\s*<summary>([\s\S]*?)<\/summary>\s*<p>([\s\S]*?)<\/p>/g
let m
while ((m = re.exec(section[0]))) pairs.push({ q: clean(m[1]), a: clean(m[2]) })

if (!pairs.length) throw new Error('found #faq but no details/summary pairs')

// Entities and tags have to go: schema carries text, not markup. A literal
// "&mdash;" inside a JSON-LD answer is what a search engine would quote.
function clean(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&mdash;/g, '—')
    .replace(/&rsquo;/g, '’')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim()
}

const schema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  '@id': 'https://kitcommerce.store/#faq',
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

const at = html.indexOf(START)
const to = html.indexOf(END)
if (at < 0 || to < 0) throw new Error('FAQ-SCHEMA markers not found in index.html')

const current = html.slice(at, to + END.length)
if (current === block) {
  console.log(`FAQ schema is current — ${pairs.length} question(s)`)
  process.exit(0)
}

if (!write) {
  console.error(`FAQ schema is stale — ${pairs.length} question(s) on the page.`)
  console.error('Run: node scripts/build-faq-schema.js --write')
  process.exit(1)
}

fs.writeFileSync(FILE, html.slice(0, at) + block + html.slice(to + END.length))
console.log(`FAQ schema rewritten from the page — ${pairs.length} question(s)`)
for (const p of pairs) console.log('  ' + p.q)
