# Universal SEO + GEO Website Audit & Optimization Playbook

## Purpose

This document captures a reusable, multi-stage process for improving a website from a functional site into a stronger SEO, GEO, conversion, trust, and indexing asset.

It is designed to be applied to future websites across:

- local businesses
- SaaS
- ecommerce
- tourism
- B2B
- marketplaces
- service businesses
- product websites
- lead-generation websites

---

# 1. Definitions

## SEO

SEO = Search Engine Optimization.

The goal is to make it easy for search engines to:

1. crawl the website
2. understand what each page is about
3. identify the right page for the right search intent
4. trust the information
5. index the correct URL
6. surface useful pages for relevant searches

## GEO

In this playbook, GEO primarily means **Generative Engine Optimization**.

That means making the website easy for AI-powered search and answer systems to understand, summarize, cite, and trust.

Examples include:

- Google AI search experiences
- ChatGPT search
- Bing/Copilot
- Perplexity
- Gemini
- future AI answer engines

GEO is not a replacement for SEO. Good GEO usually depends on strong SEO, clear entities, first-party evidence, explicit facts, and structured content.

## Local / Geographic SEO

For businesses serving physical areas, this playbook also covers location-based search:

- city
- region
- service area
- pickup area
- neighborhood
- destination
- branch/location

---

# 2. Core Principle

Do not optimize for:

> More content.

Optimize for:

```txt
Clear intent
+ clear crawling
+ clear indexing
+ strong evidence
+ useful information
+ fast UX
+ strong conversion
```

A website can have thousands of words and still perform poorly if users and search engines cannot quickly understand:

- what it offers
- who it is for
- where it operates
- why it is credible
- what action the visitor should take

---

# 3. Multi-Level Audit Model

Audit in layers instead of solving everything in one pass.

Recommended sequence:

```txt
Level 1 — Positioning
Level 2 — Conversion
Level 3 — Content Structure
Level 4 — Search Intent
Level 5 — Technical SEO
Level 6 — Internal Architecture
Level 7 — Trust / Evidence
Level 8 — GEO / AI Readability
Level 9 — Performance
Level 10 — Indexation & Search Console
Level 11 — Data-Led Iteration
```

Each level solves a different problem.

---

# 4. Level 1 — Positioning Audit

Before auditing SEO, understand the business.

Ask:

- What exactly is being sold?
- Who is the ideal customer?
- What problem is being solved?
- What market or location matters?
- What is the highest-value customer?
- What is the strongest differentiator?
- What should the visitor do next?

A website cannot rank clearly if the offer itself is vague.

## Positioning Template

Write one sentence:

```txt
We help [target customer]
get [desired result]
using [product/service]
in/for [market/location]
with [main differentiator].
```

---

# 5. Level 2 — Conversion Audit

SEO traffic is useless if users do not know what to do next.

Within 5 seconds, a visitor should understand:

1. what the business does
2. who it is for
3. why it is different
4. what action to take

## Hero Checklist

The hero should contain:

- clear value proposition
- clear product/service
- relevant image/video
- one primary CTA
- one optional secondary CTA
- minimal friction
- trust/reassurance if useful

Good CTA examples:

```txt
Get Price on WhatsApp
Book a Demo
Check Availability
Get a Quote
Start Free
Call Now
See Pricing
```

Weak CTA examples:

```txt
Learn More
Explore
Discover
Continue
Read More
```

Use weak CTAs only for secondary navigation.

---

# 6. Level 3 — Content Structure Audit

A common mistake is to keep adding content until the homepage becomes an encyclopedia instead of a conversion page.

The homepage should summarize.

Inner pages should go deep.

## Homepage Rule

Before adding any section, ask:

```txt
Does this help the visitor decide to trust us, understand us, or contact us?
```

If not, it probably belongs on an inner page.

## Recommended Homepage Structure

```txt
Hero
↓
Trust Strip
↓
Proof / Product / Service
↓
Why This Solution
↓
Primary Conversion Tool / CTA
↓
Use Cases / Packages / Plans
↓
Top Categories / Destinations / Features
↓
Pricing Logic
↓
Why Choose Us
↓
Short FAQ
↓
Final CTA
↓
Footer
```

---

# 7. Level 4 — Search Intent Audit

Every important page should have one primary intent.

Do not make ten pages compete for the same keyword.

## Search Intent Mapping

| Page | Primary Intent | Secondary Intent | CTA |
|---|---|---|---|
| Homepage | Main commercial category | brand + category | primary conversion |
| Service Page | Specific service | related problem | quote/contact |
| Location Page | service + city | local intent | contact |
| Product Page | product/category | features | buy/demo |
| Guide Page | informational question | related service | internal link |
| Comparison Page | comparison intent | commercial research | conversion |

## Cannibalization Warning

Avoid pages where these are nearly identical:

- title
- H1
- intro
- primary keyword
- CTA
- content structure

Each page needs a distinct purpose.

---

# 8. Level 5 — Technical SEO Audit

Technical SEO should be verified before producing more content.

## HTTPS

Preferred:

```txt
http://example.com
→
https://example.com/
```

Avoid redirect chains.

## Preferred Domain

Choose one:

```txt
https://example.com
```

or:

```txt
https://www.example.com
```

Do not let both behave as independent sites.

## Canonical Tags

Every indexable page should have one canonical.

```html
<link rel="canonical" href="https://example.com/service/" />
```

Rules:

- self-canonicalize normal pages
- do not canonicalize every page to homepage
- do not use staging/old domains
- use HTTPS
- avoid duplicate canonical tags

## robots.txt

Verify:

```txt
https://example.com/robots.txt
```

Typical baseline:

```txt
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap.xml
```

## sitemap.xml

Verify:

```txt
https://example.com/sitemap.xml
```

Only include:

- canonical URLs
- indexable URLs
- HTTP 200 URLs
- final production URLs

Do not include:

- redirects
- 404s
- staging URLs
- query duplicates
- noindex pages
- old domains

## Indexability

Important pages should:

- return 200
- not be blocked by robots
- not contain accidental `noindex`
- have correct canonical
- have internal links
- appear in sitemap where appropriate

---

# 9. Domain Migration / Static Hosting / CDN Audit

When attaching a custom domain to GitHub Pages, a CDN, static hosting, or another platform, check for duplicate-domain risk.

Search the codebase for the old domain.

Check:

