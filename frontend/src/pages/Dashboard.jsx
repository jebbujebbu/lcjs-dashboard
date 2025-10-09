import { React, useEffect, useState, useRef } from 'react';
import '../styles/Dashboard.css';
import MultiChart from '../components/MultiChart.jsx';
import GaugeChart from '../components/charts/GaugeChart.jsx';
import BarChart from '../components/charts/BarChart.jsx'; 
import PieChart from '../components/charts/PieChart.jsx'; 
import SpanChart from '../components/charts/SpanChart.jsx'; 
import SpiderChart from '../components/charts/SpiderChart.jsx'; 
import MosaicChart from '../components/charts/MosaicChart.jsx'; 
import convertTemperatures from '../utils/convertTemperatures.js';
import calcActivityScore from '../utils/calcActivityScore.js';
import getLast7Days from '../utils/getLast7Days.js';
import calcSleepAverages from '../utils/calcSleepAverages.js';
import calcWellnessIndex from '../utils/calcWellnessIndex.js';
import getInitialData from '../utils/getInitialData.js';
import toChartSpans from '../utils/toChartSpans.js';

const Dashboard = () => {
  const [minuteSeries, setMinuteSeries] = useState([]);
  const [hourSeries, setHourSeries] = useState([]);
  const [daySeries, setDaySeries] = useState([]);
  const [sleepSeries, setSleepSeries] = useState([]);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [dailySteps, setDailySteps] = useState(0);
  const [currentStages, setCurrentStages] = useState(null);
  const [avgStages, setAvgStages] = useState(null);
  const minuteIndexRef = useRef(0);
  const hourIndexRef = useRef(0);
  const [activity, setActivity] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [currentDataPoint, setCurrentDataPoint] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(16);
  const [isSimulationRunning, setIsSimulationRunning] = useState(true);

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'No Data';
    
    const dateStr = timestamp.slice(0, 10); 
    const timeStr = timestamp.slice(11, 19); 
    const [year, month, day] = dateStr.split('-');
    
    return `${month}/${day}/${year} ${timeStr}`;
  };

  // Fetch data on component mount
  useEffect(() => { 
    const controller = new AbortController();

    Promise.all([
      fetch("/api/data", { signal: controller.signal }).then(r => r.json()),
      fetch("/api/sleep-data", { signal: controller.signal }).then((r) => r.json())
    ])
    .then(([data, sleepData]) => {
      if (!data || !sleepData) return;

      // Convert temperature deviation values to absolute temperature values
      convertTemperatures(data.hourSeries);
    
      // Update state with the fetched data
      setMinuteSeries(data.minuteSeries || []);
      setHourSeries(data.hourSeries || []);
      setDaySeries(data.daySeries || []);
      setSleepSeries(sleepData.daySeries || []);
      
      // Initialize charts with data from the last 7 days of data set (ending 2022-01-21)
      const initialData = getInitialData(data.minuteSeries, data.hourSeries, data.daySeries, sleepData.daySeries);
      setCurrentStages(toChartSpans(initialData.currentStages));
      setAvgStages(initialData.avgStages);
      setWellness(initialData.wellness);
    })
    .catch((err) => {
      if (err.name === "AbortError") {
        console.log("Fetch aborted");
      } else {
        console.error("Error fetching data:", err);
      }
    });

    return () => {
      controller.abort();
    };
  }, []);


  // Main simulation loop
  useEffect(() => {
    if (minuteSeries.length === 0 || hourSeries.length === 0 || daySeries.length === 0 || !isSimulationRunning) {
      console.log("Waiting for data or simulation paused...");
      return;
    }

    const interval = setInterval(() => {
      // Update minute data every cycle
    const currentMinuteData = minuteSeries[minuteIndexRef.current];

    if (!currentMinuteData?.timestamp) {
      minuteIndexRef.current = (minuteIndexRef.current + 1) % minuteSeries.length;
      return;
    }

    const currentTime = currentMinuteData.timestamp;
    const date = currentTime.split('T')[0];
    const hour =  parseInt(currentTime.slice(11, 13));
    const minute = parseInt(currentTime.slice(14, 16));

    // Check if hour changed, update hourSeries data
    if (minute === 0) {
      let nextHourIndex = (hourIndexRef.current + 1) % hourSeries.length;
      const currentHourData = hourSeries[nextHourIndex];

      // Merge minute and hour data
      const combinedData = {
        ...currentMinuteData,
        stress: currentHourData?.stress,
        temperature: currentHourData?.temperature,
        steps: dailySteps + (currentMinuteData.steps || 0)            
      };

      setCurrentDataPoint(combinedData);
      hourIndexRef.current = nextHourIndex;
    } else {
      // Just update with minute data + accumulated steps
      const updatedData = {
        ...currentMinuteData,
        steps: dailySteps + (currentMinuteData.steps || 0)  
      }
      setCurrentDataPoint(updatedData);
    }

    // Handle 00:00 updates
    if (hour === 0 && minute === 0) {
      // Reset daily steps
      setDailySteps(0);

      // Update MosaicChart with 7-day activity data
      const last7days = getLast7Days(minuteSeries, currentTime); 
      
      // Group by day and hour, calculate hourly totals
      const dailyHourlyTotals = {};
      last7days.forEach(record => {
        const day = record.timestamp.split('T')[0];  
        const hour = parseInt(record.timestamp.slice(11, 13)); 
        
        if (!dailyHourlyTotals[day]) {
          dailyHourlyTotals[day] = {};
        }
        if (!dailyHourlyTotals[day][hour]) {
          dailyHourlyTotals[day][hour] = { calories: 0, steps: 0 };
        }
        
        dailyHourlyTotals[day][hour].calories += record.calories || 0;
        dailyHourlyTotals[day][hour].steps += record.steps || 0;
      });

      // Calculate activity percentages for each day
      const activityArray = Object.entries(dailyHourlyTotals)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB)) // Sort by date
      .map(([date, hourlyTotals]) => {
        const hourlyScores = { low: 0, medium: 0, high: 0 };
        const totalHours = Object.keys(hourlyTotals).length;
        
        // Calculate score for each hour
        Object.values(hourlyTotals).forEach(hourData => {
          const score = calcActivityScore(hourData.calories, hourData.steps);
          hourlyScores[score]++;
        });
        
        // Convert to percentages
        const result = {
          date: date,
          low: Math.round((hourlyScores.low / totalHours) * 100),
          medium: Math.round((hourlyScores.medium / totalHours) * 100),
          high: Math.round((hourlyScores.high / totalHours) * 100),
          totalHours: totalHours
        };
        return result;
      });

      setActivity(activityArray);
    } else {
      // Accumulate steps throughout the day
      setDailySteps(prev => prev + (currentMinuteData.steps || 0));
    }

    // Handle 08:00 updates
    if (hour === 8 && minute === 0) {

      // Find last night's sleep data
      const lastNight = daySeries.find(day => day.date === date);

      if (lastNight?.sleep) {
        const spans = toChartSpans(lastNight.sleep.levels);
        setCurrentStages(spans);

        // Calculate 7-night average
        const last7Nights = getLast7Days(sleepSeries, currentTime);

        const avgSleep = calcSleepAverages(last7Nights);

        setAvgStages(avgSleep);

      } else {
        console.log("No sleep data found for", date);
      }

      // Get yesterday's data for wellness calculation
      const currentDateTime = new Date(currentTime + (currentTime.endsWith('Z') ? '' : 'Z'));
      const yesterday = new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000));
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Get yesterday's minute data
      const yesterdayMinuteData = minuteSeries.filter(record => 
        record?.timestamp && record.timestamp.startsWith(yesterdayStr)
      );

      // Get yesterday's hour data  
      const yesterdayHourData = hourSeries.filter(record =>
        record?.timestamp && record.timestamp.startsWith(yesterdayStr)
      );
      
      // Calculate wellness index for yesterday
      const wellnessIndex = calcWellnessIndex(
        yesterdayMinuteData, 
        yesterdayHourData,
        lastNight.sleep            
      );
      
      setWellness(wellnessIndex);
    }

    // Increment to next minute
    minuteIndexRef.current = (minuteIndexRef.current + 1) % minuteSeries.length;

    // Update hour index if we're at a new hour
    if (minute === 0) {
      hourIndexRef.current = (hourIndexRef.current + 1) % hourSeries.length;
    }

    setCurrentSteps(currentMinuteData.steps);
    
  }, simulationSpeed); 

  return () => clearInterval(interval);
}, [minuteSeries, hourSeries, daySeries, sleepSeries, dailySteps, simulationSpeed, isSimulationRunning]);

  // Show loading state if data not yet loaded
  if (minuteSeries.length === 0) {
    console.log("Loading data, minuteSeries.length:", minuteSeries.length);
    return <p>Loading data…</p>;
  }

  return (
    <div className="dashboard-container">
      {/* Speed Control Panel */}
      <div className="speed-control-panel">
        <div className="speed-controls">
          <div className="timestamp-display">
            {formatTimestamp(currentDataPoint?.timestamp)}
          </div>
          
          <div className="speed-section">
            <label htmlFor="speed-slider">Speed: {Math.round(60000 / simulationSpeed)}×{" "}({(1000 / simulationSpeed).toFixed(2)} min/sec)</label>
            <input
              id="speed-slider"
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.log10(60000 / simulationSpeed) * 20} // Map to 0–100 scale
              onChange={(e) => {
                // Map slider 0–100 -> exponential scale 1× to ~600× faster
                const newSpeed = 60000 / Math.pow(10, e.target.value / 20);
                setSimulationSpeed(newSpeed);
              }}
              className="speed-slider"
            />
            <button 
              onClick={() => setIsSimulationRunning(!isSimulationRunning)}
              className="pause-button"
            >
              {isSimulationRunning ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
      {currentDataPoint && (
      <> 
        <div className="card" id="multi">
          <MultiChart data={currentDataPoint} steps={currentSteps} titles={["Heart Rate", "Steps/Min", "Kcal/Min"]} />
      </div>
        <div className="card" id="stress">
          <div className="gauge">
            <GaugeChart data={{ data: currentDataPoint?.stress }} title="Stress Level" />
          </div>
        </div>
        <div className="card" id="steps">
          <div className="bar">
            <BarChart data={{ data: dailySteps }} title="Daily Steps" />
          </div>
        </div>
        <div className="card" id="status">
          <div className="gauge">
            <GaugeChart data={{ data: currentDataPoint?.temperature }} title="Body Temperature" />
          </div>         
        </div>
      </>
      )}
      {avgStages && (
        <div className="card" id="avgstages">
          <div className="pie">
            <PieChart data={avgStages} title="Sleep Quality Average"/>
          </div> 
        </div>
      )}
      {currentDataPoint && (
      <>
        <div className="card" id="laststages">
          <div className="span">
            <SpanChart data={currentStages}/>
          </div> 
        </div>
        <div className="card" id="index">
          <div className="spider">
            <SpiderChart data={wellness}/>
          </div> 
        </div>
        <div className="card" id="activity">
          <div className="mosaic">
            <MosaicChart data={activity}/>
          </div> 
        </div>
      </>
      )}
      </div>
    </div>
  );
};
export default Dashboard;