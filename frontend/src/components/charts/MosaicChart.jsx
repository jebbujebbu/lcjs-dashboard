import { SolidFill, ColorHEX, ColorRGBA, emptyLine, emptyFill, UIElementBuilders, UIOrigins, AxisTickStrategies, Themes, htmlTextRenderer } from "@lightningchart/lcjs";
import { useEffect, useState, useContext, useId } from "react";
import { LCContext } from "../../LC";

export default function MosaicChart(props) {
  const data = props.data;
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

    // Define an interface for creating mosaic charts.
    let mosaicChart
    // Store the actual chart instance
    let chartInstance 
    // User side MosaicChart logic.
    mosaicChart = () => {
        // Create a XY-Chart and add a RectSeries to it for rendering rectangles.
        const chart = lc
            .ChartXY({
                legend: { visible: false },
                theme: Themes.cyberSpace,
                container,
                textRenderer: htmlTextRenderer
            })
            .setTitle('Weekly Activity')
            .setUserInteractions(undefined)
            .setCursorMode(undefined)
            .setBackgroundFillStyle(new SolidFill({ color: ColorHEX('#060316') }));

        // Store the chart instance
        chartInstance = chart 
        const rectangles = chart.addRectangleSeries()
        rectangles.setName('')

        const bottomAxis = chart
            .getDefaultAxisX()
            .setInterval({ start: 0, end: 100, stopAxisAfter: false })
            .setScrollStrategy(undefined)
            .setTitle('')
            .setTickStrategy(AxisTickStrategies.Empty)
        const leftAxis = chart
            .getDefaultAxisY()
            .setInterval({ start: 0, end: 100, stopAxisAfter: false })
            // Hide default ticks of left Axis.
            .setTickStrategy(AxisTickStrategies.Empty)
        const rightAxis = chart
            .addAxisY({ opposite: true })
            .setInterval({ start: 0, end: 100, stopAxisAfter: false })
            .setScrollStrategy(undefined)
            .setTitle('') 
            .setTickStrategy(AxisTickStrategies.Empty) 
        const topAxis = chart
            .addAxisX({ opposite: true })
            .setInterval({ start: 0, end: 100, stopAxisAfter: false })
            // Hide default ticks of top Axis.
            .setTickStrategy(AxisTickStrategies.Empty)

        // Create marker for the top of each column.
        const categoryMarkerBuilder = UIElementBuilders.AxisTickMajor
        // Create text on top of each section.
        const subCategoryLabelBuilder = UIElementBuilders.TextBox
            // Style the label.
            .addStyler((label) =>
                label
                    // Set the origin point and fillStyle (color) for the label.
                    .setOrigin(UIOrigins.Center)
                    .setTextFillStyle(new SolidFill().setColor(ColorRGBA(255, 255, 255)))
                    .setPointerEvents(false)
                    .setBackground((background) => background.setFillStyle(emptyFill).setStrokeStyle(emptyLine)),
            )

        const categories = []
        const yCategories = []
        const subCategories = []
        let margin = 0.1

        // Recreate rectangle figures from scratch.
        const _updateChart = () => {
            // Remove already existing figures.
            rectangles.clear()
            // Make new figures from each category.
            const sumCategoryValues = categories.reduce((prev, cur) => prev + cur.value, 0)
            if (sumCategoryValues > 0) {
                let xPos = 0
                // For each category on a single column, recreate the marker to the left of the chart.
                for (const yCategory of yCategories) {
                    let textColor;
                    if (yCategory.name === 'Low') {
                        textColor = ColorHEX("#5262b0ff"); 
                    } else if (yCategory.name === 'Medium') {
                        textColor = ColorHEX("#8752b0ff");
                    } else if (yCategory.name === 'High') {
                        textColor = ColorHEX("#973869ff"); 
                    } else {
                        textColor = ColorHEX("#ffffff");
                    }

                    yCategory.tick
                        .setTextFormatter((_) => yCategory.name)
                        .setValue(yCategory.value)
                        .setMarkerVisible(true)
                        .setMarker((marker) => 
                            marker.setTextFillStyle(new SolidFill({ color: textColor }))
                        )
                }
                // For each category (or column)
                for (const category of categories) {
                    // Calculate the correct value to display for each category
                    const relativeCategoryValue = (100 * category.value) / sumCategoryValues
                    const sumSubCategoryValues = category.subCategories.reduce((prev, cur) => prev + cur.value, 0)
                    // If there are subCategories for the column
                    if (sumSubCategoryValues > 0) {
                        // Recreate the tick to display above each category and set the correct value to it
                        category.tick
                            .setTextFormatter((_) => {
                                const isNotFullscreen = window.innerWidth <= 1495;

                                if (isNotFullscreen) {
                                    // Convert date from "2022-01-21" to US format
                                    const dateStr = category.name;
                                    if (dateStr.includes('-') && dateStr.length === 10) {
                                        const parts = dateStr.split('-');
                                        if (parts.length === 3) {
                                            const year = parts[0].slice(-2); // Get last 2 digits of year
                                            const month = parts[1];
                                            const day = parts[2];
                                            return `${month}/${day}/${year}`;
                                        }
                                    }
                                } else {
                                    const dateStr = category.name;
                                    if (dateStr.includes('-') && dateStr.length === 10) {
                                        const parts = dateStr.split('-');
                                        if (parts.length === 3) {
                                            const year = parts[0]; 
                                            const month = parts[1];
                                            const day = parts[2];
                                            return `${month}/${day}/${year}`; 
                                        }
                                    }
                                }
                                // Default: return original name (for non-date strings)
                                return category.name;
                            })
                            .setValue(xPos + relativeCategoryValue / 2)
                            .setMarkerVisible(true)
                        let yPos = 0
                        for (const subCategory of category.subCategories) {
                            // Calculate proper value for the subCategory
                            const relativeSubCategoryValue = (100 * subCategory.value) / sumSubCategoryValues
                            if (relativeSubCategoryValue > 0) {
                                const rectangleDimensions = {
                                    x: xPos + margin,
                                    y: yPos + margin,
                                    width: relativeCategoryValue - 2 * margin,
                                    height: relativeSubCategoryValue - 2 * margin,
                                }
                                // Create a rectangle to represent the subCategory
                                rectangles
                                    .add(rectangleDimensions)
                                    .setFillStyle(subCategory.subCategory.fillStyle)
                                    .setStrokeStyle(emptyLine)
                                // Recreate the label for the subCategory and update the value for it
                                subCategory.label
                                    .setText(Math.round(relativeSubCategoryValue) + '%')

                                    .setPosition({
                                        x: xPos + relativeCategoryValue / 2,
                                        y: yPos + relativeSubCategoryValue / 2,
                                    })
                                    .setVisible(true)
                            }
                            // The subCategory is not shown, so we can dispose of its label.
                            else subCategory.label.setVisible(false)
                            yPos += relativeSubCategoryValue
                        }
                    } else {
                        // There are no subCategories for the column, so the elements related to it can be disposed.
                        category.tick.setMarkerVisible(false)
                        category.subCategories.forEach((sub) => sub.label.setVisible(false))
                    }
                    xPos += relativeCategoryValue
                }
            }
        }
        // Method to add a new subCategory to the chart.
        const addSubCategory = () => {
            const subCategory = {
                fillStyle: Themes.cyberSpace.seriesFillStyle,
                setFillStyle(fillStyle) {
                    this.fillStyle = fillStyle
                    // Refresh the chart.
                    _updateChart()
                    return this
                },
            }
            subCategories.push(subCategory)
            return subCategory
        }
        // Method to add a new main category to the chart.
        const addCategory = (name) => {
            const category = {
                name,
                value: 0,
                tick: topAxis.addCustomTick(categoryMarkerBuilder).setGridStrokeStyle(emptyLine),
                subCategories: [],
                setCategoryValue(value) {
                    this.value = value
                    _updateChart()
                    return this
                },
                setSubCategoryValue(subCategory, value) {
                    const existing = this.subCategories.find((a) => a.subCategory === subCategory)
                    if (existing !== undefined) {
                        existing.value = value
                    } else {
                        this.subCategories.push({
                            subCategory,
                            value,
                            label: chart.addUIElement(subCategoryLabelBuilder, {
                                x: bottomAxis,
                                y: rightAxis,
                            }),
                        })
                    }
                    _updateChart()
                    return this
                },
            }
            categories.push(category)
            return category
        }
        // Method to add subCategory markers.
        const addYCategory = (name, value) => {
            const yCategory = {
                name,
                value: value,
                tick: leftAxis.addCustomTick(categoryMarkerBuilder).setGridStrokeStyle(emptyLine),
                setCategoryYValue(value) {
                    this.value = value
                    _updateChart()
                    return this
                },
            }
            yCategories.push(yCategory)
            return yCategory
        }
        // Method to clear all categories
        const clearCategories = () => {
            // Dispose of all category ticks and subcategory labels properly
            categories.forEach(category => {
                category.tick.dispose() // Built-in dispose method
                // Dispose of all subcategory labels
                category.subCategories.forEach(sub => {
                    sub.label.dispose() // Built-in dispose method
                })
            })
            // Clear the arrays
            categories.length = 0
            // Clear rectangles using built-in method
            rectangles.clear()
        }
        // Return interface for mosaic chart
        return {
            addSubCategory,
            addCategory,
            addYCategory,
            clearCategories,
        }
    }

    // Create the mosaic chart interface  
    const mosaicChartInterface = mosaicChart()

    mosaicChartInterface.addYCategory('High', 80)
    mosaicChartInterface.addYCategory('Medium', 50)
    mosaicChartInterface.addYCategory('Low', 20)

    // Create subcategories for activity levels
    const subCategory_low = mosaicChartInterface.addSubCategory()
    .setFillStyle(new SolidFill().setColor(ColorHEX("#5262b0ff")))
    subCategory_low.name = 'Low'; 

    const subCategory_medium = mosaicChartInterface.addSubCategory()
        .setFillStyle(new SolidFill().setColor(ColorHEX("#8752b0ff")))
    subCategory_medium.name = 'Medium'; 

    const subCategory_high = mosaicChartInterface.addSubCategory()
        .setFillStyle(new SolidFill().setColor(ColorHEX("#973869ff")))
    subCategory_high.name = 'High'; 

    setChart({
      interface: mosaicChartInterface,
      subcategories: { low: subCategory_low, medium: subCategory_medium, high: subCategory_high },
      instance: chartInstance // Store the chart instance in state
    });

    return () => {
      // Destroy the actual LightningChart instance when component lifecycle ends
      if (chartInstance && chartInstance.dispose) {
        chartInstance.dispose();
      }
    };
  }, [id, lc]);


  // Update line series data whenever data prop changes.
  useEffect(() => {
    if (!chart || !data) return
    
    // Use existing chart interface and subcategories
    const { interface: mosaicChart, subcategories } = chart;
    
    // Clear existing categories
    mosaicChart.clearCategories();
    
    // Add categories for each day and set their values
    for (let i = 0; i < data.length; i++) {
      mosaicChart
        .addCategory(data[i].date)
        .setCategoryValue(100 / data.length)
        .setSubCategoryValue(subcategories.low, data[i].low)
        .setSubCategoryValue(subcategories.medium, data[i].medium)
        .setSubCategoryValue(subcategories.high, data[i].high);
    }
  }, [chart, data]);

    return <div id={id} style={{ width: "100%", height: "100%" }}></div>;
}