- canonical
- Open Graph
- JSON-LD
- sitemap
- hardcoded links
- image URLs
- social metadata
- redirects

Prefer relative internal links:

```html
<a href="/services/">Services</a>
```

instead of hardcoded hostnames.

---

# 10. Level 6 — Internal Architecture Audit

A strong site should behave like a knowledge graph.

## Internal Linking Pattern

### Homepage
Links to:
- main services
- main categories
- main locations
- key commercial pages

### Service Pages
Link to:
- relevant use cases
- locations
- proof/case studies
- FAQs
- contact

### Location Pages
Link to:
- service
- nearby areas
- relevant guides
- contact

### Informational Pages
Link to:
- related commercial pages
- related guides
- next-step CTA

### Product Pages
Link to:
- related products
- category
- comparison
- docs/support

## Orphan Page Rule

No important page should exist without internal links pointing to it.

---

# 11. Breadcrumbs

Use visible breadcrumbs on inner pages.

```txt
Home > Category > Detail
```

Benefits:

- clearer UX
- stronger hierarchy
- better entity relationships
- easier crawler understanding

Use `BreadcrumbList` structured data when appropriate.

---

# 12. Level 7 — Trust & Evidence Audit

Generic marketing claims are weak.

First-party evidence is strong.

## Strong Trust Signals

Examples:

- real product photos
- real vehicle photos
- screenshots
- real staff
- real project examples
- delivery date
- registration/specification
- actual product dimensions
- real pricing logic
- clear inclusions/exclusions
- verified locations
- real case studies
- real testimonials
- documented process

## Weak Trust Signals

Avoid:

- fake reviews
- fake counters
- fake urgency
- invented awards
- fake “trusted by 10,000+”
- generated testimonial photos
- unsupported savings percentages
- fake scarcity

---

# 13. First-Party Evidence for GEO

AI answer systems benefit from original, attributable information.

Create content that is easy to cite:

- original data
- practical guides
- product specifications
- process explanations
- comparison tables
- original photos
- original testing
- case studies
- pricing methodology
- FAQs based on real customer questions

This is stronger than repeating generic content found on hundreds of websites.

---

# 14. Level 8 — GEO / AI Readability

AI systems should not have to infer basic facts.

Make core facts explicit:

- company name
- product/service
- target user
- service area
- pricing model
- key capabilities
- limitations
- contact method
- location
- ownership/authorship where relevant

## Entity Consistency

Use the same entity names across:

- homepage
- About page
- schema
- footer
- social profiles
- business listings
- structured data

Do not create confusing brand/entity naming.

---

# 15. GEO Content Format

Use formats that are easy to extract:

- descriptive headings
- short paragraphs
- tables where useful
- concise bullet points
- explicit answers
- clear definitions
- visible timestamps for changing information
- sourceable facts

Avoid hiding important facts only inside:

- images
- carousels
- video
- decorative animations
- JavaScript-only interactions

---

# 16. Answer-Ready Content

Useful pattern:

```txt
Question
↓
Direct answer
↓
Supporting detail
↓
Evidence
↓
Next action
```

Example:

```txt
How many users can use the service?

The service supports up to 17 passengers.

For larger luggage needs, usable seating may depend on trip configuration.

Contact us with the group size and luggage details for confirmation.
```

---

# 17. Structured Data

Structured data does not guarantee ranking.

Its role is to make entities and page meaning clearer.

Useful schema types:

- Organization
- LocalBusiness
- Product
- Service
- BreadcrumbList
- FAQPage
- Article
- Event
- SoftwareApplication
- WebSite

Only use schema that accurately reflects visible content.

Do not invent:

- ratings
- prices
- reviews
- addresses
- availability
- awards

---

# 18. Level 9 — Performance Audit

SEO, GEO, and conversion all benefit from speed.

## Core Web Vitals Targets

Aim for:

