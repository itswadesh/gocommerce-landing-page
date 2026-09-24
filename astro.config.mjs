// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import AstroPWA from '@vite-pwa/astro'
import { pageDates } from './src/lib/dates.mjs'

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
      // Honest lastmod: the date a page's source or data was last committed,
      // from git, never the build time — see src/lib/dates.mjs. The 404 is
      // noindex and must not be advertised.
      filter: (page) => !page.endsWith('/404/'),
      serialize: (item) => {
        const p = new URL(item.url).pathname
        const d = pageDates(p)
        if (d.exact) item.lastmod = d.modified
        return item
      },
    }),
    AstroPWA({
      // A precaching worker that takes over as soon as it installs. app.js
      // registers it and reloads the page the next time the tab is hidden,
      // so a new version arrives without anyone pressing refresh.
      registerType: 'autoUpdate',
      injectRegister: false,
      // The manifest is a plain file in public/ — this build has no client
      // bundle for the plugin to emit one into — and Base.astro links it.
      manifest: false,
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // A static site: every navigation is a real file. No app-shell
        // fallback, so an unknown URL still reaches the real 404.
        navigateFallback: null,
        globPatterns: ['**/*.{html,css,js,svg,woff2,json,webmanifest,xml}', 'assets/icons/*.png'],
        // The IndexNow key must be fetched from the origin every time, and the
        // screenshots are large enough to cache on demand rather than up front.
        globIgnores: ['**/9aed8449d5c60c850c662366e3d64c9a.txt', 'assets/admin/**', '404.html'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/assets/admin/') || url.pathname === '/assets/og.png',
            handler: 'CacheFirst',
            options: { cacheName: 'screenshots', expiration: { maxEntries: 60, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
        ],
      },
      experimental: {
        // build.format 'directory' with trailingSlash 'always': the worker
        // must answer /gocommerce/ from gocommerce/index.html.
        directoryAndTrailingSlashHandler: true,
      },
      devOptions: { enabled: false },
    }),
  ],
})
