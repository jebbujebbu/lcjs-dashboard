// Helper function to calculate activity score 
export default function calculateActivityScore(calories, steps){
  const activityPoints = (calories * 0.1) + (steps * 0.005);
  if (activityPoints < 8) return 'low';      // Adjusted for typical resting metabolism
  if (activityPoints < 12) return 'medium';  // Adjusted for light activity
  return 'high';
};