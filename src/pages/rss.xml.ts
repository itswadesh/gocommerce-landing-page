/**
 * The blog as RSS 2.0, written by hand rather than through @astrojs/rss: one
 * collection, a few fields, and one dependency fewer. Each item carries the
 * date its Markdown was last committed — the same date the post, its
 * structured data and the sitemap show — so a feed reader never sees a date
 * the page does not.
 */
import type { APIRoute } from 'astro'
import { getCollection } from 'astro:content'
import { pageDates } from '../lib/dates.mjs'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export const GET: APIRoute = async ({ site }) => {
  const abs = (p: string) => new URL(p, site).href
  const posts = (await getCollection('blog'))
    .map((p) => ({ p, d: pageDates(`/blog/${p.id}/`) }))
    .sort((a, b) => (b.d.published ?? b.d.modified).localeCompare(a.d.published ?? a.d.modified))
  const items = posts.map(({ p, d }) => {
    const url = abs(`/blog/${p.id}/`)
    const date = new Date((d.published ?? d.modified) + 'T00:00:00Z').toUTCString()
    return `<item><title>${esc(p.data.title)}</title><link>${url}</link><guid isPermaLink="true">${url}</guid><pubDate>${date}</pubDate><description>${esc(p.data.description)}</description><dc:creator>${esc(p.data.author)}</dc:creator></item>`
  })
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>kitcommerce.store blog</title><link>${abs('/blog/')}</link><atom:link href="${abs('/rss.xml')}" rel="self" type="application/rss+xml"/><description>Notes from the people building GoCommerce and Svelte Commerce.</description><language>en</language>${items.join('')}</channel></rss>
`
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