```txt
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

## Performance Checklist

Check:

- hero image size
- image compression
- WebP/AVIF
- image width/height
- lazy loading
- font loading
- unnecessary JS
- third-party scripts
- animation libraries
- video autoplay
- layout shift
- mobile performance

---

# 19. Hero Video Rule

If using video:

- provide poster image
- do not block first render
- muted
- playsinline
- defer load
- start after engagement when useful
- pause outside viewport
- provide static fallback

Do not sacrifice LCP for video.

---

# 20. Image SEO

Use meaningful filenames.

Good:

```txt
product-service-location.webp
```

Weak:

```txt
IMG_2847.jpg
```

Use descriptive alt text.

Avoid keyword stuffing.

---

# 21. Level 10 — Local / Geographic SEO

For location-based businesses, build pages around genuine geographic intent.

Examples:

```txt
/service-in-city/
/city-to-destination/
/pickup-from-city/
/destination-tour/
/nearby-area-service/
```

Only create pages when the business genuinely serves that intent.

## Local Page Content

Useful local pages can include:

- how service works in that location
- pickup/dropoff
- travel pattern
- local constraints
- service area
- nearby destinations
- contact CTA
- real examples

Do not create thin city-name-swapped pages.

---

# 22. Google Business Profile

For eligible local businesses, keep these consistent:

- business name
- phone
- website
- location/service area
- hours
- category

This reinforces entity consistency.

---

# 23. Level 11 — Search Console & Indexation

Do not assume a page is indexed.

Verify.

## Search Console Workflow

After deployment:

1. verify the domain
2. submit sitemap
3. inspect homepage
4. inspect top commercial pages
5. request indexing where appropriate
6. monitor coverage/indexing
7. monitor queries
8. monitor impressions
9. monitor CTR
10. monitor average position

---

# 24. The Most Important Iteration Rule

Once the technical foundation is correct:

**Stop guessing.**

Use Search Console.

Build or improve pages based on:

- actual impressions
- actual search queries
- pages Google is testing
- CTR
- ranking movement
- conversion quality

---

# 25. Content Expansion Framework

Before writing a new page, ask:

1. Does a real search intent exist?
2. Is the intent already covered?
3. Will this page be meaningfully different?
4. Does it have original value?
5. Can it convert or support another page?
6. Can we maintain it?
7. Is the information accurate?

If most answers are no, do not create it.

---

# 26. Avoid SEO Bloat

Common mistakes:

- many nearly identical location pages
- huge AI-generated FAQ libraries
- duplicate destination sections
- generic blog posts
- excessive keyword variations
- oversized homepage
- repeated service copy
- fake statistics
- redundant schema
- doorway pages

More pages do not automatically create more authority.

---

# 27. Content Pruning

Sometimes the best SEO action is removal.

Prune or consolidate:

- duplicate content
- weak pages
- outdated pages
- obsolete landing pages
- stale transport schedules
- unused campaign pages
- thin articles

Redirect where appropriate.

---

# 28. Freshness & Time-Sensitive Content

Some content becomes stale quickly:

- fares
- transport schedules
- prices
- availability
- regulations
- opening hours
- promotions

Use:

```txt
Last verified: [date]
```

when relevant.

If exact data cannot be maintained, use wording such as:

```txt
Typical connections include...
```

instead of publishing precise schedules forever.

---

# 29. Conversion Measurement

Track meaningful actions:

- WhatsApp click
- phone call
- lead form
- quote request
- add to cart
- checkout
- demo request
- booking
- signup

## Conversion Funnel

```txt
Visitor
→ Intent Action
→ Qualified Lead
→ Sale / Booking
```

Track outcomes, not vanity metrics.

---

# 30. SEO + Conversion Must Work Together

A page should not rank for people who will never convert.

Prioritize revenue-adjacent intent.

High-value examples:

```txt
17 seater traveller in Koraput
Shopify conversion app
custom jewellery manufacturer
B2B ecommerce platform
```

Lower commercial intent may still be useful, but it serves a different role.

---

# 31. Cache-Aware Audit Process

A major lesson from iterative audits:

**Always confirm you are auditing the current deployment.**

CDNs, static hosts, browsers, and crawlers may return stale content.

## Fresh Audit Checklist

Before re-auditing:

- deploy
- purge CDN cache if needed
- invalidate edge cache
- verify deployment timestamp
- use cache-busting query string if useful
- check actual source
- compare visible H1/title
- verify a known recent change

Do not assume a crawler is seeing the latest version.

---

# 32. Never Claim a Fix Is Missing Until Freshness Is Confirmed

If the live page appears unchanged:

1. verify deployment
2. purge cache
3. confirm CDN state
4. re-fetch
5. then assess

This prevents false audit findings.

---

# 33. Multi-Pass Audit Strategy

## Pass 1 — Broad Audit

Find:

- positioning problems
- weak CTA
- trust gaps
- content gaps
- visual hierarchy issues

## Pass 2 — Conversion Audit

Improve:

- hero
- CTA
- proof
- contact flow
- pricing clarity

## Pass 3 — SEO Architecture

Create:

- service pages
- location pages
- category pages
- destination pages
- internal links

## Pass 4 — Technical SEO

Verify:

- canonical
- sitemap
- robots
- indexability
- redirects
- domain consistency

## Pass 5 — Content Pruning

Remove:

- duplicate homepage sections
- excessive detail
- repeated destinations/features
- filler

## Pass 6 — Fresh Production Audit

After implementation:

- invalidate cache
- re-fetch
- verify exact changes
- only report remaining issues

## Pass 7 — Search Console Audit

After Google begins crawling:

- queries
- impressions
- CTR
- indexed pages
- cannibalization
- coverage

---

# 34. SEO Audit Priority Model

## P0 — Blocking

Fix immediately:

- noindex on important page
- robots blocking
- broken sitemap
- wrong canonical
- old/staging domain canonical
- HTTP/HTTPS duplication
- major redirect problem
- broken page
- duplicate public domains

## P1 — High Impact

Fix next:

- weak page intent
- duplicate H1/title
- poor internal linking
- weak trust
- slow hero
- content duplication
- confusing CTA
- inconsistent entity naming

## P2 — Optimization

Improve later:

- long-tail content
- secondary schema
- additional guides
- CTR testing
- FAQ expansion
- richer media
- supporting articles

---

# 35. Universal Commercial Landing Page Template

```txt
Clear H1
↓
Short value proposition
↓
Primary CTA
↓
Proof
↓
Problem / use case
↓
How it works
↓
Benefits
↓
Evidence / examples
↓
Pricing / process
↓
FAQ
↓
CTA
```

---

# 36. Universal Service Page Template

```txt
H1: [Service] in/for [Market]
↓
What it is
↓
Who it is for
↓
Problems solved
↓
How it works
↓
Proof
↓
Pricing / quote model
↓
FAQ
↓
CTA
↓
Related pages
```

---

# 37. Universal Location Page Template

```txt
H1: [Service] in [Location]
↓
Short local context
↓
How service works there
↓
Availability / pickup / service area
↓
Relevant local proof
↓
Nearby areas / destinations
↓
FAQ
↓
CTA
```

Do not create the page unless the location is genuinely served.

---

# 38. Universal Destination / Guide Page Template

```txt
H1
↓
Direct summary
↓
Why visit / why it matters
↓
Practical information
↓
Best route / timing / use case
↓
Related places
↓
Relevant service CTA
↓
FAQ
```

---

# 39. Universal Ecommerce Product Page Template

```txt
Product name
↓
Hero image
↓
Price
↓
Primary CTA
↓
Key attributes
↓
Trust / delivery / returns
↓
Description
↓
Specifications
↓
Reviews
↓
FAQ
↓
Related products
```

SEO should support conversion, not interrupt it.

---

# 40. Universal SaaS Page Template

```txt
Outcome-focused H1
↓
Product explanation
↓
Demo / signup CTA
↓
Problem
↓
Workflow
↓
Screenshots
↓
Use cases
↓
Integrations
↓
Pricing
↓
Proof
↓
FAQ
↓
CTA
```

---

# 41. GEO-Ready About Page

A strong About page should explicitly state:

- company name
- what the company does
- who it serves
- where it operates
- products/services
- history
- founders/team where appropriate
- contact information
- relevant proof

This strengthens entity understanding.

---

# 42. GEO-Ready FAQ

FAQ content should answer real customer questions.

Good:

```txt
How is pricing calculated?
What is included?
Do you serve [location]?
How long does setup take?
What integrations are supported?
```

Avoid generic filler questions unless they genuinely match user intent.

---

# 43. GEO-Ready Evidence Pages

Highly valuable pages include:

- case studies
- benchmark reports
- original research
- implementation guides
- technical documentation
- pricing methodology
- comparison pages
- release notes
- real examples

These create sourceable information.

---

# 44. Make Important Claims Verifiable

If the site says:

```txt
New vehicle
```

show:

- date
- image
- specification

If the site says:

```txt
Fast setup
```

explain:

- typical time
- process
- dependencies

If the site says:

```txt
Supports 20 integrations
```

list them.

Specificity creates credibility.

---

# 45. Avoid Unsupported Superlatives

Avoid:

- best
- #1
- cheapest
- fastest
- most trusted
- guaranteed

unless evidence exists.

Use concrete facts instead.

---

# 46. Content Quality Test

For every page, ask:

```txt
Could this page have been generated for any business by changing only the company name?
```

If yes, it is too generic.

Add:

- original evidence
- real process
- unique constraints
- examples
- data
- photos
- product details
- actual experience

---

# 47. AI Content Rule

AI can accelerate production.

AI should not replace:

- fact checking
- originality
- first-party evidence
- business knowledge
- customer insight
- subject expertise

Use AI to structure and refine, not to mass-produce generic filler.

---

# 48. Duplicate Content Rule

Duplicate content is not only exact text.

It also includes pages with:

- same purpose
- same structure
- same intent
- same CTA
- slightly changed wording

Consolidate when possible.

---

# 49. Internal Search Intent Hierarchy

A healthy commercial website often follows:

```txt
Homepage
→ Category / Service
→ Use Case / Location / Destination
→ Detail Page
→ Conversion
```

This gives users and crawlers a clear hierarchy.

---

# 50. SEO + GEO Launch Checklist

## Technical

- [ ] HTTPS
- [ ] preferred hostname
- [ ] canonical tags
- [ ] robots.txt
- [ ] sitemap.xml
- [ ] no accidental noindex
- [ ] correct redirects
- [ ] no staging URLs
- [ ] 404 page
- [ ] mobile responsive

## Metadata

- [ ] unique title
- [ ] unique meta description
- [ ] one H1
- [ ] Open Graph
- [ ] social preview image

## Content

- [ ] clear offer
- [ ] clear audience
- [ ] clear CTA
- [ ] proof
- [ ] pricing/process clarity
- [ ] useful FAQs
- [ ] original information

## Architecture

- [ ] internal links
- [ ] breadcrumbs
- [ ] no orphan pages
- [ ] search intent map

## GEO

- [ ] entity name consistent
- [ ] About page
- [ ] explicit facts
- [ ] evidence
- [ ] schema
- [ ] sourceable content
- [ ] dates on changing information

## Performance

- [ ] optimized hero
- [ ] image compression
- [ ] lazy loading
- [ ] no major CLS
- [ ] minimal JS
- [ ] mobile performance

## Measurement

- [ ] Search Console
- [ ] analytics
- [ ] conversion events
- [ ] sitemap submitted

---

# 51. 30-Day Post-Launch Process

## Week 1

Verify:

- indexing
- crawl errors
- sitemap
- canonical
- conversions

Do not make unnecessary content changes.

## Week 2

Review:

- impressions
- indexed pages
- early search queries
- technical warnings

## Week 3

Improve:

- weak titles
- low-CTR pages
- internal linking
- obvious content gaps

## Week 4

Decide new content based on actual query data.

---

# 52. 90-Day SEO + GEO Process

Every month:

1. export Search Console queries
2. identify high-impression / low-CTR pages
3. identify page-2 rankings
4. identify cannibalization
5. improve content
6. strengthen internal links
7. update stale information
8. add new evidence
9. review AI/search referrals where measurable
10. track conversions

---

# 53. High-Impression / Low-CTR Strategy

If a page gets impressions but few clicks, check:

- title relevance
- description
- intent mismatch
- weak value proposition
- wrong page ranking
- outdated snippet

Do not immediately rewrite the whole page.

---

# 54. Page-2 Opportunity Strategy

Pages ranking around positions 11–20 are often strong opportunities.

Improve:

- intent match
- topical completeness
- internal links
- evidence
- title/H1
- freshness
- UX

---

# 55. Cannibalization Audit

Look for two or more pages receiving impressions for the same query.

Decide whether to:

- merge
- differentiate
- redirect
- change intent
- strengthen internal hierarchy

Do not let multiple weak pages compete when one strong page would be better.

---

# 56. GEO Monitoring

GEO measurement is still evolving.

Useful signals include:

- branded searches
- referral traffic from AI tools where visible
- citation appearances
- Search Console query growth
- backlinks
- mentions
- direct traffic
- assisted conversions

Do not rely on one “GEO score”.

---

# 57. What Makes a Website Citation-Worthy

AI/search systems are more likely to use information that is:

- specific
- original
- clear
- well structured
- recent
- attributable
- evidence-backed
- consistent

Create information worth referencing.

---

# 58. Final Universal Principle

The best SEO/GEO website is not the one with the most pages.

It is the website where:

```txt
Search engines understand the site
AI systems understand the facts
Users understand the offer
Trust is easy to verify
The next action is obvious
The site is fast
The correct pages are indexed
And real search data guides future work
```

---

# 59. Coding-Agent Master Instruction

Use this playbook when auditing or improving any future website.

Process:

1. understand the business
2. identify the target customer
3. identify primary search intent
4. audit the hero and CTA
5. audit trust and proof
6. map page intent
7. audit technical SEO
8. audit domain/canonical consistency
9. audit site architecture
10. audit internal linking
11. remove duplicate content
12. improve evidence
13. improve GEO readability
14. improve performance
15. validate production deployment
16. invalidate cache before final audit
17. verify Search Console
18. wait for real query data
19. iterate from evidence

Do not rebuild a working website unless necessary.

Do not add content just to make the site larger.

Do not change a successful conversion section without a measurable reason.

Optimize for:

```txt
Intent
+ Trust
+ Crawlability
+ Indexability
+ Evidence
+ Speed
+ Conversion
```


---

# 60. Advanced Engineering Additions

The following sections extend the core playbook with implementation-level controls that are especially useful for static, generated, multilingual, local-service, and content-heavy sites.

Treat measured numbers and thresholds as **diagnostic examples**, not universal ranking rules. Always validate against the current site, framework, hosting platform, and real user data.

---

# 61. One Fact, One Source of Truth

A critical engineering rule:

```txt
One fact
→ one source object
→ rendered everywhere
```

Examples:

- phone number
- opening hours
- pricing rules
- cancellation policy
- service area
- product specifications
- business name
- social URLs
- contact methods
- location coordinates
- last-verified dates

Do not hardcode the same fact across:

- visible page content
- footer
- JSON-LD
- Open Graph
- FAQs
- translated pages
- policy pages

A single config/content source prevents visible content and structured data from drifting apart.

Example:

```js
const business = {
  phone: "+91XXXXXXXXXX",
  hours: {
    opens: "07:00",
    closes: "21:00"
  }
};
```

Render the same values into:

- human-readable page content
- `ContactPoint`
- `openingHoursSpecification`
- contact page
- footer
- local landing pages

---

# 62. Never Publish Unverified Numbers

Do not publish numbers simply because a template expects them.

Avoid unverified:

- prices
- distances
- percentages
- savings claims
- delivery windows
- refund windows
- rankings
- review counts
- response times
- performance claims
- “last updated” dates

If the feature is ready but the value is not verified, keep the value unset and hide the feature.

This is preferable to:

```txt
Price coming soon
TBD
Approximate 50% savings
Updated today
```

when none of those statements are verified.

---

# 63. Ship Incomplete Real-World Features Dark

Build the feature in code, but gate it on real data.

Example:

```js
const config = {
  rates: null,
  businessProfile: null,
  analyticsId: null
};
```

Renderer:

```js
if (!config.rates) return "";
```

Use this for:

- pricing tables
- staff photos
- reviews
- analytics
- coupons
- opening hours
- business-profile links
- location modules

Before deployment:

1. test once with temporary fake data
2. confirm the feature renders
3. restore `null`
4. grep the built output for the temporary value
5. deploy only when nothing leaked

---

# 64. Separate Content, Templates, and Generated Output

For static or generated sites, prefer a clean separation:

```txt
src/
  content/
  config/
  templates/

