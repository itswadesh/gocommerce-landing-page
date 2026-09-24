// Deepen a shallow build clone so git can date each page's source.
//
// Workers Builds clones at depth 1, which leaves every file "last changed" at
// the tip commit — the deploy date wearing a disguise. Fetching the rest of
// the history is cheap for a repository this size and makes the sitemap's
// lastmod and every page's dateModified true. If the fetch fails (no
// network, no remote) the build carries on and dates.mjs withholds the dates
// rather than guessing.
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
