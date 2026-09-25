/**
 * The blog, as a content collection: one Markdown file per post in
 * src/content/blog/, and the file name is the post's slug and its URL.
 *
 * There is no date field, on purpose. A post is dated the way every other
 * page is — from git, by src/lib/dates.mjs, which maps /blog/<slug>/ to
 * src/content/blog/<slug>.md — so the date a reader sees, the date in the
 * structured data and the sitemap's lastmod cannot disagree, and nobody has to
 * remember to bump a frontmatter field.
 *
 * author is a GitHub handle; the post page links it to github.com/<author>.
 */
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string().default('itswadesh'),
    tags: z.array(z.string()).optional(),
  }),
})

export const collections = { blog }
