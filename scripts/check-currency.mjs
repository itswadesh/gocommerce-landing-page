import assert from 'node:assert/strict'
import { guessCurrency } from '../src/lib/guess-currency.mjs'
import { monthlyCosts, totalText, verdict } from '../src/lib/fees.mjs'
import { formatMoney } from '../src/lib/format-money.mjs'

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

const india = { payments: false, plans: [{ name: 'Basic', monthly: 1994, yearly: 1499, fee: 2 }, { name: 'Grow', monthly: 7447, yearly: 5599, fee: 1 }, { name: 'Advanced', monthly: 30164, yearly: 22680, fee: 0.6 }] }
const lakh = monthlyCosts(india, { sales: 100000, prepaid: 60, billing: 'yearly', via: 'shopify' }, 1)
assert.deepEqual(lakh.shopify.map((p) => p.total), [2699, 6199, 23040], 'India has no Shopify Payments, so the fee applies to prepaid orders')
assert.equal(lakh.hosted.total, 1000)
assert.equal(lakh.saving, 1699)
const us = { payments: true, plans: [{ name: 'Basic', monthly: 39, yearly: 29, fee: 2 }, { name: 'Grow', monthly: 105, yearly: 79, fee: 1 }, { name: 'Advanced', monthly: 399, yearly: 299, fee: 0.6 }] }
assert.equal(monthlyCosts(us, { sales: 10000, prepaid: 100, billing: 'monthly', via: 'shopify' }, 1).saving, -61, 'Shopify Payments waives the fee')
assert.deepEqual(monthlyCosts(us, { sales: 10000, prepaid: 100, billing: 'monthly', via: 'other' }, 1).shopify.map((p) => p.total), [239, 205, 459])
const inr = (n) => formatMoney(n, 'INR')
const gst = monthlyCosts(india, { sales: 100000, prepaid: 60, billing: 'yearly', via: 'shopify' }, 1, 18)
assert.equal(totalText(gst.hosted, inr), '₹1,000 + ₹180 GST', 'GST is added to the hosted fee in India')
assert.deepEqual(gst.shopify.map((p) => p.total), [3184.82, 7314.82, 27187.2], 'and to Shopify’s plan and fee, so both sides compare with GST')
assert.equal(gst.saving, 2004.82)
assert.match(verdict(gst, inr), /₹2,004\.82 a month less than Shopify Basic.*GST included on both sides\.$/)
assert.equal(totalText(lakh.hosted, inr), '₹1,000', 'no GST line where no rate is given')
console.log('Fee arithmetic holds.')
