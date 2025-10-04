// Helper function to calculate wellness index scores
export default function calcWellnessIndex(minuteData, hourData, sleepData) {
  // Sleep quality (0-100), based on sleep stages duration
  let sleepQuality = 0;
  if (sleepData?.levels) {
    const totalSleepMinutes = sleepData.levels.reduce((total, level) => {
      const start = new Date(level.start);
      const end = new Date(level.end);
      const minutes = (end - start) / (1000 * 60);
      return total + minutes;
    }, 0);
    
    const deepSleepMinutes = sleepData.levels
      .filter(level => level.stage === 'deep')
      .reduce((total, level) => {
        const start = new Date(level.start);
        const end = new Date(level.end);
        return total + (end - start) / (1000 * 60);
      }, 0);
    
    const remSleepMinutes = sleepData.levels
      .filter(level => level.stage === 'rem')
      .reduce((total, level) => {
        const start = new Date(level.start);
        const end = new Date(level.end);
        return total + (end - start) / (1000 * 60);
      }, 0);
    
    // Calculate sleep quality based on deep and REM sleep percentages
    const deepPercentage = (deepSleepMinutes / totalSleepMinutes) * 100;
    const remPercentage = (remSleepMinutes / totalSleepMinutes) * 100;
    sleepQuality = Math.min(100, (deepPercentage * 1.5) + (remPercentage * 1.2));
  }

  // Heart Rate (0-100), based on average heart rate from minute data
  const validHeartRateRecords = minuteData ? 
    minuteData.filter(record => record.heart_rate && record.heart_rate > 0) : [];
  const avgHeartRate = validHeartRateRecords.length > 0 ? 
    (validHeartRateRecords.reduce((sum, record) => sum + record.heart_rate, 0) / validHeartRateRecords.length) : 70;
  
  // Score heart rate (ideal resting HR around 60-70)
  const heartRateScore = Math.max(0, Math.min(100, 100 - Math.abs(avgHeartRate - 65) * 2));

  // Stress Level (0-100), based on average stress from hour data
  const validStressRecords = hourData ? 
    hourData.filter(record => record.stress !== undefined && record.stress !== null) : [];
  const avgStress = validStressRecords.length > 0 ? 
    (validStressRecords.reduce((sum, record) => sum + record.stress, 0) / validStressRecords.length) : 50;
  const stressScore = Math.max(0, Math.min(100, 100 - avgStress));

  // Activity (0-100), based on total steps from minute data
  const validStepsRecords = minuteData ? 
    minuteData.filter(record => record.steps && record.steps >= 0) : [];
  const totalSteps = validStepsRecords.length > 0 ? 
    validStepsRecords.reduce((sum, record) => sum + record.steps, 0) : 0;
  const activityScore = Math.min(100, (totalSteps / 10000) * 100); // 10k steps = 100%
  
  return {
    sleepQuality: Math.round(sleepQuality),
    heartRate: Math.round(heartRateScore),
    stressLevel: Math.round(stressScore),
    activity: Math.round(activityScore)
  };
};