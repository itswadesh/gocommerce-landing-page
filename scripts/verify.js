/**
 * Enforce the site's naming rules mechanically.
 *
 * KitCommerce is the platform made of GoCommerce and Svelte Commerce, and the
 * rules that keep that honest are easy to break by accident: a "KitCommerce
 * Cloud" or an "enterprise edition" reads naturally and describes something
 * that does not exist, and the project names drift ("Go Commerce",
 * "SvelteCommerce"). A rule nothing checks is a rule that drifts, so this
 * checks it.
 *
 *   node scripts/verify.js
 *
 * Exits non-zero on any violation, naming the file, the line and the text.
 */
import fs from 'node:fs'
import path from 'node:path'
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
    // Svelte Commerce together — so "KitCommerce platform" is allowed. What it
    // does not have is an edition, a tier, a cloud or an enterprise version,
    // and a sentence claiming one describes something that does not exist.
    re: /KitCommerce\s+(edition|tier|cloud|enterprise|pro|plus|premium)\b/gi,
    why: 'KitCommerce has no edition, tier, cloud or enterprise version. It is two free MIT projects.',
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
        if (rule.allow && rule.allow(line)) continue
        console.error(`  ${page}:${i + 1}  "${m[0].trim()}"`)
        console.error(`      ${rule.why}`)
        violations++
      }
    }
  }
}

if (violations) {
  console.error(`\n${violations} naming violation(s) across ${scanned} page(s).`)
  process.exit(1)
}

console.log(`Naming rules hold across ${scanned} pages.`)
