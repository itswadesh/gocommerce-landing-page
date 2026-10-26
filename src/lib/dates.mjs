// When was a page last changed, and when did it first appear? The sitemap's
// lastmod, each page's dateModified and the footer's date come from here, so
// they cannot disagree.
//
// Modified: from src/data/page-dates.json, which scripts/page-dates.mjs keeps
// after each build. A page's date moves only when its own words change, not
// when a template or data file it reads is touched. A page the manifest does
// not know yet carries no date until that script has dated it.
//
// Published: when the page's source file was first committed, from git.
//
// Plain JavaScript because astro.config.mjs imports it too.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

// The project root is the build's working directory. Not derived from
// import.meta.url: Vite bundles this module for the page build, and the
// bundled copy's URL points at a chunk, not at src/lib.
const ROOT = process.cwd()
const MANIFEST = path.join(ROOT, 'src', 'data', 'page-dates.json')
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {}

function git(args) {
  try { return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim() } catch { return '' }
}

// A shallow clone (Workers Builds makes one; scripts/deepen.mjs deepens it)
// cannot know when a file first appeared, so datePublished is withheld on a
// shallow clone rather than guessed as the clone's oldest commit.
const shallow = git(['rev-parse', '--is-shallow-repository']) === 'true'

// Pages rendered by one dynamic route from one entry each: the entry is the
// page's real source, so its first commit is the page's.
const ENTRIES = [
  [/^compare\/([a-z0-9-]+)$/, (slug) => `src/data/compare/${slug}.json`],
  [/^blog\/([a-z0-9-]+)$/, (slug) => `src/content/blog/${slug}.md`],
  [/^features\/([a-z0-9-]+)$/, (slug) => `src/data/features/${slug}.json`],
  [/^integrations\/([a-z0-9-]+)$/, (slug) => `src/data/integrations/${slug}.json`],
  [/^svelte-commerce\/backends\/([a-z0-9-]+)$/, (slug) => `src/data/backends/${slug}.json`],
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
  const modified = manifest[p]?.modified
  const src = modified && !shallow ? sourceFor(p) : null
  const first = src ? git(['log', '--diff-filter=A', '--follow', '--format=%cI', '--', src]).split('\n').filter(Boolean).pop() : ''
  const out = modified
    ? { modified, published: first ? first.slice(0, 10) : undefined, exact: true }
    : { modified: new Date().toISOString().slice(0, 10), published: undefined, exact: false }
  cache.set(p, out)
  return out
}
