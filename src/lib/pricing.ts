import pricing from '../data/pricing.json'
import { byCurrency } from './money'

export const { hostedFee, gstIndia, signupUrl } = pricing

/** Follows the fee wherever a page speaks to stores in India: "1% of each successful sale, plus 18% GST on the fee". */
export const plusGst = `plus ${gstIndia} GST on the fee`

/** ", plus 18% GST on the fee" for rupee visitors only, on a page with a currency picker. */
export const gstForRupees = byCurrency((c) => (c === 'INR' ? `, ${plusGst}` : ''))

/** Fills {hostedFee} and {plusGst} in a data file's strings, so the figures are typed once, in pricing.json. */
export const fill = <T>(data: T): T => JSON.parse(JSON.stringify(data).replaceAll('{hostedFee}', hostedFee).replaceAll('{plusGst}', plusGst))
