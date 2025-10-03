export default function calcSleepAverages(sleepArray) {
  console.log("calcSleepAverages called with sleepArray.length:", sleepArray.length)
  if (sleepArray.length === 0) {
    console.log("calcSleepAverages: No sleep data, returning []")
    return []
  }

  console.log("calcSleepAverages: sleepArray[0]:", sleepArray[0])

  // Sum minutes
  const totals = sleepArray.reduce(
    (acc, night) => {
      if (night.sleep) {
        acc.deep += night.sleep.deep?.minutes || 0
        acc.light += night.sleep.light?.minutes || 0
        acc.rem += night.sleep.rem?.minutes || 0
        // ignore wake
      }
      return acc
    },
    { deep: 0, light: 0, rem: 0 }
  )

  const count = sleepArray.length

  // Average minutes
  const averages = {
    deep: Math.round(totals.deep / count),
    light: Math.round(totals.light / count),
    rem: Math.round(totals.rem / count)
  }

  // Convert to PieChart format
  return [
    { name: "Deep", value: averages.deep },
    { name: "Light", value: averages.light },
    { name: "REM", value: averages.rem }
  ]
}
