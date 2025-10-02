export default function getSleepStages(allData, currentTimestamp, userId) {
  // Only keep sleep entries
  const sleeps = allData.filter(
    (entry) => entry.userId === userId && entry.type === "stages"
  )

  if (sleeps.length === 0) return []

  // Find the most recent sleep that ended before "currentTimestamp"
  const now = new Date(currentTimestamp)
  const lastSleep = sleeps
    .map((s) => ({
      ...s,
      end: new Date(s.endTime)
    }))
    .filter((s) => s.end <= now)
    .sort((a, b) => b.end - a.end)[0]

  if (!lastSleep) return []

  // Flatten to a span-friendly format
  return lastSleep.data.map((d) => {
    const start = new Date(d.dateTime)
    const end = new Date(start.getTime() + d.seconds * 1000)
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      level: d.level
    }
  })
}
