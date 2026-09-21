# Screenshot and visual guidance

This implementation follows the latest visual guidance in the KitCommerce
positioning conversation: real UI, tight crops, consistent frames, readable
sizes, SVG architecture diagrams, and a compact developer-focused homepage.

## Source and treatment

- The originals in `public/assets/admin/` are the repository's real GoCommerce
  seeded-store and Arialshop captures. They are not mock UI or generated art.
- The admin originals are **1440 × 900 pixels**; the mobile storefront is
  **780 × 1688 pixels**. Preserve them. The old README's 2x statement did not
  match the dimensions of the checked-in admin assets.
- `scripts/crop-product-screenshots.mjs` extracts pixels without resizing,
  filtering, sharpening or adding detail. Derived WebPs use lossless encoding
  to avoid another lossy compression pass. Run the script after `npm ci`.
- Each admin crop removes the sidebar and irrelevant rows. Mobile/tablet crops
  focus on one readable detail: revenue, names/slugs, payment/fulfillment
  states, or inventory quantities. Captions explain exactly what is visible.
- Both color schemes use matching crops. At widths up to 900px, `<picture>`
  serves the focused small-screen source. Intrinsic dimensions reserve space;
  crops never render wider than their source. The full screenshots remain one
  link away. Full-size links intentionally open the light original in a new tab.
- Keep complete table rows and column headings at crop boundaries. Do not
  stretch a screenshot into a fixed-height frame, blur the UI, or invent data.
- A browser frame uses the same bar height, border, radius and metadata across
  the hero, gallery and storefront. The mobile storefront gets one simple
  phone frame, without overlays hiding its content.
- Only the hero admin image receives high fetch priority. The first admin tab
  loads eagerly; other tabs retain the existing eager-on-selection behavior.

## Homepage composition

- Put real admin and storefront proof directly after the opening copy and CTAs.
- Show the Docker command as selectable text with a link to prerequisites.
  Do not imply that running it automatically connects the two projects.
- Label seeded demo data and the production storefront separately. Keep the
  unpublished connector caveat beside the composite and architecture diagrams.
- Use SVG for the headless contract and default deployment stack, with real
  text, accessible titles/descriptions and the site's color variables.
- Keep the existing typography, palette, navigation, project chooser and
  supporting sections. Consolidate the duplicate architecture diagram and
  repeated logo strip; keep marketplace and B2B as short solution links.

## Review checklist

- Inspect the initial view, complete homepage, four admin tabs, storefront,
  stack/headless diagrams, navigation and FAQ at desktop and mobile widths.
- Check light/dark themes at 1440px and 390px; check tablet (768px), narrow
  mobile (320px), and the crop breakpoint (900/901px).
- Verify complete rows, readable crops, correct source selection, intrinsic
  aspect ratios, no upscaling, no horizontal page overflow and no broken images.
- Click all four tabs, then test Arrow keys, Home and End. Follow a full-size
  image link. Copy the setup command and compare clipboard text.
- Exercise mobile navigation, anchor links and an expanded FAQ.
- Check two fallback cases: JavaScript disabled, and normal motion (including
  scrolling), alongside reduced motion. Default screenshot remains visible
  without JavaScript; interactive tab switching requires the existing script.
- Run `npm run build`, `npm run verify` and `git diff --check`.

No new screenshot captures claim a currently authenticated admin session or a
new live Arialshop visit. Provenance comes from the repository's existing
captures and README; this work refines their presentation.
