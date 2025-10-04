// Helper function to convert raw temperature deviations to realistic body temperatures
export default function convertTemperatures(hour_series) { 
  // In data: "temperature": -1.74 
  const normalBodyTemp = 36.8; // Normal core body temperature

  hour_series.forEach(e => {
    // Simulate realistic body temperature (36-38°C range)
    // Convert the raw deviation to a realistic body temp variation
    let variation = (e.temperature || 0) * 0.3; // Scale down the variation
    let val = normalBodyTemp + variation; // Final temp between ~36.2-37.4°C
    // Ensure it stays within realistic bounds
    val = Math.max(35.8, Math.min(38.2, val));
    e.temperature = val
  });
}
  
  
  