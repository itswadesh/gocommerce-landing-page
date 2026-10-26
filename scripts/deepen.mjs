// Deepen a shallow build clone so git can say when each page first appeared.
//
// Workers Builds clones at depth 1, where no file's first commit is in view.
// Fetching the rest of the history is cheap for a repository this size and
// makes every page's datePublished true. (Modified dates come from
// src/data/page-dates.json, not git.) If the fetch fails (no network, no
// remote) the build carries on and dates.mjs withholds datePublished rather
// than guessing.
import { execFileSync } from 'node:child_process'

const git = (args) => execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()

try {
  if (git(['rev-parse', '--is-shallow-repository']) !== 'true') {
    console.log('deepen: clone is complete')
  } else {
    try {
      execFileSync('git', ['fetch', '--unshallow', '--quiet'], { stdio: 'ignore', timeout: 120000 })
    } catch {
      execFileSync('git', ['fetch', '--deepen=500', '--quiet'], { stdio: 'ignore', timeout: 120000 })
    }
    console.log(`deepen: history now ${git(['rev-list', '--count', 'HEAD'])} commits, shallow=${git(['rev-parse', '--is-shallow-repository'])}`)
  }
} catch (e) {
  console.log('deepen: could not deepen the clone; pages will carry no dates —', e.message.split('\n')[0])
}
