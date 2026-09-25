// A social card for every page, public/og/<slug>.jpg, where the slug is the
// path with its slashes as -- ("home" for /). Base.astro links a page's card
// as og:image when the file exists and falls back to the site-wide one when
// it does not, so a page added since the last run still shares — just
// generically.
//
// Each card says what the page's own metadata says and nothing more: its
// og:title, its og:description, and the kicker from its page head as the
// eyebrow (or the section it sits in, from the breadcrumb, when the page has
// no kicker or the kicker only repeats the title). The words come from dist/,
// so they are the ones a crawler reads, not a second copy kept in sync by
// hand. The design is og-template.html: the site's paper, ink, faces and mark.
//
// Run after `npm run build`, then commit public/og/:
//
//   node scripts/og-images.mjs              every indexable page
//   node scripts/og-images.mjs home compare only / and paths containing "compare"
//
// The cards are pre-rendered and committed, not made at build time, because
// they need a real browser: the build machine has no Chrome, and the SVG
// rasterisers that do run there (librsvg, under sharp) cannot use the site's
// woff2 faces, so a card built there would be set in whatever serif the
// machine had. A full run re-renders every card and removes any whose page is
// gone; the output is deterministic, so an unchanged page leaves no diff.
import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const OUT = path.join(ROOT, 'public', 'og')
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const WIDTH = 1200
const HEIGHT = 630
const PARALLEL = 4
const filters = process.argv.slice(2)

if (!existsSync(DIST)) {
  console.error('No dist/ — run `npm run build` first.')
  process.exit(1)
}
if (!existsSync(CHROME)) {
  console.error(`No Chrome at ${CHROME} — set CHROME to its path.`)
  process.exit(1)
}

const template = readFileSync(path.join(ROOT, 'scripts', 'og-template.html'), 'utf8')
const fonts = pathToFileURL(path.join(ROOT, 'public', 'assets', 'fonts') + path.sep).href

// ── the pages: dist/**/index.html, less anything a crawler is told to skip

function indexFiles(dir, base = '') {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name !== '_astro') out.push(...indexFiles(path.join(dir, e.name), base + e.name + '/'))
    } else if (e.name === 'index.html') out.push(base)
  }
  return out
}

const named = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', rarr: '→', harr: '↔', middot: '·', hellip: '…' }
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
  e[0] === '#' ? String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : +e.slice(1)) : named[e] ?? m)
const text = (html) => decode(html.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
const escape = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])
const meta = (html, attr, name) => {
  const m = html.match(new RegExp(`<meta ${attr}="${name}" content="([^"]*)"`))
  return m ? decode(m[1]).trim() : ''
}
const titleCase = (slug) => slug.split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ')

