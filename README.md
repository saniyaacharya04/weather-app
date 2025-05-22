# Weather App

A modern, responsive weather application built with React and Styled Components. It provides current weather conditions, a 5-day forecast, and allows users to search for cities, use their current location, and save favorite locations. Weather data is powered by the OpenWeatherMap API.

## Features

- Search weather information for any city
- Get weather based on the user's current location
- 5-day weather forecast with detailed icons and descriptions
- Unit conversion between Celsius and Fahrenheit (Metric and Imperial)
- Save and manage a list of favorite cities
- Clear all saved cities with one click
- Smart weather-based tips and messages
- Smooth loading transitions and skeleton screens for better user experience
- Displays default city forecast on initial load

## Technologies Used

- React (with functional components and hooks)
- Styled Components for scoped, themeable styling
- OpenWeatherMap API for real-time weather data
- Vite for fast development and optimized builds
- Browser Geolocation API for detecting current location
- Local Storage for persisting saved cities

## Getting Started

### Prerequisites

- Node.js and npm installed

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/saniyaacharya04/weather-app.git

2. Navigate to the project directory:

   ```bash
   cd weather-app
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root directory and add your OpenWeatherMap API key:

   ```env
   REACT_APP_WEATHER_API_KEY=your_openweathermap_api_key
   ```

5. Start the development server:

   ```bash
   npm start
   ```

6. Visit  `http://localhost:3000.` in your browser.


## Deployment

You can deploy the app using services like Vercel, Netlify, or GitHub Pages. Ensure that your API key is safely managed during deployment.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

* [OpenWeatherMap](https://openweathermap.org/) for providing free weather data.


