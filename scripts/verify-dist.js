/**
 * Structural checks on the built site, as a build gate.
 *
 * `verify.js` reads prose and enforces the naming rules. This reads structure:
 * the things that are silently wrong in a static build and that no amount of
 * reading the page will reveal — a sitemap promising a URL that was never
 * built, a canonical and an og:url disagreeing about which page this is, an
 * internal link pointing at a path that does not exist, a root file the host
 * needs that the build forgot to copy.
 *
 * Every one of these has a specific failure it exists to prevent, named at the
 * check. Run after `npm run build`.
 *
 *   node scripts/verify-dist.js
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import worker from '../src/worker.js'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const SITE = 'https://kitcommerce.store'

if (!fs.existsSync(DIST)) {
  console.error('No dist/ — run `npm run build` first.')
  process.exit(1)
}

const problems = []
const fail = (what) => problems.push(what)

// ── every page in the build
function htmlUnder(dir, base = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) {
      if (e.name === '_astro') continue
      out.push(...htmlUnder(path.join(dir, e.name), rel))
    } else if (e.name.endsWith('.html')) out.push(rel)
  }
  return out
}

const pages = htmlUnder(DIST)
const read = (rel) => fs.readFileSync(path.join(DIST, rel), 'utf8')

// A URL path as the host will serve it → the file that answers it.
const fileFor = (urlPath) => {
  const clean = urlPath.replace(/^\//, '').replace(/[?#].*$/, '')
  if (clean === '' ) return 'index.html'
  if (clean.endsWith('/')) return clean + 'index.html'
  if (clean.endsWith('.html')) return clean
  // Extensionless: Astro emits directory-style pages.
  if (fs.existsSync(path.join(DIST, clean, 'index.html'))) return clean + '/index.html'
  return clean
}

// ── 1. canonical and og:url must name the same page
//
// When they disagree a crawler picks one and never tells you which, so the
// page can be indexed under a URL its own metadata does not claim.
for (const page of pages) {
  const html = read(page)
  if (/name="robots"[^>]*noindex/i.test(html)) continue // 404 and friends
  const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1]
  const ogUrl = (html.match(/<meta property="og:url" content="([^"]+)"/) || [])[1]
  if (!canonical) { fail(`${page}: no canonical`); continue }
  if (ogUrl && ogUrl !== canonical) fail(`${page}: og:url ${ogUrl} != canonical ${canonical}`)
  const target = fileFor(canonical.replace(SITE, ''))
  if (!fs.existsSync(path.join(DIST, target))) {
    fail(`${page}: canonical points at ${canonical}, which this build does not contain`)
  }
}

// ── 2. every sitemap URL must have been built
//
// A sitemap is a promise to a crawler. One that lists a page the build never
// produced spends crawl budget earning a 404.
const sitemaps = fs.readdirSync(DIST).filter((f) => f.startsWith('sitemap') && f.endsWith('.xml'))
let listed = 0
for (const sm of sitemaps) {
  for (const m of fs.readFileSync(path.join(DIST, sm), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = m[1]
    if (url.endsWith('.xml')) continue // a sitemap index pointing at another sitemap
    listed++
    if (!url.startsWith(SITE)) { fail(`${sm}: ${url} is not on ${SITE}`); continue }
    const target = fileFor(url.replace(SITE, ''))
    if (!fs.existsSync(path.join(DIST, target))) fail(`${sm}: lists ${url}, not in this build`)
  }
}

// ── 3. internal links must resolve
//
// A dead internal link is invisible until somebody clicks it, and it leaks
// whatever authority the linking page had into a 404.
const skip = /^(https?:|mailto:|tel:|#|data:)/
for (const page of pages) {
  const html = read(page)
  for (const m of html.matchAll(/href="(\/[^"]*)"/g)) {
    const href = m[1]
    if (skip.test(href)) continue
    const target = fileFor(href)
    if (fs.existsSync(path.join(DIST, target))) continue
    // A bare file that exists at the root (robots.txt, docker-compose.yml…)
    if (fs.existsSync(path.join(DIST, href.replace(/^\//, '').replace(/[?#].*$/, '')))) continue
    fail(`${page}: internal link ${href} resolves to nothing in the build`)
  }
}

// ── 3b. a fragment must land on an id
//
// /gocommerce/#modules with no such id is a dead link that returns 200 — the
// kind no crawler ever reports and every reader notices.
const idsOf = new Map()
const idsIn = (rel) => {
  if (!idsOf.has(rel)) idsOf.set(rel, new Set([...read(rel).matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])))
  return idsOf.get(rel)
}
for (const page of pages) {
  const html = read(page)
  for (const m of html.matchAll(/href="([^"]*#[^"]+)"/g)) {
    const href = m[1]
    if (/^(https?:|mailto:|tel:|data:)/.test(href)) continue
    const [p, frag] = href.split('#')
    const target = p === '' ? page : fileFor(p)
    if (!fs.existsSync(path.join(DIST, target))) continue // reported above
    if (!idsIn(target).has(frag)) fail(`${page}: link ${href} points at no id in ${target}`)
  }
}

// ── 4. files the host needs, which a build can silently drop
const required = ['robots.txt', 'llms.txt', '_headers', '_redirects', 'sitemap.xml', 'rss.xml', 'favicon.ico', '.well-known/security.txt']
for (const f of required) {
  if (!fs.existsSync(path.join(DIST, f))) fail(`missing from the build: ${f}`)
}

// ── 5. the IndexNow key, byte-exact
//
// It must be the 32 hex characters and nothing else. A trailing newline makes
// verification return 403, and the failure is silent from our side — the
// submission is simply never honoured.
const key = fs.readdirSync(DIST).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (!key) fail('no IndexNow key file at the build root')
else {
  const body = fs.readFileSync(path.join(DIST, key))
  const expected = key.replace(/\.txt$/, '')
  if (body.toString() !== expected) {
    fail(`IndexNow key ${key} holds ${JSON.stringify(body.toString())}, want exactly ${expected} (a trailing newline returns 403)`)
  }
}

// ── 6. nothing left pointing at where this site used to live
const stale = [/itswadesh\.github\.io/, /127\.0\.0\.1:4173/, /localhost:4321/]
for (const page of pages) {
  const html = read(page)
  for (const re of stale) {
    if (re.test(html)) fail(`${page}: still references ${re.source}`)
  }
}

// ── 7. every indexable page has its Markdown twin, and no twin is empty
//
// The Worker advertises a twin on every page in a Link header, deriving the
// URL from the path because it cannot cheaply check a file exists;
// scripts/markdown-alternates.mjs writes the files. The rule therefore lives
// in two places, and this is where they must agree: the Worker is asked what
// it would advertise, against a stand-in for the asset server, and the file
// it names must be in the build. A Link to a missing twin sends every answer
// engine that follows it to the 404 page.
//
// A twin with no body is worse than none: a reader that fetched it has been
// told the page says nothing. And a twin whose page is gone, or noindex, is
// served forever with a canonical pointing at nothing.
const assetsAnswering = (type) => ({
  fetch: async () => new Response('', { status: 200, headers: { 'content-type': type } }),
})
const ask = (urlPath, type) => worker.fetch(new Request(SITE + urlPath), { ASSETS: assetsAnswering(type) })

const indexable = new Map() // URL path → canonical, for every page that should have a twin
for (const page of pages) {
  if (!page.endsWith('index.html')) continue // 404.html has no directory URL
  const html = read(page)
  if (/name="robots"[^>]*noindex/i.test(html)) continue
  indexable.set('/' + page.replace(/index\.html$/, ''), (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1])
}

let twins = 0
for (const [urlPath, canonical] of indexable) {
  const link = (await ask(urlPath, 'text/html')).headers.get('link') || ''
  const twin = (link.match(/<([^>]+)>;\s*rel="alternate";\s*type="text\/markdown"/) || [])[1]
  if (!twin) { fail(`${urlPath}: the Worker advertises no Markdown twin for it`); continue }
  const file = path.join(DIST, twin.replace(/^\//, ''))
  if (!fs.existsSync(file)) {
    fail(`${urlPath}: the Worker advertises ${twin}, which is not in the build — did scripts/markdown-alternates.mjs run?`)
    continue
  }
  const md = fs.readFileSync(file, 'utf8')
  twins++
  if (!md.trim()) continue // reported once, below, with every other .md
  const split = md.indexOf('\n---\n')
  if (!md.startsWith('# ') || split < 0) fail(`${twin}: no "# title … ---" front block`)
  else if (!md.slice(split + 5).trim()) fail(`${twin}: the front block and nothing else — the page's content did not convert`)
  if (canonical && !md.includes(canonical)) fail(`${twin}: does not name its page's canonical, ${canonical}`)
}

function mdUnder(dir, base = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) out.push(...mdUnder(path.join(dir, e.name), rel))
    else if (e.name.endsWith('.md')) out.push(rel)
  }
  return out
}
for (const rel of mdUnder(DIST)) {
  const twin = '/' + rel
  if (!fs.readFileSync(path.join(DIST, rel), 'utf8').trim()) fail(`${twin}: empty`)
  const res = await ask(twin, 'text/markdown')
  const page = ((res.headers.get('link') || '').match(/<([^>]+)>;\s*rel="canonical"/) || [])[1]
  if (!/^text\/markdown;\s*charset=utf-8$/i.test(res.headers.get('content-type') || '')) {
    fail(`${twin}: the Worker would not serve it as text/markdown; charset=utf-8`)
  }
  if (!page) fail(`${twin}: the Worker gives it no canonical`)
  else if (!indexable.has(page.replace(SITE, ''))) fail(`${twin}: its canonical ${page} is not an indexable page in this build — a stale twin`)
}

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in the build:`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}

console.log(
  `Build is sound: ${pages.length} page(s), ${listed} sitemap URL(s), ${twins} Markdown twin(s), ` +
    `canonicals agree, internal links resolve, root files present.`,
)
