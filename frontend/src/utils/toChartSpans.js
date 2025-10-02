// utils/toChartSpans.js
export default function toChartSpans(levels) {
  if (!Array.isArray(levels) || levels.length === 0) {
    return []   // nothing to render
  }

  const stageOrder = ["light", "deep", "rem"]   // only stages we want in chart
  const grouped = { light: [], deep: [], rem: [] }

  // Use the first entry as reference date
  const refDate = new Date(levels[0].start)

  levels
    .filter(l => l && l.stage && l.start && l.end && l.stage !== "wake") // skip invalid + wake
    .forEach(l => {
      grouped[l.stage].push([
        parseTimeToHourFraction(l.start, refDate),
        parseTimeToHourFraction(l.end, refDate),
      ])
    })

  return stageOrder.map(stage => ({ stage, spans: grouped[stage] }))
}

function parseTimeToHourFraction(timeStr, referenceDate) {
  if (!timeStr) return 0
  const d = new Date(timeStr)

  // Absolute hour of the day
  let hours = d.getHours() + d.getMinutes() / 60

  // Add day offset (0 for same day, 24 if next day, etc.)
  const dayOffset = Math.floor((d - referenceDate) / (1000 * 60 * 60 * 24))
  hours += dayOffset * 24

  // Align to chart axis: keep values in [20, 32]
  if (hours < 20) {
    hours += 24 // e.g. 00:30 → 24.5
  }

  return hours
}
