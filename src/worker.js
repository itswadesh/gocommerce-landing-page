/**
 * The Worker in front of the static assets. Everything it returns comes from
 * env.ASSETS — _headers, _redirects and the 404 page are the asset server's —
 * and it changes only what the asset server has no setting for:
 *
 * - Every HTML response leaves with `charset=utf-8` on its Content-Type. The
 *   asset server infers `text/html` from the file and will not take that
 *   header from _headers, and a text/html response with no charset is
 *   ISO-8859-1 by the HTTP default — fine for a browser, which reads
 *   <meta charset>, wrong for every fetcher that does not, which is most of
 *   the crawlers this site is written for.
 * - The trailing-slash redirect is permanent (308) rather than temporary.
 * - Every page names its Markdown twin in a Link header, and the twin is
 *   served as text/markdown with a canonical that points back at the page.
 *   The twins are written after the build by scripts/markdown-alternates.mjs.
 */

// The canonical host, spelled as every page's <link rel="canonical"> spells
// it. A twin's canonical names the same URL as its page's, whichever host
// served the request — a preview URL included.
const SITE = 'https://kitcommerce.store'

// A page's Markdown twin is its path without the trailing slash, plus .md:
// /gocommerce/ → /gocommerce.md, and the home page → /index.md. The Worker
// cannot cheaply check that a file exists, so it derives the URL.
// scripts/markdown-alternates.mjs writes the files by the same rule, and
// scripts/verify-dist.js asks this Worker for every page's twin and fails the
// build if the file is not there. That check is what keeps the rule's two
// copies in step.
const twinOf = (page) => (page === '/' ? '/index.md' : page.slice(0, -1) + '.md')
const pageOf = (twin) => (twin === '/index.md' ? '/' : twin.slice(0, -3) + '/')

export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request)
    const url = new URL(request.url)

    // /gocommerce → /gocommerce/ is html_handling = "auto-trailing-slash" at
    // work, and the asset server sends it as a 307. Temporary is the wrong
    // word for it. Every canonical carries the slash, so the bare path is
    // only ever a way in. A 307 says the move may be undone and the old URL
    // is the one to keep: Google reads it as at most a weak hint that the
    // target is canonical, so a link posted without the slash consolidates
    // next to nothing onto the page it lands on. 308 is the permanent form —
    // a strong signal — and unlike 301 it keeps the method. html_handling
    // has no setting for the status, so it is rewritten here, for this
    // redirect only: same origin, same path, one slash added. Every other
    // 307 (/gocommerce/index.html → /gocommerce/ among them) leaves as the
    // asset server sent it.
    if (res.status === 307) {
      const to = new URL(res.headers.get('location') || '', url)
      if (to.origin !== url.origin || to.pathname !== url.pathname + '/') return res
      return new Response(null, { status: 308, statusText: 'Permanent Redirect', headers: res.headers })
    }

    const type = res.headers.get('content-type') || ''
    const html = /^text\/html\b/i.test(type)
    const charset = html && !/charset=/i.test(type)
    // Only a page served whole: a path ending in / that answered 200. The
    // 404 page answers with 404, so an unmatched /nope/ advertises nothing.
    const page = html && res.status === 200 && url.pathname.endsWith('/')
    const twin = res.status === 200 && url.pathname.endsWith('.md')
    if (!charset && !page && !twin) return res

    const headers = new Headers(res.headers)
    if (charset) headers.set('content-type', 'text/html; charset=utf-8')
    if (page) headers.append('link', `<${twinOf(url.pathname)}>; rel="alternate"; type="text/markdown"`)
    if (twin) {
      // wrangler uploads .md as text/markdown today, but that is a guess
      // from its MIME table at deploy time, not a promise. Setting it here
      // keeps the twin's type in this repository, where it can be read.
      headers.set('content-type', 'text/markdown; charset=utf-8')
      // The twin repeats its page word for word. Without this, a search
      // engine may index both and split the page's signal between them; with
      // it, the twin consolidates onto the page instead of competing with it.
      headers.append('link', `<${SITE}${pageOf(url.pathname)}>; rel="canonical"`)
    }
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
  },
}
