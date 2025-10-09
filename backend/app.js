import express from 'express'
import cors from 'cors'
import { getMinuteSeries, getHourSeries, getDaySeries, getSleepSeries, loadJSON } from "./database/db.js"

const app = express()
const port = 5000;

app.use(cors())
app.use(express.json())

// Load data on server start
loadJSON(); 

// Basic API endpoint - returns a simple message
app.get("/api", (req, res) => {
  console.log("/api endpoint hit");
  res.json({ message: "Hello from server!" });
});

// Data API endpoint - returns minute, hour, and day series data
app.get("/api/data", (req, res) => {
  try {
    console.log("/api/data endpoint hit");
    
    const minuteData = getMinuteSeries();
    const hourData = getHourSeries();
    const dayData = getDaySeries();
    
    if (!minuteData || !hourData || !dayData) {
      console.error("No data returned from data functions");
      return res.status(500).json({ error: "No data available" });
    }
    
    const response = {
      minuteSeries: minuteData,
      hourSeries: hourData,
      daySeries: dayData
    };
    
    console.log(`Returning ${minuteData.length} minute records, ${hourData.length} hour records, ${dayData.length} day records`);
    res.json(response);
  } catch (error) {
    console.error("Error in /api/data:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).json({ error: "Internal server error: " + error.message });
  }
});

app.get("/api/sleep-data", (req, res) => {
  const sleepData = getSleepSeries()
  if (!sleepData || sleepData.length === 0) {
    return res.status(404).json({ error: "No sleep data available" })
  }
  console.log(`/api/sleep-data endpoint hit`)
  console.log(`Returning ${sleepData.length} sleep records`)
  res.json({ daySeries: sleepData })
})

// Start the server
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});