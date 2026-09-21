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

// ── 4. files the host needs, which a build can silently drop
const required = ['robots.txt', 'llms.txt', '_headers', '_redirects']
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

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in the build:`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}

console.log(
  `Build is sound: ${pages.length} page(s), ${listed} sitemap URL(s), ` +
    `canonicals agree, internal links resolve, root files present.`,
)
