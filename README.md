# JavaScript Wellness Dashboard

This project is an application demonstrating LightningChart JS, a high-performance data visualization library for JavaScript. The dashboard simulates real-time wellness and health monitoring data, showcasing various chart types and interactive visualizations.

LightningChart JS is entirely GPU accelerated and performance optimized charting library for presenting massive amounts of data. It offers an easy way of creating sophisticated and interactive charts and adding them to your website or web application.


## Description

The Wellness Dashboard is a comprehensive health monitoring application that displays simulated fitness and wellness data in real-time. It features multiple chart types to visualize different aspects of health data:

### Key Features:
- **Real-time simulation**: Data updates every 16ms simulating minute-by-minute health tracking with adjustable speed control (1x to 100x) and play/pause functionality.
- **Time-based events**: Special updates at midnight (activity summary) and 8 AM (sleep analysis).
- **Historical data**: 7-day rolling averages and trends.
- **Interactive visualizations**: GPU-accelerated charts with smooth animations.
- **Comprehensive health metrics**: Sleep, activity, stress, heart rate, and temperature monitoring.

### Featured Chart Types:
- **Multi-Chart**: Real-time heart rate, calories, and steps visualization.
- **Gauge Charts**: Stress level and body temperature monitoring.
- **Bar Chart**: Daily steps progress tracking.
- **Pie Chart**: Sleep quality averages over 7 days.
- **Span Chart**: Sleep stages visualization (Light, Deep, REM sleep).
- **Spider Chart**: Wellness index radar showing multiple health metrics.
- **Mosaic Chart**: 7-day activity levels.

The data is based on one person's health data, edited and adapted from this dataset: 

Yfantidou, S., Karagianni, C., Efstathiou, S., Vakali, A., Palotti, J., Giakatos, D. P., Marchioro, T., Kazlouski, A., Ferrari, E., & Girdzijauskas, Š. (2022). LifeSnaps: a 4-month multi-modal dataset capturing unobtrusive snapshots of our lives in the wild (Version 4) [Data set]. Zenodo. https://doi.org/10.5281/zenodo.7229547.


## How to Use

- Make sure that relevant version of [Node.js](https://nodejs.org/en/download/) is installed (Node 16+ recommended).

- Install http-server globally for LightningChart theme resources:
```bash
npm install --global http-server
```

- Create an `.env` file in the `/frontend` folder and add your license key there. You can see the format in `/frontend/.env.example`:
```
REACT_APP_LCJS_LICENSE=your_license_key_here
```

- Install dependencies in terminal, in project root:
```bash
npm install
```

- Start the development servers (backend, frontend, and LightningChart resources):
```bash
npm start
```

- The application will be available at:
  - Frontend: http://localhost:3000
  - Backend API: http://localhost:5000
  - LightningChart Resources: http://localhost:8080


### Project Structure:
- `/backend` - Node.js server providing simulated health data APIs
- `/frontend` - React application with LightningChart JS visualizations
- `/frontend/src/components/charts/` - Individual chart components
- `/frontend/src/utils/` - Data processing and calculation utilities

### Dependencies:
- **Core**: React 18+, Node.js 16+
- **Visualization**: @lightningchart/lcjs
- **Development**: concurrently, http-server
- **Backend**: Express.js, CORS

## Links

- [LightningChart JS Official Website](https://lightningchart.com/js-charts/)
- [LightningChart JS Documentation](https://lightningchart.com/js-charts/docs/)
- [LightningChart JS API Reference](https://lightningchart.com/js-charts/api-documentation/)
- [LightningChart JS Examples](https://lightningchart.com/js-charts/interactive-examples/)

## About the Creator
I'm an IT Engineering student passionate about software development, web technologies, and building practical projects.

Feel free to connect or provide feedback!

*Created by Jenni Mikkonen*

