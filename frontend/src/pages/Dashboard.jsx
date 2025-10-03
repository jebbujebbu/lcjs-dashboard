import React from 'react';
import { useEffect, useState, useRef } from 'react';
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
// import getStageAtTime from '../utils/getStageAtTime.js';

const Dashboard = () => {
  // console.log('Dashboard render');

  const [minuteSeries, setMinuteSeries] = useState([]);
  const [hourSeries, setHourSeries] = useState([]);
  const [daySeries, setDaySeries] = useState([]);
  const [sleepSeries, setSleepSeries] = useState([]);
  // const [minuteIndex, setMinuteIndex] = useState(0);
  // const [hourIndex, setHourIndex] = useState(0);
  // const [dayIndex, setDayIndex] = useState(0);
  const [currentSteps, setCurrentSteps] = useState(0);
  const [dailySteps, setDailySteps] = useState(0);
  // const [currentHour, setCurrentHour] = useState(0);
  const [currentStages, setCurrentStages] = useState(null);
  const [avgStages, setAvgStages] = useState(null);
  const minuteIndexRef = useRef(0);
  const hourIndexRef = useRef(0);
  
  // Add debugging for avgStages changes
  useEffect(() => {
    console.log("avgStages changed:", avgStages);
  }, [avgStages]);
  const [activity, setActivity] = useState(null);
  const [wellness, setWellness] = useState(null);
  const [currentDataPoint, setCurrentDataPoint] = useState(null);

  useEffect(() => { 
    console.log("Fetching data from backend...");
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
      console.log("Fetched data:", data);
      console.log("Fetched sleepData:", sleepData);
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

  useEffect(() => {
    if (minuteSeries.length === 0 || hourSeries.length === 0 || daySeries.length === 0) {
      console.log("Waiting for all data to load...");
      return;
    }

    const interval = setInterval(() => {
      // Update minute data every cycle
      // setMinuteIndex(prevMinuteIndex => {
      //   const nextMinuteIndex = (prevMinuteIndex + 1) % minuteSeries.length;
      //   const currentMinuteData = minuteSeries[nextMinuteIndex];

        // if(!currentMinuteData?.timestamp) return nextMinuteIndex;
        let nextMinuteIndex = (minuteIndexRef.current + 1) % minuteSeries.length;
        const currentMinuteData = minuteSeries[nextMinuteIndex];

        if (!currentMinuteData?.timestamp) {
          minuteIndexRef.current = nextMinuteIndex;
          return;
        }

        const currentTime = currentMinuteData.timestamp;
        const date = currentTime.split('T')[0];
        const hour =  parseInt(currentTime.slice(11, 13));
        const minute = parseInt(currentTime.slice(14, 16));
        // console.log("currentTime date hour minute: ", currentTime, date, hour, minute);

        // Check if hour changed, update hourSeries data
        if (minute === 0)  {
          // console.log("New hour");
          // setHourIndex(prevHourIndex => {
          //   const nextHourIndex = (prevHourIndex + 1) % hourSeries.length;
          //   const currentHourData = hourSeries[nextHourIndex];
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
          // setCurrentHour(hour);
          // console.log("currentDataPoint (hour update)", combinedData);

          // return nextHourIndex;
          // });
          hourIndexRef.current = nextHourIndex;
        } else {
          // Just update with minute data + accumulated steps
          const updatedData = {
            ...currentMinuteData,
            steps: dailySteps + (currentMinuteData.steps || 0)  
          }
          setCurrentDataPoint(updatedData);
          // console.log("currentDataPoint (minute update)", updatedData);
        }

        // Handle 00:00 updates
        if (hour === 0 && minute === 0)  {
          console.log("Midnight 00:00");

          // Reset daily steps
          setDailySteps(0);

          // Update MosaicChart with 7-day activity data
          const last7days = getLast7Days(minuteSeries, currentTime);  //currentTime "2021-05-24T00:00:00Z"
          // console.log("last7days: ", last7days);
          
          // Group by day and hour, calculate hourly totals
          const dailyHourlyTotals = {};
          last7days.forEach(record => {
            const day = record.timestamp.split('T')[0];  //day "2021-02-12"
            const hour = parseInt(record.timestamp.slice(11, 13)); // Extract hour
            
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
                // const activityPoints = (hourData.calories * 0.1) + (hourData.steps * 0.005);
                const score = calcActivityScore(hourData.calories, hourData.steps);
                // console.log(`Hour data: calories=${hourData.calories}, steps=${hourData.steps}, points=${activityPoints}, score=${score}`);
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
              // console.log(`Day ${date}: ${hourlyScores.low}/${hourlyScores.medium}/${hourlyScores.high} out of ${totalHours} hours = ${result.low}%/${result.medium}%/${result.high}%`);
              return result;
            });

          // console.log("activityArray: ", activityArray);
          setActivity(activityArray);
        } else {
          // Accumulate steps throughout the day
          setDailySteps(prev => prev + (currentMinuteData.steps || 0));
        }

        // Handle 08:00 updates
        if (hour === 8 && minute === 0) {
          console.log("Eight AM 08:00");

          // Find last night's sleep data
          // console.log("lastNight date: ", date);
          // console.log("Looking for sleep data on date:", date);
          const lastNight = daySeries.find(day => day.date === date);
          // console.log("8 AM lastnight sleep: ", lastNight.sleep)
          // console.log("Matched lastNight:", lastNight);

          if (lastNight?.sleep) {
            const spans = toChartSpans(lastNight.sleep.levels);
            // console.log("8 AM update - converted spans:", spans);
            setCurrentStages(spans);

            // Calculate 7-night average
            const last7Nights = getLast7Days(sleepSeries, currentTime);
            console.log("8 AM update - last7Nights:", last7Nights);

            const avgSleep = calcSleepAverages(last7Nights);
            console.log("8 AM update - avgSleep:", avgSleep);

            setAvgStages(avgSleep);

          // console.log("Updated sleep data:", { lastNight: lastNight.sleep, average: avgSleep });
          } else {
            console.log("No sleep data found for", date);
          }

          // Get yesterday's data for wellness calculation
          const currentDateTime = new Date(currentTime + (currentTime.endsWith('Z') ? '' : 'Z'));
          const yesterday = new Date(currentDateTime.getTime() - (24 * 60 * 60 * 1000));
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          // console.log("lastnight sleep: ", lastNight.sleep)

          // Get yesterday's minute data
          const yesterdayMinuteData = minuteSeries.filter(record => 
            record?.timestamp && record.timestamp.startsWith(yesterdayStr)
          );
          // console.log("yesterdayMinuteData: ", yesterdayMinuteData)

          // Get yesterday's hour data  
          const yesterdayHourData = hourSeries.filter(record =>
            record?.timestamp && record.timestamp.startsWith(yesterdayStr)
          );
          // console.log("yesterdayHourData: ", yesterdayHourData)
          
          // Calculate wellness index for yesterday
          const wellnessIndex = calcWellnessIndex(
            yesterdayMinuteData, 
            lastNight.sleep, 
            yesterdayHourData
          );
          
          setWellness(wellnessIndex);
          console.log("Updated wellness index:", wellnessIndex);
        }

        setCurrentSteps(currentMinuteData.steps);
      
        minuteIndexRef.current = nextMinuteIndex;
      //   return nextMinuteIndex;
      // });
    }, 16); // 0.1 second = 1 simulated minute

    return () => clearInterval(interval);
  }, [minuteSeries, hourSeries, daySeries, sleepSeries, dailySteps]);

  if (minuteSeries.length === 0) {
    console.log("Loading data, minuteSeries.length:", minuteSeries.length);
    return <p>Loading data…</p>;
  }

  return (
    <div>
      <div className="dashboard-grid">
      {currentDataPoint && (
      <> 
        <div className="card" id="multi">
          <MultiChart data={currentDataPoint} steps={currentSteps} titles={["Heart Rate", "Steps/Min", "Kcal/Min"]}/>
      </div>
        <div className="card" id="stress">
          <div className="gauge">
            <GaugeChart data={{ data: currentDataPoint?.stress }} number={currentDataPoint?.stress} title="Stress Level" />
          </div>
        </div>
        <div className="card" id="steps">
          <div className="bar">
            <BarChart data={{ data: dailySteps }} title="Daily Steps" />
          </div>
        </div>
        <div className="card" id="status">
          <div className="gauge">
            <GaugeChart data={{ data: currentDataPoint?.temperature }} number={currentDataPoint?.temperature} title="Body Temperature" />
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
      {!avgStages && (
        <div className="card" id="avgstages">
          <div className="pie" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', color: 'white'}}>
            <p>Waiting for sleep data...</p>
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