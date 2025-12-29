import type { MiniappManifest } from './types'

const WEIGHT_STEP = 15
const DAY_MS = 24 * 60 * 60 * 1000

function getUtcDayIndex(date: Date): number {
  return Math.floor(date.getTime() / DAY_MS)
}

/**
 * Date-based dynamic weight for official/community scores.
 *
 * Cycles daily by +15 mod 100:
 * 15,30,45,60,75,90,5,20,35,...
 */
export function getOfficialWeightPct(date: Date = new Date()): number {
  const dayIndex = getUtcDayIndex(date)
  return (WEIGHT_STEP * (dayIndex + 1)) % 100
}

export function getCommunityWeightPct(date: Date = new Date()): number {
  return 100 - getOfficialWeightPct(date)
}

export function computeFeaturedScore(app: Pick<MiniappManifest, 'officialScore' | 'communityScore'>, date: Date = new Date()): number {
  const official = typeof app.officialScore === 'number' ? app.officialScore : 0
  const community = typeof app.communityScore === 'number' ? app.communityScore : 0
  const ow = getOfficialWeightPct(date)
  const cw = 100 - ow
  return (official * ow + community * cw) / 100
}

