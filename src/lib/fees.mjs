/**
 * The fee calculator's arithmetic, shared by the build (which renders the
 * default figures into the HTML) and the page's script (which redoes them as
 * the visitor types). Platform charges only: payment gateway charges are left
 * out on both sides. Where `gstRate` is set (India), GST is added to both
 * sides at that rate, since kitcommerce.store and Shopify both charge it on
 * their fees to Indian stores.
 *
 * market: { payments, plans: [{ name, monthly, yearly, fee }] }, fee in percent.
 * input:  { sales, prepaid (percent of sales paid online), billing, via }.
 */
const cents = (n) => Math.round(n * 100) / 100
const withGst = (net, gstRate) => {
  const gst = cents((net * gstRate) / 100)
  return { net, gst, total: cents(net + gst) }
}

export function monthlyCosts(market, input, hostedRate, gstRate = 0) {
  // Shopify waives its fee only on orders Shopify Payments takes, and never on
  // cash on delivery. Where Shopify Payments is not offered, every prepaid
  // order pays it.
  const feeApplies = !(market.payments && input.via === 'shopify')
  const prepaid = (input.sales * input.prepaid) / 100
  const shopify = market.plans.map((p) => {
    const plan = input.billing === 'monthly' ? p.monthly : p.yearly
    const fee = feeApplies ? cents((prepaid * p.fee) / 100) : 0
    return { name: p.name, plan, fee, ...withGst(cents(plan + fee), gstRate) }
  })
  const hosted = withGst(cents((input.sales * hostedRate) / 100), gstRate)
  const cheapest = shopify.reduce((a, b) => (b.total < a.total ? b : a))
  return { hosted, shopify, cheapest, saving: cents(cheapest.total - hosted.total), gst: gstRate > 0 }
}

/** A row's month, as "₹1,000 + ₹180 GST" where GST is added. */
export const totalText = (row, money) => (row.gst > 0 ? `${money(row.net)} + ${money(row.gst)} GST` : money(row.net))

/** The one-sentence answer under the table; `money` formats an amount in the market's currency. */
export function verdict(r, money) {
  const gst = r.gst ? ', GST included on both sides' : ''
  if (r.saving > 0) return `On these figures a store hosted on kitcommerce.store pays ${money(r.saving)} a month less than Shopify ${r.cheapest.name}, the cheapest Shopify plan here${gst}.`
  if (r.saving < 0) return `On these figures Shopify ${r.cheapest.name} costs ${money(-r.saving)} a month less than a store hosted on kitcommerce.store${gst}.`
  return `On these figures Shopify ${r.cheapest.name} and a store hosted on kitcommerce.store cost the same${gst}.`
}
