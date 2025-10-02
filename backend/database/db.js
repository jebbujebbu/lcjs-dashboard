import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// let db = []
let perMinute = []
let perHour = []
let perDay = []
let perSleepDay = [] 

// Load data from simulated database
export function loadJSON() {
  console.log("Loading data...");
  let jsonFile = path.join(__dirname, "minute_series.json")
  let fileContent = fs.readFileSync(jsonFile, 'utf8');
  perMinute = JSON.parse(fileContent);

  jsonFile = path.join(__dirname, "hour_series.json")
  fileContent = fs.readFileSync(jsonFile, 'utf8');
  perHour = JSON.parse(fileContent);

  jsonFile = path.join(__dirname, "day_series.json")
  fileContent = fs.readFileSync(jsonFile, 'utf8');
  perDay = JSON.parse(fileContent);

  jsonFile = path.join(__dirname, "day_series_sleep.json")
  if (fs.existsSync(jsonFile)) {
    fileContent = fs.readFileSync(jsonFile, "utf8")
    perSleepDay = JSON.parse(fileContent)
  } else {
    console.warn("day_series_sleep.json not found, skipping")
    perSleepDay = []
  }
  console.log(`Loaded data`);
}

// Get the loaded data
// export function getData() {
//   return db
// }

export function getMinuteSeries() {
  return perMinute
}

export function getHourSeries() {
  return perHour
}

export function getDaySeries() {
  return perDay
}

export function getSleepSeries() {
  return perSleepDay
}