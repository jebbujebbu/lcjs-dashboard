// utils/toChartSpans.js
export default function toChartSpans(levels) {
  console.log(`toChartSpans, props: ${levels}`);

  if (!Array.isArray(levels) || levels.length === 0) {
    return []   // nothing to render
  }

  const stageOrder = ["light", "deep", "rem"];
  const grouped = { light: [], deep: [], rem: [] };

  // Use the first entry as reference date
  const refDate = new Date(levels[0].start);

  let prevStage = null;
  let currentSpan = null;

  levels.forEach(l => {
    if (!l || !l.stage || !l.start || !l.end) return;

    const start = parseTimeToHourFraction(l.start, refDate);
    const end = parseTimeToHourFraction(l.end, refDate);

    if (l.stage === "wake") {
      // bridge: extend previous stage to cover the gap, if any
      if (currentSpan) {
        currentSpan[1] = end; // stretch end to after wake
      }
      return;
    }

    if (l.stage === prevStage && currentSpan) {
      // same stage continues -> merge into previous span
      currentSpan[1] = end;
    } else {
      // push new span
      currentSpan = [start, end];
      grouped[l.stage].push(currentSpan);
    }

    prevStage = l.stage;
  });

  return stageOrder.map(stage => ({ stage, spans: grouped[stage] }));
}

function parseTimeToHourFraction(timeStr, referenceDate) {
  if (!timeStr) return 0;
  const d = new Date(timeStr);

  // Absolute hour of the day
  let hours = d.getHours() + d.getMinutes() / 60;

  // Add day offset (0 for same day, 24 if next day, etc.)
  const dayOffset = Math.floor((d - referenceDate) / (1000 * 60 * 60 * 24));
  hours += dayOffset * 24;

  // Align to chart axis: keep values in [20, 32]
  if (hours < 20) {
    hours += 24; // e.g. 00:30 → 24.5
  }

  return hours;
}
