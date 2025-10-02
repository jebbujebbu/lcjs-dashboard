// Helper function to calculate wellness index scores
export default function calcWellnessIndex(dayData, sleepData, hourData) {
  // Sleep quality (0-100), based on sleep efficiency and stages
  const sleepQuality = sleepData ?
    Math.min(100, (sleepData.deep?.minutes || 0) * 0.5 + (sleepData.rem?.minutes || 0) * 0.6) : 0;

  // Heart Rate (0-100), based on average heart rate vs target (lower is better for resting)
  const avgHeartRate = dayData ? 
    (dayData.reduce((sum, record) => sum + (record.heart_rate || 70), 0) / dayData.length) : 70;
    const heartRateScore = Math.max(0, Math.min(100, 100 - (avgHeartRate - 60) * 2));

  // Stress Level (0-100), based on average daily stress (lower is better)
  const avgStress = hourData ? 
    (hourData.reduce((sum, record) => sum + (record.stress || 50), 0) / hourData.length) : 50;
  const stressScore = Math.max(0, Math.min(100, 100 - avgStress));

  // Activity (0-100), based on steps and calories
  const totalSteps = dayData ? 
    dayData.reduce((sum, record) => sum + (record.steps || 0), 0) : 0;
  const activityScore = Math.min(100, (totalSteps / 25000) * 100); // 25k steps = 100%
  
  return {
    sleepQuality: Math.round(sleepQuality),
    heartRate: Math.round(heartRateScore),
    stressLevel: Math.round(stressScore),
    activity: Math.round(activityScore)
  };
};