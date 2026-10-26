/**
 * The fee calculator's arithmetic, shared by the build (which renders the
 * default figures into the HTML) and the page's script (which redoes them as
 * the visitor types). Platform charges only: payment gateway charges and tax
 * are left out on both sides.
 *
 * market: { payments, plans: [{ name, monthly, yearly, fee }] }, fee in percent.
 * input:  { sales, prepaid (percent of sales paid online), billing, via }.
 */
const cents = (n) => Math.round(n * 100) / 100

export function monthlyCosts(market, input, hostedRate) {
  // Shopify waives its fee only on orders Shopify Payments takes, and never on
  // cash on delivery. Where Shopify Payments is not offered, every prepaid
  // order pays it.
  const feeApplies = !(market.payments && input.via === 'shopify')
  const prepaid = (input.sales * input.prepaid) / 100
  const shopify = market.plans.map((p) => {
    const plan = input.billing === 'monthly' ? p.monthly : p.yearly
    const fee = feeApplies ? cents((prepaid * p.fee) / 100) : 0
    return { name: p.name, plan, fee, total: cents(plan + fee) }
  })
  const hosted = cents((input.sales * hostedRate) / 100)
  const cheapest = shopify.reduce((a, b) => (b.total < a.total ? b : a))
  return { hosted, shopify, cheapest, saving: cents(cheapest.total - hosted) }
}

/** The one-sentence answer under the table; `money` formats an amount in the market's currency. */
export function verdict(r, money) {
  if (r.saving > 0) return `On these figures a store hosted on kitcommerce.store pays ${money(r.saving)} a month less than Shopify ${r.cheapest.name}, the cheapest Shopify plan here.`
  if (r.saving < 0) return `On these figures Shopify ${r.cheapest.name} costs ${money(-r.saving)} a month less than a store hosted on kitcommerce.store.`
  return `On these figures Shopify ${r.cheapest.name} and a store hosted on kitcommerce.store cost the same.`
}
