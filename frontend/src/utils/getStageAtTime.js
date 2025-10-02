export default function getStageAtTime(levels, timeStr) {
  const t = new Date(timeStr).getTime()
  const entry = levels.find(l => {
    return new Date(l.start).getTime() <= t && t < new Date(l.end).getTime()
  })
  return entry ? entry.stage : "unknown"
}