build/

dist/
```

Principle:

```txt
Content/data
→ template
→ generated HTML
```

Benefits:

- site-wide facts remain consistent
- metadata can be validated automatically
- duplicate titles can be detected
- sitemap generation becomes deterministic
- redirects and canonicals can be generated from one source
- multilingual pages become safer
- old-domain references can be grepped reliably

This is an architectural pattern, not a requirement to use a particular static-site generator.

---

# 65. Honest `lastmod`

Do not set every sitemap `<lastmod>` to the build date.

That creates artificial freshness.

A stronger approach is to update `lastmod` only when the page's meaningful source data changes.

Concept:

```js
hash(pageSource)
→ compare with previous hash
→ update date only if changed
```

The same real update date can feed:

- sitemap `<lastmod>`
- visible `Updated` text
- `<time datetime="...">`
- Article schema when appropriate

Never fabricate freshness.

---

# 66. Build-Time Validation

Do not rely only on visual review.

Add automated validation after every build.

Useful checks:

- parse every JSON-LD block
- detect duplicate page titles
- detect duplicate H1s
- verify canonical URLs
- grep for old domains
- grep for test data
- grep for `TODO`
- grep for `lorem`
- detect broken internal links
- detect orphan pages
- compare page count with sitemap count
- ensure all sitemap URLs exist
- verify production hostname
- ensure no accidental `noindex`
- verify Open Graph URLs
- verify absolute social images

Build should fail on critical SEO errors.

---

# 67. Internal Link Graph Audit

Do not assume navigation creates a healthy internal-link graph.

Audit at least these failure modes:

| Failure | Meaning |
|---|---|
| Named but not linked | Body mentions an entity that has its own page but does not link to it |
| Dead end | Page has no useful in-body link to another content page |
| Orphan | Page has no meaningful inbound internal link |
| Nav-only | Page is linked only from global header/footer |

Global navigation is useful, but contextual body links help explain relationships between pages.

---

# 68. Hub-and-Spoke Architecture

Avoid linking every leaf page directly from the homepage.

Prefer:

```txt
Homepage
→ Topic Hub
→ Detail Pages
```

Example:

```txt
Homepage
→ Destinations
  → Deomali
  → Duduma
  → Gupteswar
