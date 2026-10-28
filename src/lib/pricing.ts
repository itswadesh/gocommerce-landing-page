import pricing from '../data/pricing.json'
import { byCurrency } from './money'

export const { hostedFee, feeBasis, gstIndia, signupUrl } = pricing

/** "1% of every successful order": the fee in the owner's words. */
export const hostedFeeText = `${hostedFee} of ${feeBasis}`

/** "1% of every order", for titles and headings too short for the whole phrase. */
export const hostedFeeShort = `${hostedFee} of ${pricing.feeBasisShort}`

/** Follows the fee wherever a page speaks to stores in India: "1% of every successful order, plus 18% GST on the fee". */
export const plusGst = `plus ${gstIndia} GST on the fee`

/** ", plus 18% GST on the fee" for rupee visitors only, on a page with a currency picker. */
export const gstForRupees = byCurrency((c) => (c === 'INR' ? `, ${plusGst}` : ''))

const tokens: Record<string, string> = { hostedFeeText, hostedFeeShort, feeBasis, hostedFee, plusGst }

/** Fills a data file's {hostedFeeText}, {feeBasis}, {plusGst} and the rest, so the figures are typed once, in pricing.json. */
export const fill = <T>(data: T): T => JSON.parse(JSON.stringify(data).replace(/\{(\w+)\}/g, (m, k) => tokens[k] ?? m))
