import React, { useState, useEffect, useRef, useContext } from "react";
import {
  Container,
  Title,
  Form,
  Input,
  Button,
  WeatherInfo,
  ForecastContainer,
  ForecastDay,
  LoadingSpinner,
  ErrorText,
  SavedCitiesContainer,
} from "../styles/styles";
import { ThemeContext } from "styled-components";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const weatherTips = {
  Clear: "It's sunny! Don't forget your sunglasses and sunscreen.",
  Clouds: "Cloudy skies. A light jacket might be needed.",
  Rain: "Carry an umbrella or raincoat.",
  Drizzle: "Light rain falling. Stay dry!",
  Thunderstorm: "Stay indoors and avoid open areas during storms.",
  Snow: "Dress warmly and be careful on icy roads.",
  Mist: "Low visibility. Drive carefully and use fog lights.",
  Fog: "Foggy conditions. Use fog lights and reduce speed.",
  Smoke: "Air quality is poor. Avoid outdoor activities.",
  Haze: "Visibility is reduced. Be cautious outdoors.",
  Dust: "Dusty conditions. Protect your eyes and respiratory system.",
  Sand: "Strong winds may blow sand. Wear protective gear.",
  Ash: "Volcanic ash in the air. Stay indoors and avoid breathing it in.",
  Squall: "Strong wind gusts expected. Secure loose objects.",
  Tornado: "Tornado warning! Seek shelter immediately.",
};

function getBackgroundByWeather(main, theme) {
  switch (main) {
    case "Clear":
      return "#87CEEB"; // light blue
    case "Clouds":
      return "#B0C4DE"; // light steel blue
    case "Rain":
    case "Drizzle":
      return "#5F9EA0"; // cadet blue
    case "Thunderstorm":
      return "#483D8B"; // dark slate blue
    case "Snow":
      return "#F0F8FF"; // alice blue
    case "Mist":
    case "Fog":
      return "#778899"; // light slate gray
    default:
      return theme.background;
  }
}

// Conversion helpers
const celsiusToFahrenheit = (c) => c * 9 / 5 + 32;
const msToMph = (ms) => ms * 2.23694;
const metersToMiles = (m) => m / 1609.344;

