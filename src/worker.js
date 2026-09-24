/**
 * The Worker in front of the static assets. It does one thing: every HTML
 * response leaves with `charset=utf-8` on its Content-Type. The asset server
 * infers `text/html` from the file and will not take that header from
 * _headers, and a text/html response with no charset is ISO-8859-1 by the
 * HTTP default — fine for a browser, which reads <meta charset>, wrong for
 * every fetcher that does not, which is most of the crawlers this site is
 * written for. Everything else — _headers, _redirects, the 404 page — is the
 * asset server's, reached through env.ASSETS.
 */
export default {
  async fetch(request, env) {
    const res = await env.ASSETS.fetch(request)
    const type = res.headers.get('content-type') || ''
    if (!/^text\/html\b/i.test(type) || /charset=/i.test(type)) return res
    const headers = new Headers(res.headers)
    headers.set('content-type', 'text/html; charset=utf-8')
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
  },
}
