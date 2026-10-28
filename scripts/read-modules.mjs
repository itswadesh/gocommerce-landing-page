// Re-reads the module list from a GoCommerce checkout, so /integrations/
// lists what the code holds rather than what memory does.
//
//   node scripts/read-modules.mjs <path to a gocommerce checkout of main>
//
// Writes src/data/modules.json: every directory under ext/ but alltest, with
// the first sentence of its package doc ("Package <name>" dropped). The
// counts, per module and in total, are scripts/read-facts.mjs's job.
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

const modules = dirs.map((dir) => ({ dir, doc: packageDoc(dir) }))
writeFileSync(new URL('../src/data/modules.json', import.meta.url), JSON.stringify(modules, null, 2))
console.log(`${modules.length} modules written to src/data/modules.json`)