```

or:

```txt
Homepage
→ Shopify Revenue Tools
  → Channel Automation
  → Retention
  → Conversion Optimization
```

Benefits:

- clearer topical hierarchy
- less homepage clutter
- stronger context
- scalable architecture
- better internal linking

After removing homepage links, verify no page becomes orphaned.

---

# 69. Quantitative Duplicate-Content Audit

For larger generated sites, compare page text programmatically.

A useful method:

```txt
n-gram overlap
```

For example, compare 7-word sequences between page pairs.

Use thresholds only as investigation triggers, not ranking laws.

Practical interpretation:

```txt
Very high overlap
→ inspect immediately

Moderate overlap
→ determine whether shared components explain it

Low overlap
→ likely distinct
```

Important:

Exclude deliberately shared components before judging editorial duplication, such as:

- footer
- shared legal block
- shared pricing component
- common navigation
- reusable itinerary day
- repeated product specification table

The goal is to detect duplicated **writing and intent**, not punish legitimate shared facts.

---

# 70. Put Important Facts Inside Main Content

Do not place the most important facts only:

- above `<article>`
- in decorative banners
- in sidebars
- in hidden panels
- in JavaScript-only widgets

For content/guide pages, important descriptive material should be inside the main semantic content area:

```html
<main>
  <article>
    <h1>...</h1>
    <p>Direct answer...</p>
    <dl>...</dl>
  </article>
</main>
```

This improves:

- readability
- accessibility
- content extraction
- answer-engine usefulness

Test important pages through a readability/content-extraction tool and review what remains.

---

# 71. Mark Facts Semantically

Use appropriate HTML semantics.

For key facts:

```html
<dl>
  <dt>Capacity</dt>
  <dd>17 passengers</dd>

  <dt>Fuel</dt>
  <dd>Diesel</dd>
</dl>
```

For tables:

```html
<table>
  <caption>Pricing comparison</caption>
  <thead>
    <tr>
      <th scope="col">Plan</th>
      <th scope="col">Price</th>
    </tr>
  </thead>
