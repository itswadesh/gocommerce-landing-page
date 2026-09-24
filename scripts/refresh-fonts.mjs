// Copies the three self-hosted faces from their Fontsource packages into
// public/assets/fonts and prints the size-adjusted fallback @font-face rules
// (computed by Capsize from the fonts' own metrics) that global.css carries.
// Run after bumping a @fontsource-variable/* package; paste the printed
// overrides into global.css if they changed.
import { copyFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createFontStack } from '@capsizecss/core'

const require = createRequire(import.meta.url)
const out = new URL('../public/assets/fonts/', import.meta.url)
mkdirSync(out, { recursive: true })

const files = [
  ['@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'geist.woff2'],
  ['@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'geist-mono.woff2'],
  ['@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-normal.woff2', 'source-serif-4.woff2'],
  ['@fontsource-variable/source-serif-4/files/source-serif-4-latin-wght-italic.woff2', 'source-serif-4-italic.woff2'],
]
for (const [pkgPath, name] of files) {
  copyFileSync(require.resolve(pkgPath), new URL(name, out))
  console.log('copied', name)
}

const metrics = (name) => require(`@capsizecss/metrics/${name}`)
const stacks = [
  ['Geist', 'geist', 'arial'],
  ['Geist Mono', 'geistMono', 'courierNew'],
  ['Source Serif 4', 'sourceSerif4', 'georgia'],
]
for (const [face, primary, fallback] of stacks) {
  const { fontFaces } = createFontStack([metrics(primary), metrics(fallback)])
  console.log(`\n/* ${face} fallback */\n${fontFaces}`)
}
