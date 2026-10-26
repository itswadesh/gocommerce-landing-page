// Re-reads the module list from a GoCommerce checkout, so /integrations/ and
// the module pages' counts come from the code rather than from memory.
//
//   node scripts/read-modules.mjs <path to a gocommerce checkout of main>
//
// Writes src/data/modules.json: every directory under ext/ but alltest, with
// the first sentence of its package doc ("Package <name>" dropped). Then
// prints, for each module that has a page, the Test functions and openapi
// operations the page states against what the code holds now.
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const repo = process.argv[2]
if (!repo || !existsSync(join(repo, 'ext'))) throw new Error('usage: node scripts/read-modules.mjs <gocommerce checkout>')
const ext = join(repo, 'ext')
const dirs = readdirSync(ext, { withFileTypes: true }).filter((d) => d.isDirectory() && d.name !== 'alltest').map((d) => d.name).sort()

const goFiles = (dir) => readdirSync(join(ext, dir)).filter((f) => f.endsWith('.go'))

function packageDoc(dir) {
  for (const f of goFiles(dir).filter((f) => !f.endsWith('_test.go'))) {
    const m = readFileSync(join(ext, dir, f), 'utf8').replace(/\r\n/g, '\n').match(/((?:^\/\/[^\n]*\n)+)package \w+/m)
    if (!m || !/^\/\/ Package \S+ /.test(m[1])) continue
    const text = m[1].split('\n').map((l) => l.replace(/^\/\/ ?/, '')).join('\n')
    const para = text.split(/\n\s*\n/)[0].replace(/\s+/g, ' ').trim()
    const sentence = para.match(/^.*?[.](?=\s|$)/)?.[0] ?? para
    return sentence.replace(/^Package \S+ /, '')
  }
  throw new Error(`ext/${dir}: no package doc`)
}

const tests = (dir) => goFiles(dir).filter((f) => f.endsWith('_test.go'))
  .reduce((n, f) => n + (readFileSync(join(ext, dir, f), 'utf8').match(/^func Test\w*\(t \*testing\.T\)/gm) ?? []).length, 0)

function ops(dir) {
  const p = join(ext, dir, 'openapi.json')
  if (!existsSync(p)) return 0
  const methods = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options'])
  return Object.values(JSON.parse(readFileSync(p, 'utf8')).paths ?? {}).reduce((n, item) => n + Object.keys(item).filter((k) => methods.has(k)).length, 0)
}

const modules = dirs.map((dir) => ({ dir, doc: packageDoc(dir) }))
writeFileSync(new URL('../src/data/modules.json', import.meta.url), JSON.stringify(modules, null, 2))
console.log(`${modules.length} modules written to src/data/modules.json`)

const pages = new URL('../src/data/integrations/', import.meta.url)
for (const f of readdirSync(pages).filter((f) => f.endsWith('.json'))) {
  const page = JSON.parse(readFileSync(new URL(f, pages), 'utf8'))
  if (!dirs.includes(page.slug)) { console.log(`${page.slug}: page has no module under ext/`); continue }
  const t = tests(page.slug), o = ops(page.slug)
  const off = page.testCount !== t || page.apiOps !== o
  console.log(`${off ? 'STALE' : 'ok   '} ${page.slug}: tests ${page.testCount} -> ${t}, operations ${page.apiOps} -> ${o}`)
}
for (const dir of dirs) if (!existsSync(new URL(`${dir}.json`, pages))) console.log(`no page ${dir}: tests ${tests(dir)}, operations ${ops(dir)}`)
