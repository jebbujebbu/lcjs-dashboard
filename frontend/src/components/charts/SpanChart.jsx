import { SolidFill, ColorRGBA, AxisTickStrategies, Themes, ColorHEX } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function SpanChart(props) {
  const data = props.data;
  // console.log(`SpanChart data`, data);
  const id = useId();
  const lc = useContext(LCContext);
  const [chart, setChart] = useState(undefined);

  // Create chart just once during lifecycle of component.
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return
    if (!lc) {
      console.log("LC context not ready yet");
      return
    }

    const stages = ['light', 'deep', 'rem'];

    // Define an interface for creating span charts
    let spanChart
    // Store the actual chart instance for cleanup
    let actualChart 
    // User side SpanChart logic
    spanChart = () => {
        // Create a XY-Chart and add a RectSeries to it for rendering rectangles
        const chart = lc.ChartXY({
                legend: { visible: false },
                theme: Themes.cyberSpace,
                container,
            })
            chart.setTitle('Sleep Stages (Last Night)')
            .setUserInteractions(undefined)
            .setCursorMode(undefined).setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));
            // .setBackgroundFillStyle(emptyFill)
            // chart.engine.setBackgroundFillStyle(emptyFill)

        // Store the actual chart instance
        actualChart = chart

        const axisX = chart
            .getDefaultAxisX()
            // Hide default ticks, instead rely on CustomTicks
            .setTickStrategy(AxisTickStrategies.Empty)

        const axisY = chart
            .getDefaultAxisY()
            // Hide default ticks, instead rely on CustomTicks
            .setTickStrategy(AxisTickStrategies.Empty)

        let y = 0
        for (let i = 20; i <= 32; i++) { // Example: show 20h (8 PM) → 32h (8 AM next day)
            const hour = i % 24
            const label = hour.toString().padStart(2, '0') // + ":00"
            axisX
                .addCustomTick()
                .setValue(i)
                .setTickLength(4)
                .setGridStrokeLength(0)
                .setTextFormatter(() => label)
                .setMarker((marker) =>
                    marker.setTextFillStyle(new SolidFill({ color: ColorRGBA(170, 170, 170) }))
                )
        }

        const figureHeight = 10
        const figureThickness = 10
        const figureGap = figureThickness * 0.5
        const fitAxes = () => {
            // Custom fitting for some additional margins
            axisY.setInterval({ start: y, end: figureHeight * 0.5, stopAxisAfter: false })
        }

        let customYRange = figureHeight + figureGap * 1.6
        const addCategory = (category) => {
            const categoryY = y

            const addSpan = (i, min, max, label) => {
                // Add rect
                const rectDimensions = {
                    x: min,
                    y: categoryY - figureHeight,
                    width: max - min,
                    height: figureHeight,
                }
                if (index !== i) {
                    customYRange = customYRange + figureHeight + 1
                }
                fitAxes()
                // Return figure
                const rectSeries = chart.addRectangleSeries().add(rectDimensions).setCornerRadius(10)
                return rectSeries
            }

            // Add custom tick for category
            axisY
                .addCustomTick()
                .setValue(y - figureHeight * 0.5)
                .setGridStrokeLength(0)
                .setTextFormatter((_) => category)
                .setMarker((marker) => marker.setTextFillStyle(new SolidFill({ color: ColorRGBA(170, 170, 170) })))
            y -= figureHeight * 1.5

            fitAxes()
            // Return interface for category
            return {
                addSpan,
            }
        }
        // Return interface for span chart
        return {
            addCategory,
        }
      }

    // Use the interface for example
    let chart = spanChart()
    const categories = ['Light', 'Deep', 'REM'].map((name) => chart.addCategory(name))
    chart.categories = categories
    chart.stageMap = {}
    chart.rectangleSeries = [] // Track rectangle series for clearing
    stages.forEach((stage, i) => {
    chart.stageMap[stage] = i   // e.g. { light:0, deep:1, rem:2 }
    })
    
    const spans = []

    let index = 0
    spans.forEach((values, i) => {
        values.forEach((value, j) => {
            categories[i].addSpan(i, value[0], value[1])
            index = index + 1
        })
    })
    
    setChart(chart);

    return () => {
      // Destroy the actual chart instance when component lifecycle ends
      if (actualChart) {
        actualChart.dispose();
      }
    };
  }, [id, lc]); 

  // Update data whenever data prop changes
  useEffect(() => {
    if (!chart || !data) return

    // Clear previous rectangle series
    if (chart.rectangleSeries) {
      chart.rectangleSeries.forEach(series => {
        try {
          series.dispose();
        } catch (e) {
          // Series might already be disposed
        }
      });
      chart.rectangleSeries = [];
    }

    data.forEach((entry) => {
      const { stage, spans } = entry
      if (stage === "wake") return // skip wake in chart

      // find correct category row
      const idx = chart.stageMap[stage]
      if (idx === undefined) {
        console.warn("Unknown stage:", stage)
        return
      }

      spans.forEach(span => {
        const rectSeries = chart.categories[idx].addSpan(idx, span[0], span[1])
        chart.rectangleSeries.push(rectSeries)
      })
    })
  }, [chart, data]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}