export default function WeatherApp() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState("metric");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [localTime, setLocalTime] = useState(null);
  const [savedCities, setSavedCities] = useState(() => {
    try {
      const saved = localStorage.getItem("savedCities");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef();
  const theme = useContext(ThemeContext);

  // Clear error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  // Focus input when not loading
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // Update local time every second
  useEffect(() => {
    if (!weather) return;

    const updateTime = () => {
      const utc = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
      const cityTime = new Date(utc + weather.timezone * 1000);
      setLocalTime(
        cityTime.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [weather]);

  // Save city to localStorage if not duplicate
  const saveCity = (cityName) => {
    setSavedCities((prev) => {
      if (prev.includes(cityName)) return prev;
      const updated = [...prev, cityName];
      localStorage.setItem("savedCities", JSON.stringify(updated));
      return updated;
    });
  };

  // Remove city from saved list
  const removeCity = (cityName) => {
    setSavedCities((prev) => {
      const updated = prev.filter((c) => c !== cityName);
      localStorage.setItem("savedCities", JSON.stringify(updated));
      return updated;
    });
  };

  // Fetch weather and forecast data for a city
  const fetchWeatherForCity = async (fetchCity) => {
    if (!fetchCity.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const weatherRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(fetchCity)}&appid=${API_KEY}&units=metric`
      );
      if (!weatherRes.ok) {
        if (weatherRes.status === 404) throw new Error("City not found.");
        throw new Error("Failed to fetch current weather.");
      }
      const weatherData = await weatherRes.json();

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(fetchCity)}&appid=${API_KEY}&units=metric`
      );
      if (!forecastRes.ok) throw new Error("Failed to fetch forecast.");
      const forecastData = await forecastRes.json();

      const dailyForecast = forecastData.list.filter((item) =>
        item.dt_txt.includes("12:00:00")
      );

      setWeather(weatherData);
      setForecast(dailyForecast);
      setLastUpdated(new Date());
      setCity(weatherData.name);
      saveCity(weatherData.name);
    } catch (err) {
      setError(err.message);
      setWeather(null);
      setForecast([]);
      setLastUpdated(null);
      setLocalTime(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch by city input
  const fetchWeather = () => {
    fetchWeatherForCity(city);
  };

  // Fetch weather based on current location
  const fetchCurrentLocationWeather = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const weatherRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          if (!weatherRes.ok) throw new Error("Failed to fetch current weather.");
          const weatherData = await weatherRes.json();

          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          if (!forecastRes.ok) throw new Error("Failed to fetch forecast.");
          const forecastData = await forecastRes.json();

          const dailyForecast = forecastData.list.filter((item) =>
            item.dt_txt.includes("12:00:00")
          );

          setWeather(weatherData);
          setForecast(dailyForecast);
          setLastUpdated(new Date());
          setCity(weatherData.name);
          saveCity(weatherData.name);
        } catch (err) {
          setError(err.message);
          setWeather(null);
          setForecast([]);
          setLastUpdated(null);
          setLocalTime(null);
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError("Unable to retrieve your location.");
        setLoading(false);
      }
    );
  };

  // Display helpers for unit conversion
  const displayTemp = (tempC) =>
    units === "metric" ? Math.round(tempC) : Math.round(celsiusToFahrenheit(tempC));
  const displayWind = (speedMs) =>
    units === "metric" ? Math.round(speedMs) : Math.round(msToMph(speedMs));
  const displayVisibility = (visibilityMeters) =>
    units === "metric"
      ? (visibilityMeters / 1000).toFixed(1)
      : metersToMiles(visibilityMeters).toFixed(1);

  const bgColor = weather?.weather?.[0]?.main
    ? getBackgroundByWeather(weather.weather[0].main, theme)
    : theme.background;

  return (
    <Container
      style={{
        backgroundColor: bgColor,
        textAlign: "center",
        minHeight: "100vh",
        padding: "1rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Title>Weather App</Title>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          fetchWeather();
        }}
        style={{ maxWidth: 400, width: "100%", marginBottom: 16 }}
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          aria-label="City name"
          style={{ textAlign: "center" }}
        />
        <div style={{ marginTop: 8 }}>
          <Button type="submit" disabled={loading}>
            Get Weather
          </Button>
          <Button
            type="button"
            onClick={fetchCurrentLocationWeather}
            disabled={loading}
            style={{ marginLeft: 8 }}
          >
            Use Current Location
          </Button>
        </div>
      </Form>

      <div style={{ marginBottom: 16 }}>
        <Button
          type="button"
          onClick={() => setUnits("metric")}
          disabled={units === "metric" || loading}
          style={{ marginRight: 8 }}
        >
          °C / m/s / km
        </Button>
        <Button
          type="button"
          onClick={() => setUnits("imperial")}
          disabled={units === "imperial" || loading}
        >
          °F / mph / miles
        </Button>
      </div>

      {loading && (
        <LoadingSpinner
          role="status"
          aria-live="polite"
          aria-label="Loading weather data"
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <ErrorText role="alert" style={{ marginBottom: 16 }}>
          {error}
        </ErrorText>
      )}
      {weather && (
      <WeatherInfo
        aria-live="polite"
        aria-atomic="true"
        tabIndex={0}
        style={{ color: theme.text }}
      >
        <h2>
          {weather.name}, {weather.sys.country}
        </h2>

        {localTime && (
          <p>
            <strong>Local time:</strong> {localTime}
          </p>
        )}

        <p>Weather: {weather.weather[0].description}</p>

        <p>
          Temperature: {displayTemp(weather.main.temp)}°
          {units === "metric" ? "C" : "F"}
        </p>

        <p>
          Min: {displayTemp(weather.main.temp_min)}°
          {units === "metric" ? "C" : "F"} | Max: {displayTemp(weather.main.temp_max)}°
          {units === "metric" ? "C" : "F"}
        </p>

        <p>
          Feels like: {displayTemp(weather.main.feels_like)}°
          {units === "metric" ? "C" : "F"}
        </p>

        <p>Humidity: {weather.main.humidity}%</p>

        <p>
          Wind: {displayWind(weather.wind.speed)} {units === "metric" ? "m/s" : "mph"}
        </p>

        <p>Pressure: {weather.main.pressure} hPa</p>

        <p>
          Visibility: {displayVisibility(weather.visibility)} {units === "metric" ? "km" : "miles"}
        </p>

        <p>
          Sunrise:{" "}
          {new Date(weather.sys.sunrise * 1000)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .replace(/:\d{2}$/, "")}
        </p>

        <p>
          Sunset:{" "}
          {new Date(weather.sys.sunset * 1000)
            .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            .replace(/:\d{2}$/, "")}
        </p>

        {lastUpdated && (
          <p
            style={{ fontSize: "0.8rem", color: theme.text }}
            aria-label="Last updated time"
          >
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}

        {weatherTips[weather.weather[0].main] && (
          <p
            style={{
              marginTop: 10,
              fontStyle: "italic",
              color: theme.text,
            }}
          >
            Tip: {weatherTips[weather.weather[0].main]}
          </p>
        )}
      </WeatherInfo>
    )}


      {forecast.length > 0 && (
        <ForecastContainer aria-label="5-day weather forecast" role="list" style={{ marginTop: 24, maxWidth: 600, width: "100%" }}>
          {forecast.map((day) => {
            const date = new Date(day.dt * 1000);
            return (
              <ForecastDay key={day.dt} role="listitem" tabIndex={0}>
                <strong>{date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</strong>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                  width={50}
                  height={50}
                  loading="lazy"
                />
                <div>
                  {displayTemp(day.main.temp_min)}° / {displayTemp(day.main.temp_max)}°
                </div>
                <div>{day.weather[0].main}</div>
              </ForecastDay>
            );
          })}
        </ForecastContainer>
      )}

      {savedCities.length > 0 && (
        <SavedCitiesContainer aria-label="Saved cities" style={{ marginTop: 24, maxWidth: 400, width: "100%" }}>
          <h3>Saved Cities</h3>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {savedCities.map((savedCity) => (
              <li
                key={savedCity}
                style={{
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <button
                  type="button"
                  onClick={() => fetchWeatherForCity(savedCity)}
                  aria-label={`Fetch weather for ${savedCity}`}
                  style={{
                    background: "none",
                    border: "none",
                    color: theme.text,               
                    textDecoration: "none",          
                    cursor: "pointer",
                    padding: 0,
                    fontSize: "1rem",
                    fontWeight: "600",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                  onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                >
                  {savedCity}
                </button>
                <button
                  type="button"
                  onClick={() => removeCity(savedCity)}
                  aria-label={`Remove saved city ${savedCity}`}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setSavedCities([]);
              localStorage.removeItem("savedCities");
            }}
            style={{ marginTop: 8 }}
          >
            Clear All Saved Cities
          </button>
        </SavedCitiesContainer>
      )}
    </Container>
  );
}