</table>
```

For dates:

```html
<time datetime="2026-09-21">21 September 2026</time>
```

Semantic markup helps both accessibility and extraction.

---

# 72. Full Document Head Checklist

For indexable pages, audit the complete `<head>`.

Baseline:

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<title>...</title>
<meta name="description" content="...">

<meta name="robots"
      content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1">

<link rel="canonical" href="https://example.com/page/">

<meta property="og:type" content="website">
<meta property="og:site_name" content="Brand">
<meta property="og:title" content="...">
<meta property="og:description" content="...">
<meta property="og:url" content="https://example.com/page/">
<meta property="og:image" content="https://example.com/assets/share.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="...">
<meta name="twitter:description" content="...">
<meta name="twitter:image" content="https://example.com/assets/share.jpg">

<meta name="theme-color" content="#ffffff">

<link rel="icon" sizes="32x32" href="/favicon-32.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
```

Add only preloads that are genuinely critical.

Do not preload every image/font.

---

# 73. Robots Preview Directives

For pages you want richly previewed in search, consider:

```txt
max-snippet:-1
max-image-preview:large
max-video-preview:-1
```

Example:

```html
<meta
  name="robots"
  content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1"
/>
```

These control how much content Google may use in result previews.

Do not use them blindly on pages with legal/privacy constraints.

---

# 74. `noindex, follow` vs `noindex, nofollow`

When withholding a page from search but still wanting crawlers to discover its links, use:

```html
<meta name="robots" content="noindex,follow">
```

Do not default to:

```txt
noindex,nofollow
```

unless you intentionally want crawlers not to follow the page's links.

---

# 75. Exact Canonical / Open Graph Identity

For a page:

```txt
canonical URL
og:url
structured-data URL
hreflang URL
sitemap URL
```

should represent the same final public URL format.

Avoid subtle mismatches:

```txt
https://example.com/page
https://example.com/page/
http://example.com/page/
https://www.example.com/page/
```

Choose one canonical form and generate all signals from it.

---

# 76. Heading IDs and Deep Links

Give meaningful sections stable IDs.

Example:

```html
<h2 id="pricing">Pricing</h2>
```

Benefits:

- deep linking
- shareable sections
- better navigation
- answer references
- improved table-of-contents behavior

Prefer stable IDs rather than random generated hashes.

---

# 77. FAQ Without JavaScript Dependency

Where appropriate:

```html
<details>
  <summary>How is pricing calculated?</summary>
  <p>...</p>
</details>
```

Benefits:

- accessible
- crawlable
- functional without JS
- compact on mobile

Only add `FAQPage` structured data where the FAQ content is actually visible and eligible.

---

# 78. Decorative Elements Should Not Pollute Content

Decorative UI elements should not carry misleading accessible/content text.

For truly decorative elements:

```html
aria-hidden="true"
```

Examples:

- decorative SVG
- decorative canvas
- ornamental icons
- visual separators
- background illustrations

Do **not** hide meaningful content.

---

# 79. JSON Data Islands

Large UI/config payloads that are not page prose can live in:

```html
<script type="application/json" id="page-data">
{
  "coordinates": [],
  "gallery": []
}
</script>
```

This keeps application data separate from visible content and executable JavaScript.

Use carefully and never duplicate important indexable facts only inside JSON islands.

---

# 80. Structured Data as an Entity Graph

Do not repeat unrelated full entity definitions everywhere.

Give major entities stable `@id` values.

Example:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    }
  ]
}
```

Then reference the same organization from:

- Article
- Service
- Product
- WebSite
- ContactPage
- author/publisher relationships

This makes entity identity more consistent.

---

# 81. Use the Correct Schema Type

Match structured data to the actual page.

Examples:

- contact page → `ContactPage`
- service page → `Service`
- article/guide → `Article`
- product → `Product`
- local operator → relevant `LocalBusiness` subtype
- software → `SoftwareApplication`

Do not mark every page as `Article`.

Do not add properties that are invalid for the chosen type.

Validate JSON-LD programmatically and with current schema/testing tools.

---

# 82. `alternateName` for Entity Vocabulary

A product/business may have:

- formal name
- short brand name
- market name
- common search term

Where accurate, use `alternateName` in schema.

Example:

```json
{
  "@type": "Organization",
  "name": "Example Technologies Private Limited",
  "alternateName": "Example"
}
```

Do not use `alternateName` to stuff unrelated keywords.

---

# 83. Mirror Visible Facts Into Structured Data

When a visible page states:

```txt
Capacity: 17
Service area: Koraput
```

the relevant structured-data entity may also express those facts where schema supports them.

But both renderings should derive from the same source object.

Never let schema make stronger claims than the page itself.

---

# 84. Explicit AI Crawler Policy

`User-agent: *` is usually sufficient to permit crawlers, but some organizations prefer an explicit policy.

AI/search crawler names change over time. Before production, verify current official documentation.

Possible categories include:

```txt
Live retrieval / search
Training
User-triggered fetch
```

Decide deliberately whether each category is allowed.

Do not accidentally block live retrieval if being discoverable/citable by answer engines is a business goal.

---

# 85. `llms.txt` as Optional Experimental Metadata

`llms.txt` is not a universal search standard and should not be treated as a ranking strategy.

If used, generate it automatically from site data.

Potential structure:

```txt
# Business Name

> Clear description of the company, service area, and main constraints.

## Key facts

- Fact
- Fact
- Fact

## Pages

