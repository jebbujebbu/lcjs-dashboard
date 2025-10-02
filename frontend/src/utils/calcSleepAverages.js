// Helper: turn minutes into span [start, end] on a fixed reference night (23:00 -> 07:00)
function buildSpansFromMinutes(stageMinutes, startHour = 23) {
  let cursor = startHour
  return Object.entries(stageMinutes).map(([stage, minutes]) => {
    const hours = minutes / 60
    const span = [cursor, cursor + hours]
    cursor += hours
    return { stage, spans: [span] }
  })
}

export default function calcSleepAverages(sleepArray) {
  console.log("calcSleepAverages called with sleepArray.length:", sleepArray.length);
  if (sleepArray.length === 0) {
    console.log("calcSleepAverages: No sleep data, returning null");
    return null;
  }

  console.log("calcSleepAverages: sleepArray[0]:", sleepArray[0]);

  // Sum minutes
  const totals = sleepArray.reduce(
    (acc, night) => {
      if (night.sleep) {
        acc.deep += night.sleep.deep?.minutes || 0
        acc.light += night.sleep.light?.minutes || 0
        acc.rem += night.sleep.rem?.minutes || 0
        acc.wake += night.sleep.wake?.minutes || 0
      }
      return acc
    },
    { deep: 0, light: 0, rem: 0, wake: 0 }
  )

  const count = sleepArray.length
  const averages = {
    deep: Math.round(totals.deep / count),
    light: Math.round(totals.light / count),
    rem: Math.round(totals.rem / count),
    // skip wake because we don’t show it in SpanChart
  }

  // Build fake spans from average minutes
  return buildSpansFromMinutes(averages)
}
