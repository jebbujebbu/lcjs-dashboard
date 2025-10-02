// utils/getInitialData.js
import calcActivityScore from './calcActivityScore.js';
import calcSleepAverages from './calcSleepAverages.js';
import calcWellnessIndex from './calcWellnessIndex.js';

// Now accepts sleepSeries separately
export default function getInitialData(minuteSeries, hourSeries, daySeries, sleepSeries) {
  const lastDate = "2022-01-21";

  // ---- Sleep data (from daySeries) ----
  const lastSleep = daySeries.find(day => day.date === lastDate);
  const currentStages = lastSleep?.sleep?.levels || [];

  // Get last 7 nights of sleep
  const lastDayDate = new Date(lastDate + 'T00:00:00Z');
  const sevenDaysAgo = new Date(lastDayDate.getTime() - (6 * 24 * 60 * 60 * 1000));

  const last7Nights = (sleepSeries || []).filter(day => {
    const d = new Date(day.date + 'T00:00:00Z');
    return d >= sevenDaysAgo && d <= lastDayDate && day.sleep;
  });

  // console.log("getInitialData: lastDate:", lastDate);
  // console.log("getInitialData: sevenDaysAgo:", sevenDaysAgo.toISOString());
  // console.log("getInitialData: lastDayDate:", lastDayDate.toISOString());
  // console.log("getInitialData: sleepSeries.length:", sleepSeries?.length);
  // console.log("getInitialData: first few sleepSeries dates:", sleepSeries?.slice(0, 5).map(s => s.date));
  // console.log("getInitialData: last few sleepSeries dates:", sleepSeries?.slice(-5).map(s => s.date));
  // console.log("getInitialData: last7Nights.length:", last7Nights.length);

  const avgStages = calcSleepAverages(last7Nights);

  // ---- Activity data (from daySeries + minuteSeries) ----
  const last7Days = daySeries.filter(day => {
    const d = new Date(day.date + 'T00:00:00Z');
    return d >= sevenDaysAgo && d <= lastDayDate;
  });

  const last7DaysMinuteData = minuteSeries.filter(record => {
    const recordDate = record.timestamp.split('T')[0];
    return last7Days.some(day => day.date === recordDate);
  });

  const dailyHourlyTotals = {};
  last7DaysMinuteData.forEach(record => {
    const day = record.timestamp.split('T')[0];
    const hour = parseInt(record.timestamp.slice(11, 13));

    if (!dailyHourlyTotals[day]) dailyHourlyTotals[day] = {};
    if (!dailyHourlyTotals[day][hour]) dailyHourlyTotals[day][hour] = { calories: 0, steps: 0 };

    dailyHourlyTotals[day][hour].calories += record.calories || 0;
    dailyHourlyTotals[day][hour].steps += record.steps || 0;
  });

  const activity = Object.entries(dailyHourlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, hourlyTotals]) => {
      const hourlyScores = { low: 0, medium: 0, high: 0 };
      const totalHours = Object.keys(hourlyTotals).length;

      Object.values(hourlyTotals).forEach(hourData => {
        const score = calcActivityScore(hourData.calories, hourData.steps);
        hourlyScores[score]++;
      });

      return {
        date,
        low: Math.round((hourlyScores.low / totalHours) * 100),
        medium: Math.round((hourlyScores.medium / totalHours) * 100),
        high: Math.round((hourlyScores.high / totalHours) * 100),
        totalHours
      };
    });

  // ---- Wellness index ----
  const lastDayMinuteData = minuteSeries.filter(record =>
    record?.timestamp && record.timestamp.startsWith(lastDate)
  );
  const lastDayHourData = hourSeries.filter(record =>
    record?.timestamp && record.timestamp.startsWith(lastDate)
  );

  const wellness = calcWellnessIndex(
    lastDayMinuteData,
    currentStages,
    lastDayHourData
  );

  return {
    currentStages,
    avgStages,
    activity,
    wellness
  };
}
