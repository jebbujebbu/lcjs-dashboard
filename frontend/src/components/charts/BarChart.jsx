import { Themes, ColorHEX, SolidFill } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function BarChart(props) {
  const { data } = props.data;
  const barTitle = props.title;
  const id = useId();  
  const lc = useContext(LCContext);
  const [barChart, setBarChart] = useState(undefined);
  
  // Create chart just once during lifecycle of component.
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return
    if (!lc) {
      console.log("LC context not ready yet");
      return
    }

    const chart = lc.BarChart({
        theme: Themes.cyberSpace,
        container,
        legend: {
          addEntriesAutomatically: false,
        },
    })
    chart
    .setTitle('')
    .setValueLabels(undefined)
    .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));
    setBarChart(chart);
    return () => {
      // Destroy chart when component lifecycle ends.
      chart.dispose();
    };
  }, [id, lc]); 

  // Update cart data whenever data prop changes
  useEffect(() => {
    if (!barChart || data === undefined || barChart.isDisposed()) return    
    barChart
    .setDataStacked(
      [''],
      [
          { subCategory: 'Today', values: [data] },
          { subCategory: '25k', values: [25000 - data] },
      ],
    )
  }, [barChart, data]); 

  // Whenever props.barTitle changes, it is reapplied to existing chart without recreating it
  useEffect(() => {
    if (!barChart) return
    barChart.setTitle(barTitle)
  }, [barChart, barTitle]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;

}