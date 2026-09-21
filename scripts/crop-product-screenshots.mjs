/** Deterministic, lossless crops of the checked-in UI captures. No resizing,
 * sharpening, invented UI or re-capture is involved. Coordinates are pixels
 * in the original 1440 × 900 admin screenshots (not 2x, despite the old README).
 * Run with: node scripts/crop-product-screenshots.mjs
 */
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
const root = new URL('../public/assets/admin/', import.meta.url)
await mkdir(new URL('focus/', root), { recursive: true })
const crops = {
  hero: { source: 'dashboard', desktop: [244, 78, 590, 312], mobile: [252, 83, 282, 92] },
  dashboard: { desktop: [244, 18, 1180, 620], mobile: [252, 83, 282, 92] },
  products: { desktop: [244, 44, 1180, 436], mobile: [300, 44, 370, 436] },
  orders: { desktop: [244, 44, 1180, 410], mobile: [778, 44, 310, 410] },
  inventory: { desktop: [244, 137, 1180, 423], mobile: [1010, 137, 354, 423] },
}
for (const [name, crop] of Object.entries(crops)) {
  for (const theme of ['light', 'dark']) {
    for (const size of ['desktop', 'mobile']) {
      const [left, top, width, height] = crop[size]
      const file = new URL(`focus/${name}${size === 'mobile' ? '-mobile' : ''}-${theme}.webp`, root)
      await sharp(fileURLToPath(new URL(`${crop.source || name}-${theme}.webp`, root)))
        .extract({ left, top, width, height }).webp({ lossless: true }).toFile(fileURLToPath(file))
    }
  }
}
// Keep the storefront header and hero; discard blank desktop space and the
// next section on the phone. Full original viewport captures stay available.
for (const [source, name, width, height] of [
  ['storefront-home', 'storefront-desktop', 1440, 764],
  ['storefront-mobile', 'storefront-hero', 780, 1134],
]) {
  await sharp(fileURLToPath(new URL(`${source}.webp`, root)))
    .extract({ left: 0, top: 0, width, height }).webp({ lossless: true })
    .toFile(fileURLToPath(new URL(`focus/${name}.webp`, root)))
}
