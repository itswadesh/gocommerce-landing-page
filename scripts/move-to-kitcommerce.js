/**
 * Move the landing page from GitHub Pages to kitcommerce.store.
 *
 * Every URL this page asserts about itself has to change together: a canonical
 * pointing one way and an og:url pointing another is worse than either alone,
 * because a crawler has to pick and will not tell you which it picked.
 *
 * Run AFTER the Cloudflare deployment is serving the new domain, never before.
 * A canonical aimed at a host that does not resolve tells search engines the
 * real page is somewhere they cannot reach, and they act on it.
 *
 *   node scripts/move-to-kitcommerce.js          # show what would change
 *   node scripts/move-to-kitcommerce.js --write  # change it
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const OLD = 'https://itswadesh.github.io/gocommerce-landing-page'
const NEW = 'https://kitcommerce.store'
const write = process.argv.includes('--write')

const changes = []

function rewrite(file) {
  const full = path.join(ROOT, file)
  if (!fs.existsSync(full)) return
  const before = fs.readFileSync(full, 'utf8')
  const after = before.split(OLD).join(NEW)
  const hits = before.split(OLD).length - 1
  if (hits === 0) return
  changes.push({ file, hits })
  if (write) fs.writeFileSync(full, after)
}

for (const file of ['index.html', 'sitemap.xml', 'README.md']) rewrite(file)

// The IndexNow key moves from a subdirectory to the domain root, and that is an
// upgrade rather than a chore: a key under /gocommerce-landing-page/ could only
// vouch for URLs beneath it, while one at the root of kitcommerce.store vouches
// for the whole site. The file keeps its name, so the key itself stays valid —
// it simply starts answering somewhere that covers more.
const keyFile = fs.readdirSync(ROOT).find((f) => /^[0-9a-f]{32}\.txt$/.test(f))
if (keyFile) {
  changes.push({ file: keyFile, hits: 0, note: 'already at the deploy root — covers the whole domain once served from kitcommerce.store' })
}

console.log((write ? 'Rewrote' : 'Would rewrite') + ' ' + OLD + ' → ' + NEW)
for (const c of changes) {
  console.log('  ' + c.file + (c.hits ? '  ' + c.hits + ' occurrence(s)' : '') + (c.note ? '  — ' + c.note : ''))
}
if (!changes.length) console.log('  nothing left pointing at the old host')

if (!write) {
  console.log('\nNothing was changed. Re-run with --write once kitcommerce.store is serving.')
} else {
  console.log('\nNext: redeploy, then re-submit to IndexNow for the new host —')
  console.log('the key is the same, but it now vouches for kitcommerce.store rather than a subdirectory.')
}
