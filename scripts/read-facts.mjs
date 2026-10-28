// Re-reads the GoCommerce figures the site states, from a commit rather than
// from memory, and writes src/data/facts.json. Workers Builds has no
// GoCommerce checkout, so the file is checked in; run this when GoCommerce
// moves, and scripts/verify.js holds every page to the file.
//
//   node scripts/read-facts.mjs [gocommerce checkout] [ref]
//   node scripts/read-facts.mjs --check   (npm run verify: fails when the
//                                         file is behind; skips with no checkout)
//
// Defaults: ../gocommerce and origin/main. Reads through git, so the
// checkout's working tree and branch do not matter; fetch first.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const check = process.argv.includes('--check')
const [repoArg, refArg] = process.argv.slice(2).filter((a) => a !== '--check')
const repo = repoArg ?? new URL('../../gocommerce', import.meta.url).pathname.replace(/^\/([A-Z]:)/, '$1')
const ref = refArg ?? 'origin/main'
if (check && !existsSync(repo)) {
  console.log(`No GoCommerce checkout at ${repo}; facts.json not re-read.`)
  process.exit(0)
}
const git = (...args) => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 })
const show = (file) => git('show', `${ref}:${file}`)
const files = git('ls-tree', '-r', '--name-only', ref).trim().split('\n')
const count = (text, re) => (text.match(re) ?? []).length

const modules = git('ls-tree', '-d', '--name-only', ref, 'ext/').trim().split('\n').map((d) => d.slice(4)).filter((d) => d !== 'alltest')

const METHODS = new Set(['get', 'put', 'post', 'delete', 'patch', 'head', 'options'])
const ops = (file) => Object.values(JSON.parse(show(file)).paths ?? {}).reduce((n, item) => n + Object.keys(item).filter((k) => METHODS.has(k)).length, 0)
const coreOperations = ops('core/openapi.json')
const moduleOperations = files.filter((f) => /^ext\/[^/]+\/openapi\.json$/.test(f)).reduce((n, f) => n + ops(f), 0)

// git grep -c prints "ref:path:count" per file.
const testsIn = (pattern) => git('grep', '-c', '-E', pattern, ref, '--', '*_test.go').trim().split('\n').map((line) => {
  const [path, n] = line.slice(ref.length + 1).split(/:(?=\d+$)/)
  return { path, n: Number(n) }
})
const sum = (list) => list.reduce((n, f) => n + f.n, 0)
const tests = sum(testsIn('^func (Test|Example)\\w*\\(')) - sum(testsIn('^func TestMain\\('))
// Per module, as /integrations/<slug>/ states them: Test functions only.
const testFuncs = testsIn('^func Test\\w*\\(t \\*testing\\.T\\)')
const moduleTests = (m) => sum(testFuncs.filter((f) => f.path.startsWith(`ext/${m}/`)))
const moduleOps = (m) => files.includes(`ext/${m}/openapi.json`) ? ops(`ext/${m}/openapi.json`) : 0

const mcp = show('ext/mcp/tools.go')
const agents = show('AGENTS.md').replace(/\r\n/g, '\n')
const forAgents = agents.slice(agents.indexOf('## For AI agents specifically'))

const facts = {
  _comment: 'GoCommerce figures the site states, read by scripts/read-facts.mjs from the commit named here. Pages read them through src/lib/facts.ts, data files write {token}s that fill() replaces, and scripts/verify.js fails on a page that states another figure. "how" says what each one counts.',
  repository: 'itswadesh/gocommerce',
  ref,
  commit: git('rev-parse', '--short=8', ref).trim(),
  committed: git('log', '-1', '--format=%cs', ref).trim(),
  modules: modules.length,
  paymentModules: modules.filter((m) => m.startsWith('payments-')).length,
  fulfilmentModules: modules.filter((m) => m.startsWith('fulfill-')).length,
  binaryModules: new Set(show('cmd/gocommerce/main.go').match(/gocommerce\/ext\/[\w-]+/g)).size,
  apiOperations: coreOperations + moduleOperations,
  coreOperations,
  moduleOperations,
  adminScreens: files.filter((f) => /^admin\/src\/routes\/dash\/(.+\/)?\+page\.svelte$/.test(f)).length,
  tests,
  mcpTools: count(mcp, /^\t\t\tName:/gm),
  mcpWriteTools: count(mcp, /^\t\t\tMutates:\s+true/gm),
  coreRights: count(show('core/rights.go'), /^\s+Right\w+\s+Right = "/gm),
  migrations: count(show('core/schema.go'), /^\s+\{ID: "/gm),
  events: count(show('core/events.go'), /^\s+Event\w+\s*= "/gm),
  agentRules: count(agents, /^### \d+\. /gm),
  agentNotes: count(forAgents, /^- \*\*/gm),
  skillGuides: files.filter((f) => /^skills\/[^/]+\.md$/.test(f) && f !== 'skills/README.md').length,
  perModule: Object.fromEntries(modules.map((m) => [m, { tests: moduleTests(m), operations: moduleOps(m) }])),
  how: {
    modules: 'directories under ext/, not counting the ext/alltest test harness',
    paymentModules: 'ext/payments-* directories',
    fulfilmentModules: 'ext/fulfill-* directories',
    binaryModules: 'modules cmd/gocommerce, the reference binary, imports and can install',
    apiOperations: 'operations (path and method pairs) in core/openapi.json plus every ext/*/openapi.json',
    adminScreens: '+page.svelte files under admin/src/routes/dash, the operator panel; sign-in pages and the trade portal are not counted',
    tests: 'func Test… and func Example… in *_test.go, less TestMain',
    mcpTools: 'tools defined in ext/mcp/tools.go; mcpWriteTools are those marked Mutates',
    coreRights: 'Right constants in core/rights.go',
    migrations: 'core migrations listed in core/schema.go',
    events: 'event constants in core/events.go',
    agentRules: 'numbered rules in AGENTS.md; agentNotes are the bullets under "For AI agents specifically"',
    skillGuides: 'task guides in skills/, not counting its README',
    perModule: 'per ext/ directory: func Test…(t *testing.T) in its *_test.go, and operations in its openapi.json',
  },
}
const out = new URL('../src/data/facts.json', import.meta.url)
const json = JSON.stringify(facts, null, 2) + '\n'
if (check) {
  const { commit, committed, ...now } = facts
  const { commit: had, committed: _, ...was } = JSON.parse(readFileSync(out, 'utf8'))
  if (JSON.stringify(now) !== JSON.stringify(was)) {
    console.error(`src/data/facts.json (GoCommerce ${had}) is behind ${ref} (${commit}). Run node scripts/read-facts.mjs, then build.`)
    process.exit(1)
  }
  console.log(`facts.json agrees with GoCommerce ${ref} (${commit}).`)
  process.exit(0)
}
writeFileSync(out, json)
console.log(Object.entries(facts).filter(([, v]) => typeof v === 'number').map(([k, v]) => `${k} ${v}`).join(', '))
