/** en-IN for rupees (₹1,23,456); en-GB elsewhere, whose symbols never collide (US$, CA$, A$, SGD). Shared by the build and the fee calculator's script. */
export const formatMoney = (amount, currency) =>
  new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-GB', {
    style: 'currency', currency, minimumFractionDigits: Number.isInteger(amount) ? 0 : 2, maximumFractionDigits: 2,
  }).format(amount)
