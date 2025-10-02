import { Themes, ColorHEX, ColorRGBA, SolidFill } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function SpiderChart(props) {
  const data = props.data;
  // console.log('SpiderChart data', data);
  const id = useId();
  const lc = useContext(LCContext);
  const [chart, setChart] = useState(undefined);
  const categories = ['Sleep Quality', 'Heart Rate', 'Stress Level', 'Activity']

  // Create chart just once during lifecycle of component.
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return
    if (!lc) {
      console.log("LC context not ready yet");
      return
    }

    const chart = lc.Spider({
      legend: { visible: false },
      theme: Themes.cyberSpace,
      container,
    });

    chart.setTitle('Wellness Index')
    .setAxisInterval(100)
    .setAxisInterval(100)
    .setScaleLabelStrategy(undefined)
    // .setBackgroundFillStyle(new SolidFill({ color: ColorHEX("#db94c6") }))
    // .setSeriesBackgroundFillStyle(new SolidFill({ color: ColorHEX("#db94c6") }))

    const series = [chart.addSeries().setName('Average'), chart.addSeries().setName('Me')]
    series.forEach((value, i) => {
        value.setPointSize(5)
    })

    //This is for Average Series (typical healthy adult averages).
    series[0].addPoints(
        { axis: categories[0], value: 72 },  // Sleep Quality: 72% (good sleep efficiency)
        { axis: categories[1], value: 68 },  // Heart Rate: 68% (healthy resting HR score)
        { axis: categories[2], value: 58 },  // Stress Level: 58% (moderate stress management)
        { axis: categories[3], value: 65 },  // Activity: 65% (moderately active lifestyle)
    )

    setChart({ chart, series });
    
    return () => {
      // Destroy chart when component lifecycle ends.
      chart.dispose();
    };
  }, [id, lc]); 

  // Update series data whenever data prop changes.
  useEffect(() => {
    if (!chart || !data || chart.chart.isDisposed()) return
    // console.log("SpiderChart update, data: ", data)
    
    const newPoints = [
        { axis: categories[0], value: data.sleepQuality || 0 },
        { axis: categories[1], value: data.heartRate || 0 },
        { axis: categories[2], value: data.stressLevel || 0 },
        { axis: categories[3], value: data.activity || 0 }
    ];
    
    chart.series[1].addPoints(...newPoints);
  }, [chart, data]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}