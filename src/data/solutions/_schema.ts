/**
 * One page for a kind of business: a trade, a buyer, a channel. Each JSON file
 * beside this one is a page at `path`, rendered by
 * src/components/SolutionPage.astro.
 *
 * What GoCommerce does is said once, in src/data/b2b/capabilities.json, and
 * what it does not do once, in src/data/b2b/gaps.json. A page picks the ones
 * its reader asks about and adds only what is particular to its trade, so a
 * feature described on ten pages is one line to correct.
 *
 * Written for owners and sales heads, not engineers: no file paths in the
 * body, no endpoints, no jargon a dealer would not use.
 */
import type capabilities from '../b2b/capabilities.json'
import type gaps from '../b2b/gaps.json'
import type shots from '../b2b/portal-shots.json'

export type CapabilityId = Exclude<keyof typeof capabilities, '_comment'>
export type GapId = Exclude<keyof typeof gaps, '_comment'>
export type ShotId = Exclude<keyof typeof shots, '_comment'>

export interface SolutionPage {
  /** Canonical path with trailing slash, e.g. "/solutions/dealer-portal/". */
  path: string
  /** Breadcrumb and link text, e.g. "Dealer portal". */
  label: string
  /** One line for cards that link here. */
  summary: string
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  kicker: string
  h1: string
  lede: string
  facts: { b: string; t: string }[]
  needsTitle: string
  needsLede: string
  /** What this trade asks for, and the capability that answers it. */
  needs: { need: string; does: CapabilityId; note?: string }[]
  /** Screenshots of the trade portal to show, from src/data/b2b/portal-shots.json. */
  shots?: ShotId[]
  /** Optional prose for what is particular to this trade. */
  story?: { title: string; paras: string[] }
  gapsLede: string
  /** What a buyer in this trade would ask about that is not there. */
  gaps: { id: GapId; note?: string }[]
  faq: { q: string; a: string }[]
  /** Paths of related pages on this site, rendered as cards. */
  related: string[]
  /** Facts about the trade itself, with where they came from. */
  sources?: { label: string; url: string }[]
  /** ISO date the sources were read. */
  checked?: string
}
