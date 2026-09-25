/**
 * A Markdown twin of every indexable page, for answer engines.
 *
 * An answer engine that fetches /gocommerce/ receives some 60 KB of HTML of
 * which the prose is a fraction — a breadcrumb, an icon sprite, screenshots in
 * three sizes, tab buttons, a consent banner, forty footer links. Each engine
 * strips that itself, differently, and sometimes badly: a comparison table
 * flattened into one run-on sentence, an FAQ answer glued to the next
 * question. So the build does it once, the same way for every reader, and
 * publishes the result beside the page, as saleor.io serves /pricing.md.
 *
 * Run after `astro build`; `npm run build` does both:
 *
 *   node scripts/markdown-alternates.mjs            # dist/
 *   node scripts/markdown-alternates.mjs some/dir   # a copy of it
 *
 * ── The URL: the page's path without its trailing slash, plus .md
 *
 *   /                               → /index.md
 *   /gocommerce/                    → /gocommerce.md
 *   /compare/kitcommerce-vs-saleor/ → /compare/kitcommerce-vs-saleor.md
 *
 * /gocommerce/index.md would have been served too. html_handling =
 * "auto-trailing-slash" rewrites only .html paths, and the asset server serves
 * any path that names a file exactly before it tries a single HTML rule (read
 * in its htmlHandlingAutoTrailingSlash). So the host allows either, and the
 * choice is made for the reader: /gocommerce.md is the shape an agent guesses
 * and a person types — the page's address with .md on the end — and the one
 * saleor.io and most documentation hosts use.
 *
 * The file is written at that path, dist/gocommerce.md, rather than as
 * gocommerce/index.md behind a rewrite in the Worker. A twin's place in dist/
 * is then its URL: one URL per twin, no routing rule to keep in step, and any
 * static server — `astro preview` included — serves it as production does.
 *
 * src/worker.js advertises each twin on its page in a Link header, serves it
 * as text/markdown, and points its canonical back at the page, so a twin never
 * competes with the page it copies. The Worker derives the URL with the same
 * rule; scripts/verify-dist.js asks it for each page's twin and fails if the
 * file is missing.
 *
 * No dependencies. Astro's output is well formed, so a small tokenizer that
 * knows void elements, raw-text elements and entities is enough to read it;
 * a full HTML5 parser would be a dependency for markup this build never emits.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'dist')

if (!fs.existsSync(DIST)) {
  console.error(`No ${DIST} — run \`astro build\` first.`)
  process.exit(1)
}

// The page at a URL path → the path of its twin. src/worker.js has the same
// one line; verify-dist checks the two agree.
const twinOf = (page) => (page === '/' ? '/index.md' : page.slice(0, -1) + '.md')

// ── Reading HTML

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'])
const RAW = new Set(['script', 'style'])
const NAMED = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  mdash: '—', ndash: '–', hellip: '…', middot: '·', rarr: '→', larr: '←',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', times: '×', copy: '©',
}
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (all, e) => {
    if (e[0] !== '#') return NAMED[e] ?? all
    const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
    return Number.isFinite(code) ? String.fromCodePoint(code) : all
  })

const parseAttrs = (src) => {
  const out = {}
  for (const m of src.matchAll(/([^\s"'>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) {
    out[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? '')
  }
  return out
}

// Text nodes are { text }, elements { tag, attrs, children }.
function parse(html) {
  const root = { tag: '#root', attrs: {}, children: [] }
  const stack = [root]
  const top = () => stack[stack.length - 1]
  const tagRe = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'>]+))?)*)\s*(\/?)>/g
  let at = 0
  let m
  while ((m = tagRe.exec(html))) {
    if (m.index > at) top().children.push({ text: decode(html.slice(at, m.index)) })
    at = tagRe.lastIndex
    if (m[1]) {
      // A close tag shuts the nearest open element of its name; a stray one is ignored.
      const name = m[1].toLowerCase()
      for (let k = stack.length - 1; k > 0; k--) {
        if (stack[k].tag === name) {
          stack.length = k
          break
        }
      }
    } else if (m[2]) {
      const el = { tag: m[2].toLowerCase(), attrs: parseAttrs(m[3]), children: [] }
      top().children.push(el)
      if (RAW.has(el.tag)) {
        const end = html.toLowerCase().indexOf(`</${el.tag}`, at)
        const stop = end < 0 ? html.length : end
        el.children.push({ text: html.slice(at, stop) })
        at = tagRe.lastIndex = stop
      } else if (!VOID.has(el.tag) && !m[4]) stack.push(el)
    }
  }
  if (at < html.length) top().children.push({ text: decode(html.slice(at)) })
  return root
}

const isEl = (n) => n.tag !== undefined
const classes = (el) => (el.attrs.class || '').split(/\s+/)
const hasClass = (el, c) => classes(el).includes(c)
function* walk(n) {
  yield n
  if (isEl(n)) for (const c of n.children) yield* walk(c)
}

// ── What does not belong in the twin
//
// The rule is roughly what a screen reader announces, minus the controls: a
// button does something on the page and means nothing off it; aria-hidden
// marks decoration its author already judged meaningless; an icon <use> from
// the sprite is an <svg> with no role. Navigation goes too — the breadcrumb
// repeats the canonical and the section jumps repeat the headings below them.
// Hidden tab panels stay: they are content a click away, not decoration.
const DROP_TAGS = new Set(['script', 'style', 'template', 'noscript', 'button', 'input', 'select', 'textarea', 'form', 'dialog', 'source', 'nav', 'footer'])
// Chrome drawn around screenshots and the terminal. The browser bar's text
// ("GoCommerce / Dashboard · UI capture") names a frame, not the image; the
// small caption is the narrow-screen twin of the caption beside it.
const DROP_CLASSES = ['browser-bar', 'store-browser-bar', 'term-bar', 'shot-caption-small']

function dropped(el) {
  if (DROP_TAGS.has(el.tag)) return true
  if (el.attrs['aria-hidden'] === 'true') return true
  if (el.tag === 'svg' && el.attrs.role !== 'img') return true
  if (el.tag === 'img' && !(el.attrs.alt || '').trim()) return true
  if (DROP_CLASSES.some((c) => hasClass(el, c))) return true
  // The consent banner lives outside <main> today; this keeps it out if it moves.
  if (/consent/i.test(el.attrs.id || '') || classes(el).some((c) => c.startsWith('consent'))) return true
  return false
}

const BLOCK = new Set([
  'address', 'article', 'aside', 'blockquote', 'caption', 'dd', 'details', 'div', 'dl', 'dt', 'fieldset',
  'figcaption', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hgroup', 'hr', 'li', 'main', 'ol',
  'p', 'pre', 'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
])
const isBlock = (el) => BLOCK.has(el.tag) || el.attrs.role === 'img'

// ── Writing Markdown

const collapse = (s) => s.replace(/[\s ]+/g, ' ')
const oneLine = (s) => collapse(s).trim()

// Escape only what Markdown would otherwise read as syntax. An underscore
// inside a word (snake_case) is literal in CommonMark and left alone.
const escapeText = (s) =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/[*`[\]]/g, '\\$&')
    .replace(/(?<![\p{L}\p{N}])_|_(?![\p{L}\p{N}])/gu, '\\_')
    .replace(/<(?=[A-Za-z/!?])/g, '\\<')

// Prose that happens to begin like a heading, quote or list item.
const guardLine = (l) =>
  l
    .replace(/^(#{1,6})(?=\s|$)/, '\\$1')
    .replace(/^>/, '\\>')
    .replace(/^([-+])(?=\s)/, '\\$1')
    .replace(/^(\d{1,9})([.)])(?=\s|$)/, '$1\\$2')

const IMAGE_FILE = /\.(webp|png|jpe?g|gif|svg|avif)(?:[?#].*)?$/i

function makeWriter(canonical, byId) {
  // Links leave absolute: a twin is read out of context, often pasted
  // somewhere else, where /gocommerce/ means nothing.
  const absolute = (href) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return href
    try {
      return new URL(href, canonical).href
    } catch {
      return href
    }
  }
  const dest = (url) => url.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29')

  // Visible text: what a reader would see, used for code and accessible names.
  const textOf = (n) => {
    if (!isEl(n)) return n.text
    if (n.tag === 'br') return '\n'
    if (dropped(n)) return ''
    return n.children.map(textOf).join('')
  }

  const wrap = (s, mark) => {
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/)
    if (!m[2]) return s
    const core = mark === '**' ? m[2].replace(/\*\*/g, '') : m[2]
    return m[1] + mark + core + mark + m[3]
  }

  const codeSpan = (raw) => {
    const t = collapse(raw)
    if (!t.trim()) return ''
    const longest = Math.max(0, ...[...t.matchAll(/`+/g)].map((m) => m[0].length))
    const fence = '`'.repeat(longest + 1)
    const pad = t.startsWith('`') || t.endsWith('`') ? ' ' : ''
    return fence + pad + t + pad + fence
  }

  const image = (el) => `![${escapeText(oneLine(el.attrs.alt))}](${dest(absolute(el.attrs.src || ''))})`

  const firstImage = (el) => {
    for (const n of walk(el)) if (isEl(n) && n.tag === 'img' && !dropped(n)) return n
    return null
  }

  function link(el, ctx) {
    let label = oneLine(inline(el.children, ctx))
    const href = el.attrs.href
    if (!href) return label
    // A screenshot wrapped in a link to a bigger copy of itself: the image
    // is the content, and the link adds a second URL for the same picture.
    const img = firstImage(el)
    if (img && label === image(img) && IMAGE_FILE.test(href)) return label
    if (!label) label = escapeText(oneLine(el.attrs['aria-label'] || ''))
    if (!label) return ''
    return `[${label}](${dest(absolute(href))})`
  }

  // Elements whose CSS sets them apart but whose markup does not —
  // <b>61</b><span>admin screens</span> — would run together as
  // "61admin screens". Adjacent elements get a space between them when the
  // markup left none; after a bold label in words, an em dash, so that
  // "Scoped API keys" and the sentence explaining it stay two things.
  function inline(nodes, ctx) {
    let out = ''
    let prev = null // the element just written, while no text has followed it
    for (const n of nodes) {
      if (!isEl(n)) {
        out += escapeText(collapse(n.text))
        prev = null
        continue
      }
      if (dropped(n)) continue
      const s = inlineElement(n, ctx)
      if (!s) continue
      if (prev && n.tag !== 'br' && out && !/\s$/.test(out) && !/^\s/.test(s)) {
        const label = (prev.tag === 'b' || prev.tag === 'strong') && /\p{L}/u.test(textOf(prev))
        out += label && !ctx.heading ? ' — ' : ' '
      }
      out += s
      prev = n.tag === 'br' ? null : n
    }
    return out
  }

  function inlineElement(el, ctx) {
    switch (el.tag) {
      case 'br':
        return ctx.oneLine ? ' ' : '\n'
      case 'b':
      case 'strong':
        return ctx.heading ? inline(el.children, ctx) : wrap(inline(el.children, ctx), '**')
      case 'i':
      case 'em':
        return wrap(inline(el.children, ctx), '*')
      case 'code':
      case 'kbd':
      case 'samp':
        return codeSpan(textOf(el))
      case 'a':
        return link(el, ctx)
      case 'img':
        return image(el)
      case 'svg':
        return ''
      default:
        // A block met inside a table cell, a link or a term keeps its words
        // and loses its box.
        if (isBlock(el)) return ' ' + inline(el.children, ctx) + ' '
        return inline(el.children, ctx)
    }
  }

  function paragraph(nodes, ctx) {
    const meaningful = nodes.filter((n) => (isEl(n) ? !dropped(n) : n.text.trim()))
    // A row of call-to-action links reads as a list of destinations, not a
    // sentence: "Deploy in minutes · Explore GoCommerce · All comparisons".
    if (meaningful.length > 1 && meaningful.every((n) => isEl(n) && n.tag === 'a')) {
      const links = meaningful.map((a) => oneLine(link(a, ctx))).filter(Boolean)
      return links.length ? [links.join(' · ')] : []
    }
    const text = inline(nodes, ctx)
      .split('\n')
      .map((l) => l.replace(/ {2,}/g, ' ').trim())
      .filter(Boolean)
      .map(guardLine)
      .join('\n')
    return text ? [text] : []
  }

  // The name a screen reader gives a role="img": the diagrams' <title> and
  // <desc>, the terminal's aria-label. It is written to be read aloud, so it
  // is exactly what a text-only reader needs in place of the picture.
  function accessibleName(el) {
    const joinParts = (parts) =>
      parts.filter(Boolean).reduce((acc, p) => (acc ? acc + (/[.!?:]$/.test(acc) ? ' ' : '. ') + p : p), '')
    if (el.attrs['aria-labelledby']) {
      const parts = el.attrs['aria-labelledby'].split(/\s+/).map((id) => byId.get(id)).filter(Boolean)
      const name = joinParts(parts.map((n) => oneLine(textOf(n))))
      if (name) return name
    }
    if (el.attrs['aria-label']) return oneLine(el.attrs['aria-label'])
    const child = (tag) => el.children.find((c) => isEl(c) && c.tag === tag)
    return joinParts([child('title'), child('desc')].map((n) => (n ? oneLine(textOf(n)) : '')))
  }

  function list(el, ctx) {
    let n = Number(el.attrs.start || 1)
    const items = []
    for (const li of el.children) {
      if (!isEl(li) || li.tag !== 'li' || dropped(li)) continue
      const parts = blocks(li.children, ctx)
      if (!parts.length) continue
      const marker = el.tag === 'ol' ? `${n++}. ` : '- '
      const pad = ' '.repeat(marker.length)
      const body = parts
        .map((b, k) => b.split('\n').map((l, i) => (k === 0 && i === 0) || !l ? l : pad + l).join('\n'))
        .join('\n\n')
      items.push({ text: marker + body, loose: parts.length > 1 })
    }
    if (!items.length) return []
    return [items.map((i) => i.text).join(items.some((i) => i.loose) ? '\n\n' : '\n')]
  }

  function fence(pre) {
    const code = pre.children.find((c) => isEl(c) && c.tag === 'code')
    const lang = ((code && code.attrs.class) || '').match(/language-(\S+)/)?.[1] || ''
    const body = textOf(pre).replace(/^\n/, '').replace(/\s+$/, '')
    if (!body) return []
    const longest = Math.max(2, ...[...body.matchAll(/`+/g)].map((m) => m[0].length))
    const f = '`'.repeat(longest + 1)
    return [`${f}${lang}\n${body}\n${f}`]
  }

  function table(el, ctx) {
    const rows = []
    const collect = (nodes, head) => {
      for (const n of nodes) {
        if (!isEl(n)) continue
        if (n.tag === 'tr') rows.push({ head, cells: cellsOf(n) })
        else if (n.tag === 'thead' || n.tag === 'tbody' || n.tag === 'tfoot') collect(n.children, n.tag === 'thead')
      }
    }
    const cellsOf = (tr) =>
      tr.children
        .filter((c) => isEl(c) && (c.tag === 'td' || c.tag === 'th'))
        .flatMap((c) => {
          const text = oneLine(inline(c.children, { ...ctx, oneLine: true })).replace(/\|/g, '\\|')
          // Pipe tables have no colspan; the spanned columns are left blank.
          return [text, ...Array(Math.max(0, Number(c.attrs.colspan || 1) - 1)).fill('')]
        })
    collect(el.children, false)
    if (!rows.length) return []
    const headRows = rows.filter((r) => r.head)
    const header = headRows.length ? headRows[headRows.length - 1] : rows[0]
    const body = rows.filter((r) => !r.head && r !== header)
    const width = Math.max(...rows.map((r) => r.cells.length))
    const line = (cells) => '| ' + Array.from({ length: width }, (_, i) => cells[i] || '').join(' | ') + ' |'
    const out = []
    const caption = el.children.find((c) => isEl(c) && c.tag === 'caption')
    const captionText = caption ? oneLine(inline(caption.children, { ...ctx, oneLine: true })) : ''
    if (captionText) out.push(`*${captionText}*`)
    out.push([line(header.cells), '| ' + Array(width).fill('---').join(' | ') + ' |', ...body.map((r) => line(r.cells))].join('\n'))
    return out
  }

  // An FAQ entry as the question in bold and the answer beneath it, so the
  // pair survives being quoted on its own.
  function details(el, ctx) {
    const summary = el.children.find((c) => isEl(c) && c.tag === 'summary')
    const q = summary ? oneLine(inline(summary.children, { ...ctx, heading: true, oneLine: true })) : ''
    const answer = blocks(el.children.filter((c) => c !== summary), ctx)
    return [q ? `**${q}**` : '', ...answer].filter(Boolean)
  }

  function definitions(el, ctx) {
    const pairs = []
    const gather = (nodes) => {
      for (const n of nodes) {
        if (!isEl(n) || dropped(n)) continue
        if (n.tag === 'dt') pairs.push({ term: oneLine(inline(n.children, { ...ctx, heading: true, oneLine: true })), defs: [] })
        else if (n.tag === 'dd') {
          const def = oneLine(inline(n.children, { ...ctx, oneLine: true }))
          if (!pairs.length) pairs.push({ term: '', defs: [] })
          if (def) pairs[pairs.length - 1].defs.push(def)
        } else if (n.tag === 'div') gather(n.children)
      }
    }
    gather(el.children)
    const lines = pairs
      .filter((p) => p.term || p.defs.length)
      .map((p) => '- ' + [p.term && `**${p.term}**`, p.defs.join('; ')].filter(Boolean).join(': '))
    return lines.length ? [lines.join('\n')] : []
  }

  function block(el, ctx) {
    if (el.attrs.role === 'img') {
      const name = accessibleName(el)
      return name ? [`*${el.tag === 'svg' ? 'Diagram' : 'Illustration'}:* ${escapeText(name)}`] : []
    }
    switch (el.tag) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6': {
        // One level down: the twin's own "# title" is its only H1, and the
        // page's H1 becomes the first section under it.
        const text = oneLine(inline(el.children, { ...ctx, heading: true, oneLine: true }))
        return text ? ['#'.repeat(Math.min(6, Number(el.tag[1]) + 1)) + ' ' + text] : []
      }
      case 'p':
      case 'figcaption':
      case 'summary':
      case 'caption':
      case 'dt':
        return paragraph(el.children, ctx)
      case 'ul':
      case 'ol':
        return list(el, ctx)
      case 'pre':
        return fence(el)
      case 'table':
        return table(el, ctx)
      case 'details':
        return details(el, ctx)
      case 'dl':
        return definitions(el, ctx)
      case 'blockquote': {
        const inner = blocks(el.children, ctx).join('\n\n')
        return inner ? [inner.split('\n').map((l) => (l ? '> ' + l : '>')).join('\n')] : []
      }
      case 'hr':
        return ['---']
      default:
        return blocks(el.children, ctx)
    }
  }

  // Block children become their own chunks; runs of inline content between
  // them become paragraphs.
  function blocks(nodes, ctx) {
    const out = []
    let run = []
    const flush = () => {
      if (run.length) out.push(...paragraph(run, ctx))
      run = []
    }
    for (const n of nodes) {
      if (isEl(n) && dropped(n)) continue
      if (isEl(n) && isBlock(n)) {
        flush()
        out.push(...block(n, ctx))
      } else run.push(n)
    }
    flush()
    return out.filter(Boolean)
  }

  return (main) => blocks(main.children, {}).join('\n\n')
}

// ── The page's own facts, from its <head>

const headField = (html, re) => {
  const m = html.match(re)
  return m ? decode(m[1]).trim() : ''
}

// dateModified from the page's JSON-LD — the node that describes this URL if
// one does, else the first that carries a date at all.
function lastModified(html, canonical) {
  const found = []
  const visit = (v) => {
    if (Array.isArray(v)) return v.forEach(visit)
    if (!v || typeof v !== 'object') return
    if (typeof v.dateModified === 'string') found.push(v)
    for (const k of Object.keys(v)) if (typeof v[k] === 'object') visit(v[k])
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      visit(JSON.parse(m[1]))
    } catch {
      // A block that does not parse is verify-dist's problem, not this script's.
    }
  }
  const own = found.find((n) => n.url === canonical || (n['@id'] || '').startsWith(canonical))
  return (own || found[0])?.dateModified || ''
}

// ── Every page

function pagesUnder(dir, base = '') {
  const out = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${e.name}` : e.name
    if (e.isDirectory()) {
      if (e.name !== '_astro') out.push(...pagesUnder(path.join(dir, e.name), rel))
    } else if (e.name === 'index.html') out.push(rel)
  }
  return out
}

let written = 0
let bytes = 0
const skipped = []
const problems = []

for (const rel of pagesUnder(DIST).sort()) {
  const html = fs.readFileSync(path.join(DIST, rel), 'utf8')
  if (/<meta name="robots"[^>]*noindex/i.test(html)) {
    skipped.push(rel)
    continue
  }
  const page = '/' + rel.replace(/index\.html$/, '')
  const canonical = headField(html, /<link rel="canonical" href="([^"]+)"/)
  const title = headField(html, /<title>([^<]*)<\/title>/)
  const description = headField(html, /<meta name="description" content="([^"]*)"/)
  const modified = lastModified(html, canonical)

  const open = html.match(/<main\b[^>]*\bid="main"[^>]*>/)
  const close = html.lastIndexOf('</main>')
  if (!canonical || !title || !open || close < open.index) {
    problems.push(`${rel}: no ${!canonical ? 'canonical' : !title ? '<title>' : '<main id="main">'} to build a twin from`)
    continue
  }
  const tree = parse(html.slice(open.index, close + '</main>'.length))
  const main = tree.children.find((c) => isEl(c) && c.tag === 'main')
  const byId = new Map()
  for (const n of walk(main)) if (isEl(n) && n.attrs.id) byId.set(n.attrs.id, n)

  const content = makeWriter(canonical, byId)(main)
  if (!content.trim()) {
    problems.push(`${rel}: <main> produced no Markdown`)
    continue
  }

  const head = [`# ${escapeText(oneLine(title))}`, '']
  if (description) head.push(`> ${escapeText(oneLine(description))}`, '')
  head.push(`- Canonical: ${canonical}`)
  if (modified) head.push(`- Last updated: ${modified}`)
  head.push('', '---', '')

  const md = head.join('\n') + '\n' + content + '\n'
  fs.writeFileSync(path.join(DIST, twinOf(page).slice(1)), md)
  written++
  bytes += Buffer.byteLength(md)
}

// A build with no pages in it is broken upstream; saying "0 written" and
// exiting 0 would let it deploy.
if (!written && !problems.length) problems.push(`no indexable */index.html under ${DIST}`)

if (problems.length) {
  console.error(`\nMarkdown twins: ${problems.length} page(s) could not be converted:`)
  for (const p of problems) console.error('  ' + p)
  process.exit(1)
}

console.log(
  `Markdown twins: ${written} written (${Math.round(bytes / 1024)} KB)` +
    (skipped.length ? `, ${skipped.length} noindex page(s) skipped` : '') +
    '.',
)
