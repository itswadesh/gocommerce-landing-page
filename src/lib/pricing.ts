import pricing from '../data/pricing.json'

export const { hostedFee, signupUrl } = pricing

/** Fills {hostedFee} in a data file's strings, so the figure is typed once, in pricing.json. */
export const fill = <T>(data: T): T => JSON.parse(JSON.stringify(data).replaceAll('{hostedFee}', hostedFee))