function card(dir) {
  const html = readFileSync(path.join(DIST, dir, 'index.html'), 'utf8')
  if (/<meta name="robots"[^>]*content="noindex/i.test(html)) return null
  const urlPath = '/' + dir
  const slug = urlPath === '/' ? 'home' : urlPath.replace(/^\/+|\/+$/g, '').replace(/\//g, '--')
  const title = meta(html, 'property', 'og:title') || text((html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '')
  const description = meta(html, 'property', 'og:description') || meta(html, 'name', 'description')

  // The page head is the section holding the h1; its kicker, if it has one,
  // is the eyebrow. A kicker further down the page labels a section, not the
  // page, so it does not count.
  let kicker = ''
  const h1 = html.indexOf('<h1')
  if (h1 > -1) {
    const start = html.lastIndexOf('<section', h1)
    const end = html.indexOf('</section>', h1)
    const head = html.slice(start > -1 ? start : h1, end > -1 ? end : undefined)
    kicker = text((head.match(/<p class="kicker"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '')
  }
  // Otherwise the section the page sits in: the breadcrumb for the first path
  // segment, which names it the way the site does ("Architecture", not
  // "Go Svelte Ecommerce"); failing that, the site. Any of the three that the
  // title already starts with is passed over — compare pages kick off with
  // the title itself ("KitCommerce vs Shopify"), and above the title it
  // would only stutter.
  const first = dir.split('/')[0]
  const trail = (html.match(/<nav class="wrap crumbs"[\s\S]*?<\/nav>/) || [''])[0]
  const crumbs = [...trail.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1]))
  const section = crumbs[1] || (first ? titleCase(first) : '')
  const eyebrow = [kicker, section, 'kitcommerce.store'].find((e) => e && !title.toLowerCase().startsWith(e.toLowerCase()))
  return { urlPath, slug, title, description, eyebrow: eyebrow || 'kitcommerce.store' }
}

let cards = indexFiles(DIST).sort().map(card).filter(Boolean)
if (filters.length) cards = cards.filter((c) => filters.some((f) => c.slug === f || c.urlPath.includes(f)))
if (!cards.length) {
  console.error('No pages to draw' + (filters.length ? ` matching ${filters.join(', ')}` : '') + '.')
  process.exit(1)
}

// ── drawing: fill the template, let Chrome lay it out, let sharp encode it

const tmp = mkdtempSync(path.join(tmpdir(), 'kc-og-'))
mkdirSync(OUT, { recursive: true })

const chrome = (args) => new Promise((resolve, reject) => {
  execFile(CHROME, args, { timeout: 60000, windowsHide: true }, (err, stdout, stderr) =>
    err ? reject(new Error(`${err.message}\n${stderr}`)) : resolve())
})

async function draw(c, worker) {
  const html = path.join(tmp, c.slug + '.html')
  const png = path.join(tmp, c.slug + '.png')
  const jpg = path.join(OUT, c.slug + '.jpg')
  writeFileSync(html, template
    .replaceAll('{{FONTS}}', fonts)
    .replaceAll('{{EYEBROW}}', escape(c.eyebrow))
    // A dash, plus or arrow ends its line rather than starting the next, and
    // the one two-word product name is not split across lines.
    .replaceAll('{{TITLE}}', escape(c.title.replace(/ (?=[—–+↔&] )/g, ' ').replace(/Svelte Commerce/g, 'Svelte Commerce')))
    .replaceAll('{{DESCRIPTION}}', escape(c.description)))
  await chrome([
    '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
    // A profile of its own: without one, Chrome on a desktop can hand the
    // request to the browser the user already has open.
    `--user-data-dir=${path.join(tmp, 'profile-' + worker)}`,
    '--hide-scrollbars', '--force-device-scale-factor=1', `--window-size=${WIDTH},${HEIGHT}`,
    // Virtual time runs until the page goes quiet, so the fonts have loaded
    // and the title has been fitted before the shot is taken.
    '--virtual-time-budget=5000',
    `--screenshot=${png}`, pathToFileURL(html).href,
  ])
  const shot = sharp(png)
  const { width, height } = await shot.metadata()
  if (width !== WIDTH || height !== HEIGHT) throw new Error(`${c.slug}: screenshot is ${width}×${height}, want ${WIDTH}×${HEIGHT}`)
  // The card is hidden until it is fitted; an all-white shot means it never was.
  const { channels } = await sharp(png).stats()
  if (channels.every((ch) => ch.min > 200)) throw new Error(`${c.slug}: blank card — the fonts or the fit script did not finish`)
  await shot.flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true }).toFile(jpg)
  return statSync(jpg).size
}

const results = new Array(cards.length)
let next = 0
let failed = 0
try {
  await Promise.all(Array.from({ length: Math.min(PARALLEL, cards.length) }, async (_, worker) => {
    while (next < cards.length) {
      const i = next++
      const c = cards[i]
      try {
        results[i] = await draw(c, worker)
      } catch (e) {
        failed++
        console.error(`FAILED ${c.urlPath}: ${e.message.split('\n')[0]}`)
      }
    }
  }))
} finally {
  rmSync(tmp, { recursive: true, force: true })
}

const kb = (n) => (n / 1024).toFixed(1).padStart(5) + ' KB'
const width = Math.max(...cards.map((c) => c.slug.length)) + 7
cards.forEach((c, i) => {
  if (results[i] != null) console.log(`og/${c.slug}.jpg`.padEnd(width) + `  ${kb(results[i])}  ${c.eyebrow} / ${c.title}`)
})

// A full run owns the directory: a card whose page is gone is removed.
if (!filters.length && !failed) {
  const keep = new Set(cards.map((c) => c.slug + '.jpg'))
  for (const f of readdirSync(OUT)) {
    if (f.endsWith('.jpg') && !keep.has(f)) {
      rmSync(path.join(OUT, f))
      console.log(`removed og/${f} — no such page in dist/`)
    }
  }
}

const sizes = results.filter((n) => n != null)
console.log(`\n${sizes.length} card(s) in public/og/, ${kb(Math.min(...sizes)).trim()} – ${kb(Math.max(...sizes)).trim()}` +
  (failed ? `; ${failed} failed` : ''))
if (failed) process.exit(1)
