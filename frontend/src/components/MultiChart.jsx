import { Themes, AxisScrollStrategies, AxisTickStrategies, emptyLine, SolidFill, ColorHEX, htmlTextRenderer } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../LC";

const titles = ["Heart Rate", "Steps/Min", "Kcal/Min"];

export default function MultiChart(props) {
  const heartRate = props.data.heart_rate;
  const steps = props.steps;
  const calories = props.data.calories;

  const id = useId();
  const lc = useContext(LCContext);
  const [charts, setCharts] = useState(undefined);
  const [gauges, setGauges] = useState(undefined);

  useEffect(() => {
    const container = document.getElementById(id);
    if (!container || !lc) return;

    // Make container a flexbox row
    container.style.display = "flex";
    container.style.flexDirection = "row";
    container.style.width = "100%";
    container.style.height = "100%";
    container.style.boxSizing = "border-box";

    // Gauges container
    const gaugeLayout = document.createElement("div");
    container.append(gaugeLayout);
    gaugeLayout.style.flex = "0 0 25%";  
    gaugeLayout.style.height = "100%";
    
    // XY container
    const xyContainer = document.createElement("div");
    container.append(xyContainer);
    xyContainer.style.flex = "1";         
    xyContainer.style.height = "100%";
    xyContainer.style.background = "transparent";

    const gaugeChartArray = [];
    const lineSeriesArray = [];

    // Create XY chart
    const xyChart = lc.ChartXY({
      container: xyContainer,
      theme: Themes.cyberSpace,
      legend: { visible: false },
      textRenderer: htmlTextRenderer
    })
      .setTitle("")
      .setCursor((cursor) => cursor.setTickMarkerXVisible(false))
    .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));

    xyChart
      .getDefaultAxisX()
      .setTickStrategy(AxisTickStrategies.Empty)
      .setThickness(0)
      .setStrokeStyle(emptyLine)
      .setScrollStrategy(AxisScrollStrategies.scrolling)
      .setInterval({ start: 0, end: 10_000, stopAxisAfter: false })

    xyChart.getDefaultAxisY().dispose();

    // 3 stacked line series + gauges
    for (let iCh = 0; iCh < 3; iCh++) {
      const axisY = xyChart
        .addAxisY({ iStack: 3 - iCh })
        .setMargins(5, 5)
        .setInterval({ start: 0, end: 100 });
      const lineSeries = xyChart.addLineSeries({ 
        axisY,
        // Define data pattern
        schema: {
          x: { pattern: 'progressive' },
          y: { pattern: null }
        }
      }).setMaxSampleCount(10_000);
      lineSeries.setName(titles[iCh]);
      lineSeriesArray.push(lineSeries);

      const gaugeContainer = document.createElement("div");
      gaugeLayout.append(gaugeContainer);
      gaugeContainer.style.height = "33.33%";

      const gauge = lc.Gauge({
        container: gaugeContainer,
        theme: Themes.cyberSpace,
        textRenderer: htmlTextRenderer
      })
        .setTitle("")
        .setUnitLabel(titles[iCh])
        .setInterval(0, 100)
        .setAngleInterval(180, 0)
        .setRoundedEdges(false)
        .setBarThickness(20)
        .setNeedleLength(20)
        .setNeedleThickness(5)
        .setValueIndicatorThickness(10)
        .setGapBetweenBarAndValueIndicators(1)
        .setTickFormatter((tick) => tick.toFixed(0))
        .setValueLabelFont((font) => font.setSize(24))
        .setUnitLabelFont((font) => font.setSize(16))
        .setTickFont((font) => font.setSize(16))
        .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }))

      gaugeChartArray.push(gauge);
    }

    // Color palette for gauges
    const valueIndicators = [];
    const colorPalette = gaugeChartArray[0].getTheme().examples.badGoodColorPalette;
    const stepSize = 100 / colorPalette.length;
    colorPalette.forEach((color, index) => {
      valueIndicators.push({
        start: stepSize * index,
        end: stepSize * (index + 1),
        color,
      });
    });
    gaugeChartArray.forEach((gauge) => gauge.setValueIndicators(valueIndicators));

    setCharts(lineSeriesArray);
    setGauges(gaugeChartArray);

    return () => {
      xyChart.dispose();
      gaugeChartArray.forEach((gauge) => gauge.dispose());
      gaugeLayout.remove();
      xyContainer.remove();
    };
  }, [id, lc]);

  // Update line series
  useEffect(() => {
    if (!charts) return;
    charts[0].axisY.setInterval({ start: 20, end: 150 });
    charts[0].appendJSON({ x: performance.now(), y: heartRate });
    charts[1].axisY.setInterval({ start: 0, end: 150 });
    charts[1].appendJSON({ x: performance.now(), y: steps });
    charts[2].axisY.setInterval({ start: 0, end: 15 });
    charts[2].appendJSON({ x: performance.now(), y: calories });
  }, [charts, heartRate, steps, calories]);

  // Update gauges
  useEffect(() => {
    if (!gauges) return;
    gauges[0].setValue(heartRate);
    gauges[1].setValue(steps);
    gauges[2].setValue(calories);
  }, [gauges, heartRate, steps, calories]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}
