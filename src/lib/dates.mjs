// When was a page last changed? Answered from git, at build time, so the date
// a page carries is the date its source (or the data it renders) was last
// committed — not the date somebody ran the build. The sitemap's lastmod and
// each page's dateModified come from here, so they cannot disagree.
//
// Plain JavaScript because astro.config.mjs imports it too.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

// The project root is the build's working directory. Not derived from
// import.meta.url: Vite bundles this module for the page build, and the
// bundled copy's URL points at a chunk, not at src/lib.
const ROOT = process.cwd()

// Pages whose content is a data file as much as a template: a re-extraction
// of the module docs or a re-shoot of the admin changes the page.
const EXTRA = {
  '/integrations/': ['src/data/modules.json'],
  '/gocommerce/admin/': ['src/data/admin-screens.json'],
  '/svelte-commerce/backends/': ['src/data/connectors.json'],
  // The blog index changes when any post does.
  '/blog/': ['src/content/blog'],
  '/compare/': ['src/data/compare'],
  '/features/': ['src/data/features'],
  '/svelte-commerce/themes/': ['src/data/themes.json'],
}

function git(args) {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { return '' }
}

// A shallow clone — Workers Builds makes one, and so did this checkout —
// still dates a file by its last commit correctly as long as that commit is
// inside the clone's depth; what it cannot know is when a file first
// appeared, so datePublished is withheld on a shallow clone rather than
// guessed as the clone's oldest commit.
const shallow = git(['rev-parse', '--is-shallow-repository']) === 'true'
// A single-commit clone can date nothing: every file's "last commit" would
// be the tip, which is the deploy date. Withhold rather than mislead.
const depthOne = shallow && git(['rev-list', '--count', 'HEAD']) === '1'

// Pages rendered by one dynamic route from one entry each: the entry is the
// page's real source, so its commits date the page, not the shared template's.
const ENTRIES = [
  [/^compare\/([a-z0-9-]+)$/, (slug) => `src/data/compare/${slug}.json`],
  [/^blog\/([a-z0-9-]+)$/, (slug) => `src/content/blog/${slug}.md`],
  [/^features\/([a-z0-9-]+)$/, (slug) => `src/data/features/${slug}.json`],
]

function sourceFor(p) {
  const clean = p.replace(/^\/+|\/+$/g, '')
  if (!clean) return 'src/pages/index.astro'
  for (const c of [`src/pages/${clean}.astro`, `src/pages/${clean}/index.astro`]) {
    if (existsSync(path.join(ROOT, c))) return c
  }
  for (const [re, entry] of ENTRIES) {
    const m = clean.match(re)
    if (m && existsSync(path.join(ROOT, entry(m[1])))) return entry(m[1])
  }
  return null
}

const cache = new Map()

/** @returns {{ modified: string, published?: string, exact: boolean }} ISO dates (YYYY-MM-DD). */
export function pageDates(p) {
  if (cache.has(p)) return cache.get(p)
  const src = sourceFor(p)
  const today = new Date().toISOString().slice(0, 10)
  let out = { modified: today, published: undefined, exact: false }
  if (src && !depthOne) {
    let latest = 0
    for (const f of [src, ...(EXTRA[p] || [])]) {
      const t = Date.parse(git(['log', '-1', '--format=%cI', '--', f]))
      if (t && t > latest) latest = t
    }
    const first = shallow ? '' : git(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', src]).split('\n').filter(Boolean).pop()
    if (latest) out = { modified: new Date(latest).toISOString().slice(0, 10), published: first ? first.slice(0, 10) : undefined, exact: true }
  }
  cache.set(p, out)
  return out
}
