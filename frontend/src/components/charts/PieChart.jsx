import { PieChartTypes, SliceLabelFormatters, Themes, SolidFill, ColorHEX } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function PieChart({ data, title }) {
  const id = useId();
  const lc = useContext(LCContext);
  const [chart, setChart] = useState(undefined);

  useEffect(() => {
    const container = document.getElementById(id);
    if (!container || !lc) return;

    const pieType =
      window.innerWidth > 599
        ? PieChartTypes.LabelsOnSides
        : PieChartTypes.LabelsInsideSlices;

    const pie = lc.Pie({
      theme: Themes.cyberSpace,
      type: pieType,
      container: container,
    });

    pie.setTitle(title || "Sleep Stages")
      .setMultipleSliceExplosion(true)
      .setLabelFormatter(SliceLabelFormatters.NamePlusRelativeValue)
      .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));

    setChart(pie);

    return () => {
      // Destroy chart when component lifecycle ends.
      pie.dispose();
    };
  }, [id, lc, title]);

  useEffect(() => {
    if (!chart || chart.isDisposed() || !Array.isArray(data)) return;

    const slices = chart.getSlices();

    data.forEach((item) => {
      const slice = slices.find((s) => s.getName() === item.name);
      if (slice) {
        slice.setValue(item.value);
      } else {
        chart.addSlice(item.name, item.value);
      }
    });
  }, [chart, data, title]);

  return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}
