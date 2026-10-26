import assert from 'node:assert/strict'
import { guessCurrency } from '../src/lib/guess-currency.mjs'

const cases = [
  ['Asia/Kolkata', 'en-US', 'INR'],
  ['Asia/Calcutta', '', 'INR'],
  ['Asia/Dubai', 'en-US', 'AED'],
  ['Asia/Singapore', 'en-GB', 'SGD'],
  ['Australia/Sydney', 'en-US', 'AUD'],
  ['Europe/London', 'en-US', 'GBP'],
  ['Europe/Berlin', 'en-GB', 'EUR'],
  ['America/Toronto', 'en-US', 'CAD'],
  ['America/New_York', 'en-GB', 'USD'],
  ['Asia/Tokyo', 'en-IN', 'INR'],
  ['Asia/Tokyo', 'de-DE', 'EUR'],
  ['Asia/Tokyo', 'hi', 'INR'],
  ['Asia/Tokyo', 'ja-JP', 'USD'],
  ['', '', 'USD'],
]
for (const [zone, lang, want] of cases) assert.equal(guessCurrency(zone, lang), want, `${zone} ${lang}`)
console.log(`Currency guess holds for ${cases.length} cases.`)

