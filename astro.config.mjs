// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'

// One canonical host, declared once. The sitemap, every canonical, every
// og:url and every BreadcrumbList item derive from it — a domain change is a
// one-line edit here, per the playbook's §96.
export default defineConfig({
  site: 'https://kitcommerce.store',
  // Every URL is /path/ with a trailing slash, matching the canonicals the
  // pages have carried since the first audit. Changing this silently changes
  // every canonical, so it is pinned rather than left to the default.
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // The site ships no client framework and one small progressive script,
    // which stays a plain file in public/ rather than being bundled.
    inlineStylesheets: 'never',
  },
  integrations: [
    sitemap({
      // Honest lastmod: only pages whose source changed get a new date, and
      // that is handled by the deploy rather than stamped with the build time.
      // The 404 is noindex and must not be advertised.
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
})
