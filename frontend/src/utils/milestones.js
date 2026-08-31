export const MILESTONE_THRESHOLDS = {
  Seedling: { lower: 0, upper: 500 },
  Garden: { lower: 500, upper: 1250 },
  Habitat: { lower: 1250, upper: 2500 },
  Sanctuary: { lower: 2500, upper: 2500 },
}

const normalizeMilestone = (milestone) => {
  if (!milestone) return 'Seedling'
  return String(milestone).trim()
}

export function getProgressToNextMilestone(milestone, points) {
  const normalizedMilestone = normalizeMilestone(milestone)
  const threshold = MILESTONE_THRESHOLDS[normalizedMilestone]

  if (!threshold) {
    return {
      percent: 0,
      pointsToNext: 0,
      isMaxTier: false,
    }
  }

  if (normalizedMilestone === 'Sanctuary') {
    return {
      percent: 100,
      pointsToNext: 0,
      isMaxTier: true,
    }
  }

  const safePoints = Number(points) || 0
  const lower = threshold.lower
  const upper = threshold.upper
  const range = upper - lower

  if (range <= 0) {
    return {
      percent: 100,
      pointsToNext: 0,
      isMaxTier: true,
    }
  }

  const clampedPoints = Math.min(Math.max(safePoints - lower, 0), range)
  const percent = (clampedPoints / range) * 100

  return {
    percent: Math.min(Math.max(percent, 0), 100),
    pointsToNext: Math.max(upper - safePoints, 0),
    isMaxTier: false,
  }
}
