// llms.txt, with its figures filled from pricing.json and facts.json at
// build time, so the summary for AI crawlers never states an old count.
import text from '../data/llms.txt?raw'
import { fillText } from '../lib/pricing'

export const GET = () => new Response(fillText(text), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
