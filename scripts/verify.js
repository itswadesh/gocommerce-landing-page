/**
 * Enforce the site's naming rules mechanically.
 *
 * The rule the README states first is that kitcommerce.store is a website, not
 * a third product. That rule is easy to agree with and easy to break by
 * accident — "the KitCommerce stack" reads perfectly naturally and undoes the
 * whole positioning. A rule nothing checks is a rule that drifts, so this
 * checks it.
 *
 *   node scripts/verify.js
 *
 * Exits non-zero on any violation, naming the file, the line and the text.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')

// Only the pages a reader actually sees. llms.txt and README.md are excluded on
// purpose: both quote the forbidden phrasings in order to forbid them, and a
// checker that cannot tell a rule from a violation would make the rule
// unwritable.
const PAGES = [
  'index.html',
  'gocommerce/index.html',
  'svelte-commerce/index.html',
  'svelte-commerce/backends/index.html',
  'go-svelte-ecommerce/index.html',
  'gocommerce-svelte-commerce-connector/index.html',
  '404.html',
]

const RULES = [
  {
    // "KitCommerce platform", "KitCommerce framework", "the KitCommerce stack"…
    re: /KitCommerce\s+(platform|framework|engine|runtime|ecosystem|stack|Growth|product|suite)/gi,
    why: 'KitCommerce is a website, not a product. Name the project instead — GoCommerce or Svelte Commerce.',
  },
  {
    re: /(powered by|built on|built with|running on)\s+KitCommerce/gi,
    why: 'Nothing is powered by or built on KitCommerce. It is the site presenting two projects.',
  },
  {
    re: /(start|build|begin|get started)\s+with\s+KitCommerce/gi,
    why: 'There is nothing called KitCommerce to install. Point at a project.',
  },
  {
    re: /KitCommerce\s+(module|layer|component|edition|tier|cloud)/gi,
    why: 'Neither project is a part of KitCommerce. They are standalone and compatible.',
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
  const file = path.join(ROOT, page)
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
