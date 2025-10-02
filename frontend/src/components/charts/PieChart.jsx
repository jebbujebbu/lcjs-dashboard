import { PieChartTypes, SliceLabelFormatters, Themes } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function PieChart(props) {
  const data = props.data;
  const title = props.title;
  // console.log(`PieChart ${title} data`, data);
  const id = useId();
  const lc = useContext(LCContext);
  const [chart, setChart] = useState(undefined);

  // Create chart just once during lifecycle of component.
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return;
    if (!lc) {
      console.log("LC context not ready yet");
      return;
    }
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("PieChart: No data available");
      return;
    }

    let actualChart;

    const pieType = window.innerWidth > 599 ? PieChartTypes.LabelsOnSides : PieChartTypes.LabelsInsideSlices;

    const pie = lc.Pie({
        theme: Themes.cyberSpace,
        type: pieType,
        container: container,
    });

    pie.setTitle(title || 'Sleep Stages')
    .setMultipleSliceExplosion(true);

    actualChart = pie;

    // Convert sleep stage data to pie chart format
    const pieData = data.map(stage => {
      // Calculate total duration for this stage across all spans
      const totalDuration = stage.spans.reduce((sum, span) => {
        return sum + (span[1] - span[0]); // end - start
      }, 0);
      
      // Convert stage names to more readable labels
      const stageLabels = {
        light: 'Light',
        deep: 'Deep', 
        rem: 'REM'
      };
      
      return {
        name: stageLabels[stage.stage] || stage.stage,
        value: Math.round(totalDuration * 60) // Convert hours to minutes
      };
    }).filter(item => item.value > 0); // Only include stages with data

    console.log("PieChart converted data:", pieData);

    // Create slices
    if (pieData.length > 0) {
      const slices = pieData.map((item) => pie.addSlice(item.name, item.value));
      pie.setLabelFormatter(SliceLabelFormatters.NamePlusRelativeValue);
    } else {
      console.log("PieChart: No valid sleep data to display");
    }
  
    setChart(pie);

    return () => {
      // Destroy the actual chart instance when component lifecycle ends
      if (actualChart) {
        actualChart.dispose();
      }
    };

  }, [id, lc, data, title]); 

  // Update data whenever data prop changes.
  useEffect(() => {
     if (!chart || !data || chart.isDisposed()) return

    // Clear old slices
    // chart.clear()

    // Convert sleep stage spans into minutes
    const stageLabels = { light: "Light", deep: "Deep", rem: "REM" }
    const pieData = data.map(stage => {
        const totalMinutes = stage.spans.reduce((sum, [start, end]) => sum + (end - start), 0) * 60
        return {
        name: stageLabels[stage.stage] || stage.stage,
        value: Math.round(totalMinutes)
        }
    }).filter(item => item.value > 0)

    // Add new slices
    pieData.forEach(item => {
        chart.addSlice(item.name, item.value)
    })
  }, [chart, data]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}