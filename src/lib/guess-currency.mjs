/**
 * The visitor's likely currency from the time zone, then the browser language.
 * Base.astro inlines this function's source into the head, so it must stay
 * self-contained ES5. scripts/check-currency.mjs holds its cases.
 */
export function guessCurrency(zone, language) {
  var z = zone || ''
  var l = language || ''
  if (/^Asia\/(Kolkata|Calcutta)$/.test(z)) return 'INR'
  if (z === 'Asia/Dubai') return 'AED'
  if (z === 'Asia/Singapore') return 'SGD'
  if (/^Australia\//.test(z)) return 'AUD'
  if (/^Europe\/(London|Belfast|Guernsey|Jersey|Isle_of_Man)$/.test(z)) return 'GBP'
  if (/^Europe\//.test(z)) return 'EUR'
  if (/^America\/(Toronto|Montreal|Vancouver|Edmonton|Winnipeg|Regina|Halifax|St_Johns|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Swift_Current|Dawson_Creek|Atikokan)$/.test(z)) return 'CAD'
  if (/^America\//.test(z) || z === 'Pacific/Honolulu') return 'USD'
  var region = (l.split('-')[1] || '').toUpperCase()
  var byRegion = { IN: 'INR', US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', SG: 'SGD', AE: 'AED' }
  if (byRegion[region]) return byRegion[region]
  if (/^(AT|BE|CY|DE|EE|ES|FI|FR|GR|HR|IE|IT|LT|LU|LV|MT|NL|PT|SI|SK)$/.test(region)) return 'EUR'
  if (/^(hi|bn|ta|te|mr|gu|kn|ml|pa|or|as)\b/i.test(l)) return 'INR'
  return 'USD'
}
