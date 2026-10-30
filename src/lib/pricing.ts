import pricing from '../data/pricing.json'
import { byCurrency } from './money'
import { counts } from './facts'

export const { hostedFee, feeBasis, gstIndia, signupUrl, aiFeatures } = pricing

/** "1% of every successful order": the fee in the owner's words. */
export const hostedFeeText = `${hostedFee} of ${feeBasis}`

/** "1% of every order", for titles and headings too short for the whole phrase. */
export const hostedFeeShort = `${hostedFee} of ${pricing.feeBasisShort}`

/** Follows the fee wherever a page speaks to stores in India: "1% of every successful order, plus 18% GST on the fee". */
export const plusGst = `plus ${gstIndia} GST on the fee`

/** ", plus 18% GST on the fee" for rupee visitors only, on a page with a currency picker. */
export const gstForRupees = byCurrency((c) => (c === 'INR' ? `, ${plusGst}` : ''))

const tokens: Record<string, string> = { hostedFeeText, hostedFeeShort, feeBasis, hostedFee, plusGst, aiFeatures, ...counts }

/** Fills {hostedFeeText}, {plusGst}, {modules}, {mcpTools} and the rest in a string, so each figure is typed once: in pricing.json, or read into facts.json. Unknown {names} are left alone. */
export const fillText = (s: string) => s.replace(/\{(\w+)\}/g, (m, k) => tokens[k] ?? m)

/** fillText over every string in a data file. */
export const fill = <T>(data: T): T => JSON.parse(fillText(JSON.stringify(data)))
