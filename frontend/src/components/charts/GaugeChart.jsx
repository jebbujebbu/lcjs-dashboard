import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";
import { ColorHEX, Themes, SolidFill, htmlTextRenderer } from "@lightningchart/lcjs";

export default function GaugeChart(props) {
  const { data } = props.data;
  const title = props.title;
  const id = useId();
  const lc = useContext(LCContext);
  const [gauge, setGauge] = useState(undefined);

  // Create chart just once during lifecycle of component
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return
    if (!lc) {
      console.log("LC context not ready yet");
      return
    }
    const gauge = lc.Gauge({
      container, // Add container to gauge creation
      theme: Themes.cyberSpace,
      textRenderer: htmlTextRenderer
    });
    gauge
      .setTitle('')
      .setGapBetweenBarAndValueIndicators(2)
      .setTickFormatter((value) => {
        if (value === gauge.getInterval().start || value === gauge.getInterval().end) {
            return ''
        }
        return `${value}`
      })
      .setGlowColor(undefined)
      .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));

      // Scale the gauge automatically based on screen size
      gauge.addEventListener('resize', (event) => {
        const size = Math.min(event.width, event.height)
        gauge
            .setBarThickness(size / 10)
            .setNeedleLength(gauge.getBarThickness() * 2)
            .setValueIndicatorThickness(gauge.getBarThickness() / 3)
            .setNeedleThickness(gauge.getBarThickness() / 10)
        const fontSizeBig = Math.round(size / 10)
        const fontSizeSmaller = Math.round(size / 20)
        gauge.setUnitLabelFont((font) => font.setSize(fontSizeSmaller))
        gauge.setTickFont((font) => font.setSize(fontSizeSmaller))
        gauge.setValueLabelFont((font) => font.setSize(fontSizeBig))
      });
    
    setGauge(gauge);
    return () => {
      // Destroy chart when component lifecycle ends
      gauge.dispose();
    };
  }, [id, lc]); 

  // Update gauge data whenever data prop changes
  useEffect(() => {
    if (!gauge || data === undefined || gauge.isDisposed()) return
    
    if (title === "Body Temperature") {
      // Scale gauge range to match body temperature (35-39°C)
      gauge
      .setAngleInterval(180, 0)
      .setInterval(34.5, 39)
      .setValueIndicators([
        { start: 34.5, end: 36.0, color: ColorHEX(("#5262b0ff")), startLabel: '', endLabel: ''  },
        { start: 36.0, end: 37.5, color: ColorHEX(("#5ec69cff")), startLabel: '', endLabel: '' },
        { start: 37.5, end: 39, color: ColorHEX(("#973869ff")), startLabel: '', endLabel: '' },
      ]);
    }
    if(title === "Stress Level") {
      gauge
      .setInterval(0, 100)
      .setValueIndicators([
          { start: 0, end: 33, color: ColorHEX(("#5ec69cff")), startLabel: '', endLabel: ''  },
          { start: 33, end: 66, color: ColorHEX(("#8752b0ff")), startLabel: '', endLabel: '' },
          { start: 66, end: 100, color: ColorHEX(("#973869ff")), startLabel: '', endLabel: '' },
      ])
    }
    gauge.setValue(data);
  }, [gauge, data, title]);

  // Whenever props.title changes, it is reapplied to existing chart without recreating it
  useEffect(() => {
    if (!gauge) return
    gauge.setTitle(title)
  }, [gauge, title]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}