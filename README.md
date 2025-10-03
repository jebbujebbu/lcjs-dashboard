# JavaScript Wellness Dashboard

This project is an application demonstrating LightningChart JS, a high-performance data visualization library for JavaScript. The dashboard simulates real-time wellness and health monitoring data, showcasing various chart types and interactive visualizations.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.

## Description

The Wellness Dashboard is a comprehensive health monitoring application that displays simulated fitness and wellness data in real-time. It features multiple chart types to visualize different aspects of health data:

### Featured Chart Types:
- **Multi-Chart**: Real-time heart rate, calories, and steps visualization
- **Gauge Charts**: Stress level and body temperature monitoring
- **Bar Chart**: Daily steps progress tracking
- **Pie Chart**: Sleep quality averages over 7 days
- **Span Chart**: Sleep stages visualization (Light, Deep, REM sleep)
- **Spider Chart**: Wellness index radar showing multiple health metrics
- **Mosaic Chart**: 7-day activity level heatmap

### Key Features:
- **Real-time simulation**: Data updates every 16ms simulating minute-by-minute health tracking
- **Time-based events**: Special updates at midnight (activity summary) and 8 AM (sleep analysis)
- **Historical data**: 7-day rolling averages and trends
- **Interactive visualizations**: GPU-accelerated charts with smooth animations
- **Comprehensive health metrics**: Sleep, activity, stress, heart rate, and temperature monitoring

## How to Use

- Make sure that relevant version of Node.js is installed.

- Create an `.env` file to `/frontend` folder and add your license key there. You can see the format in `/frontend/.env.example`.

- Install dependencies in terminal, in project root:
```
npm install
npm i @lightningchart/lcjs
```

- Build the application and start the development server:
```
npm start
```

- The application is available at http://localhost:3000 in your browser.

### Project Structure:
- `/backend` - Node.js server providing simulated health data APIs
- `/frontend` - React application with LightningChart JS visualizations
- `/frontend/src/components/charts/` - Individual chart components
- `/frontend/src/utils/` - Data processing and calculation utilities

## Links

- [LightningChart JS Official Website](https://lightningchart.com/js-charts/)
- [LightningChart JS Documentation](https://lightningchart.com/js-charts/docs/)
- [LightningChart JS API Reference](https://lightningchart.com/js-charts/api-documentation/)
- [LightningChart JS Examples](https://lightningchart.com/js-charts/interactive-examples/)

## About the Creator


