<?xml version="1.0" encoding="UTF-8"?>
<!--
  Makes /sitemap.xml readable in a browser. Search engines ignore this file and
  read the XML underneath, which is unchanged.

  The sitemap is an index of one sitemap per section (see the chunks option in
  astro.config.mjs). Opened directly, the index shows every section with its
  pages inline: document() fetches each child sitemap from the same origin,
  so the grouped view needs no second request by hand. A child sitemap opened
  on its own shows just its pages.

  Browsers are dropping XSLT (Chrome has announced its removal), so
  /sitemap/ is the same map as an ordinary page, and this view links to it.
-->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:s="http://www.sitemaps.org/schemas/sitemap/0.9"
  exclude-result-prefixes="s">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>

  <xsl:template name="label">
    <xsl:param name="loc"/>
    <xsl:variable name="key" select="substring-before(substring-after($loc, 'sitemap-'), '-0.xml')"/>
    <xsl:choose>
      <xsl:when test="$key = 'pages'">Main pages</xsl:when>
      <xsl:when test="$key = 'solutions'">Solutions</xsl:when>
      <xsl:when test="$key = 'features'">Features</xsl:when>
      <xsl:when test="$key = 'storefront'">Storefront</xsl:when>
      <xsl:when test="$key = 'compare'">Comparisons</xsl:when>
      <xsl:when test="$key = 'blog'">Blog</xsl:when>
      <xsl:when test="$key = 'integrations'">Integrations</xsl:when>
      <xsl:otherwise><xsl:value-of select="$key"/></xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <xsl:template name="rows">
    <xsl:param name="urls"/>
    <table>
      <thead><tr><th scope="col">Page</th><th scope="col" class="d">Last changed</th></tr></thead>
      <tbody>
        <xsl:for-each select="$urls">
          <tr>
            <td><a href="{s:loc}"><xsl:value-of select="substring-after(s:loc, 'kitcommerce.store')"/></a></td>
            <td class="d"><xsl:value-of select="substring(s:lastmod, 1, 10)"/></td>
          </tr>
        </xsl:for-each>
      </tbody>
    </table>
  </xsl:template>

  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta name="robots" content="noindex"/>
        <title>Sitemap — kitcommerce.store</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml"/>
        <style>
          @font-face { font-family: Geist; font-weight: 100 900; font-display: swap; src: url(/assets/fonts/geist.woff2) format("woff2-variations"); }
          @font-face { font-family: "Geist Mono"; font-weight: 100 900; font-display: swap; src: url(/assets/fonts/geist-mono.woff2) format("woff2-variations"); }
          @font-face { font-family: "Source Serif 4"; font-weight: 200 900; font-display: swap; src: url(/assets/fonts/source-serif-4.woff2) format("woff2-variations"); }
          :root { --paper: #fff; --surface: #fafafa; --ink: #171717; --ink-2: #525252; --ink-3: #6b6b6b; --rule: #e6e6e6; color-scheme: light dark; }
          @media (prefers-color-scheme: dark) { :root { --paper: #0a0a0a; --surface: #131313; --ink: #ededed; --ink-2: #b4b4b4; --ink-3: #8f8f8f; --rule: #262626; } }
          * { box-sizing: border-box; }
          body { margin: 0; background: var(--paper); color: var(--ink); font: 400 15px/1.6 Geist, ui-sans-serif, system-ui, sans-serif; }
          .wrap { max-width: 64rem; margin: 0 auto; padding: 40px 16px 72px; }
          .brand { display: inline-flex; align-items: center; gap: 8px; color: var(--ink); text-decoration: none; font-weight: 600; }
          .brand span { color: var(--ink-3); font-weight: 400; }
          .kicker { margin: 40px 0 0; font: 500 11px/1 "Geist Mono", ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-2); }
          h1 { margin: 12px 0 0; font: 700 clamp(2rem, 6vw, 3rem)/1.05 "Source Serif 4", Georgia, serif; letter-spacing: -.02em; }
          .lede { margin: 14px 0 0; max-width: 40rem; color: var(--ink-2); }
          h2 { margin: 44px 0 0; font: 700 1.375rem/1.2 "Source Serif 4", Georgia, serif; }
          h2 small { font: 400 .8125rem Geist, sans-serif; color: var(--ink-3); margin-left: 8px; }
          table { width: 100%; margin-top: 12px; border-collapse: collapse; }
          th { text-align: left; font: 500 11px/1 "Geist Mono", monospace; letter-spacing: .1em; text-transform: uppercase; color: var(--ink-3); padding: 10px 0; border-bottom: 1px solid var(--rule); }
          td { padding: 9px 0; border-bottom: 1px solid var(--rule); vertical-align: top; overflow-wrap: anywhere; }
          td a { color: var(--ink); text-decoration: none; font-family: "Geist Mono", ui-monospace, monospace; font-size: 13.5px; }
          td a:hover { text-decoration: underline; text-underline-offset: 3px; }
          .d { width: 9.5rem; text-align: right; color: var(--ink-3); font-family: "Geist Mono", ui-monospace, monospace; font-size: 13px; white-space: nowrap; }
          .foot { margin-top: 44px; font-size: 13px; color: var(--ink-3); }
          .foot a { color: var(--ink-2); }
        </style>
      </head>
      <body>
        <div class="wrap">
          <a class="brand" href="/">kitcommerce<span>.store</span></a>
          <p class="kicker">Sitemap</p>
          <xsl:choose>
            <xsl:when test="s:sitemapindex">
              <h1>Every page, by section</h1>
              <p class="lede">
                <xsl:value-of select="count(s:sitemapindex/s:sitemap)"/> sections. Search engines read this same file as XML; the
                <a href="/sitemap/">sitemap page</a> shows it for people too.
              </p>
              <xsl:for-each select="s:sitemapindex/s:sitemap">
                <xsl:variable name="child" select="document(substring-after(s:loc, 'kitcommerce.store'))/s:urlset/s:url"/>
                <h2>
                  <xsl:call-template name="label"><xsl:with-param name="loc" select="s:loc"/></xsl:call-template>
                  <small><xsl:value-of select="count($child)"/> pages · <a href="{s:loc}"><xsl:value-of select="substring-after(s:loc, 'kitcommerce.store/')"/></a></small>
                </h2>
                <xsl:call-template name="rows"><xsl:with-param name="urls" select="$child"/></xsl:call-template>
              </xsl:for-each>
            </xsl:when>
            <xsl:otherwise>
              <h1>One section of the site</h1>
              <p class="lede"><xsl:value-of select="count(s:urlset/s:url)"/> pages in this part of the sitemap. <a href="/sitemap.xml">All sections</a>.</p>
              <xsl:call-template name="rows"><xsl:with-param name="urls" select="s:urlset/s:url"/></xsl:call-template>
            </xsl:otherwise>
          </xsl:choose>
          <p class="foot">Dates are when each page’s source was last committed. <a href="/">Back to the site</a>.</p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
