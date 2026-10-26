/**
 * When did a page last change? Its own words decide, not its source files.
 *
 * Dating a page by the last commit to its template or data file moved the
 * sitemap's lastmod whenever that file was touched, a comment or a field no
 * page shows included, and site-wide edits re-dated most of the site at once.
 * A search engine that sees lastmod move without the page changing learns to
 * ignore it. So each built page's content is hashed, and its date moves only
 * when the hash does:
 *
 *   1. src/lib/dates.mjs reads src/data/page-dates.json, so the sitemap's
 *      lastmod, every dateModified and the footer's date come from it.
 *   2. After `astro build`, this script hashes each indexable page: its
 *      title, its description and the text of its <main>, with <time>
 *      elements left out, since some of them print this very date.
 *   3. A page whose hash changed, or that is new, gets today's date; a page
 *      that is gone is dropped. If anything changed, the manifest is
 *      rewritten and the site is built once more so every page carries it.
 *
 * Commit src/data/page-dates.json with the change that moved it. A deploy
 * from a manifest nobody committed still dates the changed pages correctly,
 * with the deploy's date, and rebuilds once.
 *
 *   node scripts/page-dates.mjs        (run by `npm run build`)
 */
import { createHash } from 'node:crypto'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
export const MANIFEST = path.join(ROOT, 'src', 'data', 'page-dates.json')

/** URL path → content hash, for every indexable page in dist/. */
export function hashPages(dist = DIST) {
  const out = {}
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) { if (e.name !== '_astro') walk(full) }
      else if (e.name === 'index.html') {
        const html = fs.readFileSync(full, 'utf8')
        if (/name="robots"[^>]*noindex/i.test(html)) continue
        const pick = (re) => (html.match(re) || [, ''])[1]
        const main = pick(/<main[^>]*>([\s\S]*?)<\/main>/)
          .replace(/<(script|style|time)\b[\s\S]*?<\/\1>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
        const text = [pick(/<title>([^<]*)<\/title>/), pick(/<meta name="description" content="([^"]*)"/), main].join('\n').replace(/\s+/g, ' ').trim()
        const url = '/' + path.relative(dist, dir).split(path.sep).join('/') + '/'
        out[url.replace(/^\/+/, '/')] = createHash('sha256').update(text).digest('hex').slice(0, 16)
      }
    }
  }
  walk(dist)
  return out
}

export const readManifest = () => (fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {})
export const writeManifest = (m) => fs.writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(m).sort(([a], [b]) => a.localeCompare(b))), null, 2) + '\n')

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const today = new Date().toISOString().slice(0, 10)
  const old = readManifest()
  const hashes = hashPages()
  const next = {}
  const moved = []
  for (const [url, hash] of Object.entries(hashes)) {
    if (old[url]?.hash === hash) next[url] = old[url]
    else { next[url] = { hash, modified: today }; moved.push(url) }
  }
  const dropped = Object.keys(old).filter((u) => !(u in hashes))
  if (!moved.length && !dropped.length) {
    console.log(`page-dates: ${Object.keys(hashes).length} pages unchanged`)
  } else {
    writeManifest(next)
    console.log(`page-dates: ${moved.length} changed or new, ${dropped.length} gone; dated ${today}: ${moved.slice(0, 8).join(' ')}${moved.length > 8 ? ' …' : ''}`)
    console.log('page-dates: building again so every page carries the new dates')
    execSync('npx astro build', { cwd: ROOT, stdio: 'inherit' })
    const again = hashPages()
    const unstable = Object.keys(again).filter((u) => again[u] !== next[u]?.hash)
    if (unstable.length) {
      console.error(`page-dates: content changed between two builds of the same source: ${unstable.join(' ')}`)
      process.exit(1)
    }
  }
}
