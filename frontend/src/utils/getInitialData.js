import calcSleepAverages from './calcSleepAverages.js';
import calcWellnessIndex from './calcWellnessIndex.js';

// Helper function to get initial data for dashboard display
export default function getInitialData(minuteSeries, hourSeries, daySeries, sleepSeries) {
  const lastDate = "2022-01-21";

  // Sleep data (from daySeries)
  const lastSleep = daySeries.find(day => day.date === lastDate);
  const currentStages = lastSleep?.sleep?.levels || [];

  // Last 7 nights of sleep
  const lastDayDate = new Date(lastDate + 'T00:00:00Z');
  const sevenDaysAgo = new Date(lastDayDate.getTime() - (6 * 24 * 60 * 60 * 1000));

  const last7Nights = (sleepSeries || []).filter(day => {
    const d = new Date(day.date + 'T00:00:00Z');
    return d >= sevenDaysAgo && d <= lastDayDate && day.sleep;
  });

  const avgStages = calcSleepAverages(last7Nights);

  // Wellness index
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
    wellness
  };
}