- [Page](https://example.com/page/): concise description

## Entities

- Entity: description

## Policies

- Important sourcing/authenticity statements
```

Do not maintain it manually if the website changes frequently.

---

# 86. Citation-Ready GEO Passages

Write passages that can stand alone.

Prefer:

```txt
The system supports up to 17 users and requires no API key for the core offline workflow.
```

over:

```txt
It is highly flexible and suitable for many use cases.
```

Citation-friendly content is:

- specific
- self-contained
- checkable
- sourced
- dated when necessary
- based on first-party evidence

---

# 87. Provenance

For important facts, explain where they came from.

Examples:

```txt
Measured on our production system on 21 September 2026.
```

```txt
Vehicle delivered on 4 September 2026.
```

```txt
Pricing verified with the operator on 20 September 2026.
```

```txt
Last checked against the official timetable on 18 September 2026.
```

Provenance is especially valuable for GEO.

---

# 88. International SEO / Multilingual Architecture

For multilingual sites, use a deliberate structure.

Example:

```txt
/
 /hi/
 /de/
 /fr/
```

Only build a language version if the page actually exists in that language.

Do not create:

```txt
/de/page/
```

containing English content and advertise it as German.

---

# 89. hreflang Requirements

For multilingual pages:

- use absolute URLs
- links should be reciprocal
- include only versions that actually exist
- use `x-default` where appropriate
- keep canonical within the same language version
- reflect the same language mapping in the sitemap when useful

Example:

```html
<link rel="alternate" hreflang="en" href="https://example.com/page/">
<link rel="alternate" hreflang="hi" href="https://example.com/hi/page/">
<link rel="alternate" hreflang="x-default" href="https://example.com/page/">
```

---

# 90. Unreviewed Translation Handling

If machine translation is not ready for indexing, connect these controls to one flag:

```txt
noindex,follow
+ exclude from sitemap
+ exclude from hreflang
```

Do not advertise a translated alternate via hreflang while simultaneously telling search engines not to index it.

---

# 91. Translation Validation

For generated multilingual sites, mechanically validate:

- missing keys
- extra keys
- array lengths
- interpolation tokens
- links
- route IDs
- immutable specifications
- times/numbers that should remain unchanged

Human review is still necessary for:

- terminology
- local phrasing
- proper nouns
- cultural context

---

# 92. Sitemap Quality

Prefer useful sitemap data over decorative fields.

Generally:

- include `<loc>`
- include honest `<lastmod>`
- add hreflang alternates for multilingual sites when appropriate

Avoid relying on:

- `<priority>`
- `<changefreq>`

as meaningful ranking controls.

Keep sitemap output readable enough to debug.

---

# 93. Sitemap XSL — Optional Developer UX

An XSL stylesheet can make `sitemap.xml` human-readable in browsers.

This does not improve rankings directly.

It can improve:

- debugging
- content review
- release validation

Ensure the server uses the correct media type if implemented.

---

# 94. IndexNow — Optional

IndexNow can be useful for participating search engines.

Treat it as:

```txt
Search-engine notification
```

not a replacement for:

- sitemap
- internal linking
- Search Console
- crawlable architecture

Google Search Console remains the correct channel for Google ownership/indexing workflows.

Verify current engine support before implementation.

---

# 95. Root Domain vs Project Subpath

SEO infrastructure works best at a real domain root.

A project URL such as:

```txt
example.github.io/project/
```

creates constraints around:

- root-level `robots.txt`
- root sitemap ownership
- absolute/root-relative URLs
- canonical identity
- Search Console ownership scope
- future migration

For a serious production project, move to a real custom domain early.

---

# 96. One Canonical Host Controlled by One Config Value

Example:

```js
const site = {
  domain: "example.com"
};

site.url = `https://${site.domain}`;
```

Generate from that value:

- canonical
- `og:url`
- structured-data `@id`
- sitemap URLs
- hreflang
- `robots.txt`
- `llms.txt`
- CNAME/domain config where appropriate

A domain change should be close to a one-line configuration change.

After any host/domain change:

```txt
grep built output for old hostname
```

Expected result:

```txt
0 matches
```

---

# 97. Measure Performance Before Removing Libraries

Do not optimize by suspicion.

If scrolling is slow, measure:

- long tasks
- frame timing
- network
- script execution
- layout recalculation
- WebGL/canvas
- image decode
- third-party scripts

A visually obvious suspect may not be the actual bottleneck.

Create small performance experiments and compare.

---

# 98. Critical Rendering Path

For high-performance static sites, evaluate:

- critical CSS
- CSS size
- font origin
- font subsets
- font preloads
- LCP image preload
- third-party origins
- JS needed before interaction

Do not blindly inline huge stylesheets or preload every font.

Optimize based on actual page size and caching strategy.

---

# 99. Font Strategy

Prefer:

- self-hosting where practical
- WOFF2
- language-specific subsets
- only needed weights
- only preload fonts used above the fold

Do not preload five language fonts on every language page.

---

# 100. Responsive Image Candidate Audit

Calculate actual rendered need:

```txt
CSS width × device pixel ratio
```

Then ensure `srcset` has sensible candidates.

Example:

```html
<img
  src="/img-768.webp"
  srcset="
    /img-480.webp 480w,
    /img-768.webp 768w,
    /img-1280.webp 1280w
  "
  sizes="(max-width: 768px) 100vw, 768px"
  width="1280"
  height="800"
>
```

Do not make every phone download desktop-sized media.

---

# 101. Carousel Loading Trap

If carousel slides are stacked in the same visible area, browsers may treat multiple images as near/in viewport.

For heavy galleries:

- load first slide normally
- defer later slide `src/srcset`
- promote assets on interaction or idle
- avoid auto-advancing before initial load stabilizes

Do not let a later carousel image become the unexpected LCP.

---

# 102. Network-Aware Optional Features

A powerful device can still be on a poor connection.

For heavy **optional** experiences, consider:

```js
const connection = navigator.connection || {};

const saveData = !!connection.saveData;
const slow =
  /(^|-)2g$/.test(connection.effectiveType || "");

if (saveData || slow) {
  // Skip non-essential heavy experience
}
```

Examples:

- decorative WebGL
- auto-loaded video
- large maps
- 3D scenes

Do not gate essential content behind network APIs.

---

# 103. Lazy Third-Party Embeds

For maps/video/widgets:

```html
<iframe
  src="..."
  title="Map showing service locations"
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
  allowfullscreen
></iframe>
```

Also provide a useful non-JS/plain-link fallback where appropriate.

Benefits:

- performance
- accessibility
- crawlable contextual text
- improved privacy behavior

---

# 104. Scroll Performance

For scroll/touch listeners:

```js
addEventListener("scroll", handler, { passive: true });
```

Avoid repeatedly forcing layout inside scroll handlers with:

- `getBoundingClientRect()`
- `offsetHeight`
- `getComputedStyle()`

Prefer:

- `IntersectionObserver`
- `ResizeObserver`
- animation-frame batching

---

# 105. Accessibility Is Part of Technical Quality

Audit:

- color contrast
- heading order
- tap targets
- keyboard navigation
- focus styles
- accessible names
- iframe titles
- dialog semantics
- carousel/tab semantics
- skip link
- mobile-menu focus trapping/inert state

Example:

```css
:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}
```

---

# 106. Every Conversion CTA Should Have a Real URL

Prefer:

```html
<a href="tel:+911234567890">Call Now</a>
```

```html
<a href="https://wa.me/...">WhatsApp</a>
```

```html
<a href="mailto:hello@example.com">Email</a>
```

over JavaScript-only buttons.

Benefits:

- works if JS fails
- keyboard accessible
- long-press/open-new-tab behavior
- more resilient conversion flow

---

# 107. Security and Caching Headers

Where the host allows it, review:

```txt
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-Frame-Options: SAMEORIGIN
Strict-Transport-Security: max-age=31536000; includeSubDomains
Permissions-Policy: ...
```

Also consider a site-specific:

```txt
Content-Security-Policy
```

Do not copy a CSP blindly; it must reflect real asset/script origins.

---

# 108. Cache Strategy Must Match Filename Strategy

If assets have content hashes:

```txt
app.4f91ab.js
hero.84ccd2.webp
```

they can usually be cached much longer.

If filenames are stable:

```txt
hero.webp
```

do not use year-long immutable caching unless you have a reliable invalidation/versioning mechanism.

Possible pattern:

```txt
Cache-Control: public, max-age=604800, stale-while-revalidate=86400
```

Tune this to the host and deployment strategy.

---

# 109. Static Host Quirk Files

Some hosting platforms require special files.

Examples may include:

- `CNAME`
- `.nojekyll`
- `_headers`
- `_redirects`

Generate them as part of the build when possible.

Do not depend on a developer remembering to recreate them manually.

---

# 110. Custom 404 Page

Every site should have a useful 404 page.

Include:

- site header
- short explanation
- homepage link
- search or index link where appropriate
- important navigation
- contact CTA for commercial sites

A raw hosting-provider 404 wastes inbound traffic from stale links.

---

# 111. Trust Through Named Authorship

Where appropriate, show a real person.

For expertise-driven content:

- author name
- role
- short bio
- relevant experience
- real photo when available
- `Person` schema where appropriate

Organization can remain the publisher.

Do not invent expert identities.

---

# 112. Policy Pages Should Reflect Actual Behavior

Do not generate privacy/terms pages from a generic template and assume they are correct.

Inspect:

- cookies
- local storage
- analytics
- embedded maps
- chat widgets
- forms
- payment provider
- third-party scripts

Then write policy pages around actual behavior.

If an embed is lazy, explain when the third party is contacted.

If there are no cookies, say so only if verified.

---

# 113. Shared Policy Configuration

Where terms appear in several places:

```txt
refund window
cancellation rule
delivery rule
minimum order
support hours
```

render them from shared config.

Policy inconsistencies are both a trust problem and a potential structured-data/content mismatch.

---

# 114. Do Not Incentivize Reviews

Do not condition discounts/rewards on a positive public review.

Build legitimate review acquisition around:

- asking real customers
- neutral review requests
- post-service follow-up
- links to relevant review platforms

Keep review practices compliant with platform policies.

---

# 115. Payment / Commerce Compliance Pages

Depending on market and payment provider, onboarding may require:

- privacy policy
- terms
- refund/cancellation policy
- shipping/delivery policy
- contact page

If nothing is physically shipped, say that clearly instead of inventing courier details.

Document the real delivery method.

---

# 116. Analytics Weight Audit

Choose analytics based on business need, not popularity.

Compare:

- bundle weight
- third-party requests
- cookies
- blocking time
- privacy implications
- reporting requirements

If a lightweight analytics solution answers the needed questions, avoid unnecessary payload.

---

# 117. Ship Analytics Dark

Analytics should be disabled when no valid configuration exists.

Example:

```js
if (config.analyticsId) {
  loadAnalytics();
}
```

An unconfigured site should not request placeholder or unnecessary tracking scripts.

---

# 118. Instrument the Funnel, Not Every Click

Track meaningful events:

```txt
hero_whatsapp
sticky_call
pricing_quote
trip_builder_submit
checkout_start
lead_submit
demo_request
```

Include placement/context where useful.

Example:

```json
{
  "event": "whatsapp_click",
  "placement": "hero"
}
```

This tells you which CTA actually performs.

---

# 119. Attribution Consistency

If a campaign identifier appears in a generated enquiry message, preserve the same identifier in analytics.

Example:

```txt
utm_campaign
lead_source
campaign_code
```

This helps reconcile:

```txt
analytics event
↔ lead
↔ sale
```

---

# 120. Final Advanced Build Gate

Before launch or a major SEO deployment, run an automated gate.

## Content

- [ ] no placeholder content
- [ ] no unverified numeric claims
- [ ] no `TODO`
- [ ] no stale old-domain strings
- [ ] important facts visible in main content
- [ ] unique page intent

## Technical SEO

- [ ] canonical correct
- [ ] `og:url` matches canonical
- [ ] sitemap URLs canonical
- [ ] robots reachable
- [ ] no accidental noindex
- [ ] structured data parses
- [ ] schema uses correct entity types

## Architecture

- [ ] no important orphan pages
- [ ] no broken internal links
- [ ] no unexplained high page overlap
- [ ] hub/spoke hierarchy intact

## GEO

- [ ] important facts are self-contained
- [ ] first-party evidence present
- [ ] dates/provenance added where useful
- [ ] entity naming consistent
- [ ] optional `llms.txt` generated if intentionally used

## Multilingual

- [ ] reciprocal hreflang
- [ ] no untranslated indexed language folders
- [ ] unreviewed translations excluded consistently
- [ ] locale metadata correct

## Performance

- [ ] LCP asset optimized
- [ ] only critical assets preloaded
- [ ] no unnecessary third-party script in head
- [ ] image candidates sized correctly
- [ ] optional heavy features gated/deferred
- [ ] scroll handlers do not force layout

## Accessibility

- [ ] one H1
- [ ] no skipped heading structure where avoidable
- [ ] focus visible
- [ ] CTA links work without JS
- [ ] iframe titles
- [ ] modal/carousel semantics
- [ ] contrast checked

## Operations

- [ ] cache purged/invalidation confirmed
- [ ] production version verified
- [ ] old hostname grep = zero
- [ ] Search Console property verified
- [ ] sitemap submitted
- [ ] analytics funnel tested

---

# 121. Final Meta-Principle: Engineering Quality Is SEO Quality

The deepest reusable lesson is that modern SEO/GEO is not a separate layer added after development.

The strongest sites make SEO correctness a property of the architecture:

```txt
One source of truth
→ generated metadata
→ generated schema
→ generated sitemap
→ consistent visible content
→ automated validation
→ clean deployment
→ measurable performance
→ trustworthy evidence
```

When the architecture makes mistakes difficult to create, SEO becomes easier to maintain.

When SEO depends on manually editing dozens of unrelated fields, drift is inevitable.

