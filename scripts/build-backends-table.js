/**
 * Generate the connector matrix on /svelte-commerce/backends/ from
 * data/connectors.json.
 *
 * Same rule as the FAQ schema: one fact, one source. Twenty-six rows with
 * coverage scores is exactly the kind of table that rots when it is edited by
 * hand, and a wrong "✅ auth" here is a claim that someone builds a store on.
 * The data file carries its own provenance — which repository it was read
 * from, on what date, and how coverage is measured.
 *
 *   node scripts/build-backends-table.js          # check only, exits 1 if stale
 *   node scripts/build-backends-table.js --write  # rewrite it
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PAGE = path.join(ROOT, 'svelte-commerce', 'backends', 'index.html')
const DATA = path.join(ROOT, 'data', 'connectors.json')
const START = '<!-- BACKENDS-TABLE:start -->'
const END = '<!-- BACKENDS-TABLE:end -->'
const write = process.argv.includes('--write')

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Three states, three shapes — not three colours. "unsupported" is not a gap we
// have yet to fill, it is the platform having no such endpoint, and conflating
// the two would misdirect anyone deciding what to contribute.
const MARK = {
  wired: { cls: 'ok', glyph: '●', label: 'wired' },
  unsupported: { cls: 'no', glyph: '✕', label: 'no endpoint on the platform' },
  unwired: { cls: 'pending', glyph: '○', label: 'not yet wired' },
}

function cell(state) {
  const m = MARK[state] || MARK.unwired
  return `<td class="mark ${m.cls}"><span aria-hidden="true">${m.glyph}</span><span class="vh">${m.label}</span></td>`
}

const doc = JSON.parse(fs.readFileSync(DATA, 'utf8'))
const rows = doc.connectors.slice().sort((a, b) => b.wired / b.total - a.wired / a.total || a.name.localeCompare(b.name))

const body = rows
  .map((c) => {
    const pct = Math.round((c.wired / c.total) * 100)
    return `<tr>
<th scope="row"><a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.name)}</a></th>
<td class="cov"><span class="bar" style="--pct:${pct}%"><span class="num">${c.wired}/${c.total}</span></span></td>
${cell(c.cart)}${cell(c.checkout)}${cell(c.auth)}
<td class="gaps">${c.gaps ? esc(c.gaps) : '<span class="none">none</span>'}</td>
</tr>`
  })
  .join('\n')

// GoCommerce is not in the source data because it is not a connector yet. It is
// listed last, explicitly, so the page answers the question everybody arrives
// with instead of leaving them to notice an absence.
const gocommerce = `<tr class="row-pending">
<th scope="row">GoCommerce</th>
<td class="cov"><span class="num none">—</span></td>
${cell('unwired')}${cell('unwired')}${cell('unwired')}
<td class="gaps">connector in development, not published</td>
</tr>`

// The provenance sentence sits above the scroller, not in the <caption>. A
// caption is laid out at the table's width, so a long one both forces page
// overflow at phone widths and makes the reader scroll sideways to finish a
// sentence. The caption keeps only the short accessible name.
const table = `<p class="tbl-note">Read from <code>${esc(doc._source)}</code> on <time datetime="${esc(doc._read)}">${esc(doc._read)}</time>. ${esc(doc._measured)}</p>
<div class="tbl-scroll">
<table class="matrix">
<caption class="vh">Connector coverage across ${rows.length} commerce platforms</caption>
<thead>
<tr>
<th scope="col">Platform</th>
<th scope="col">Coverage</th>
<th scope="col" class="mark">Cart</th>
<th scope="col" class="mark">Checkout</th>
<th scope="col" class="mark">Auth</th>
<th scope="col">Known gaps</th>
</tr>
</thead>
<tbody>
${body}
${gocommerce}
</tbody>
</table>
</div>`

const block = START + '\n' + table + '\n' + END

const html = fs.readFileSync(PAGE, 'utf8')
const at = html.indexOf(START)
const to = html.indexOf(END)
if (at < 0 || to < 0) throw new Error('BACKENDS-TABLE markers not found in ' + PAGE)

const current = html.slice(at, to + END.length)
if (current === block) {
  console.log(`backends table is current — ${rows.length} connectors`)
  process.exit(0)
}
if (!write) {
  console.error(`backends table is stale — ${rows.length} connectors in data/connectors.json`)
  console.error('Run: node scripts/build-backends-table.js --write')
  process.exit(1)
}

fs.writeFileSync(PAGE, html.slice(0, at) + block + html.slice(to + END.length))
console.log(`backends table rewritten — ${rows.length} connectors + GoCommerce`)
