import React, { useState, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { FiSun, FiMoon } from "react-icons/fi";
import WeatherApp from "./components/WeatherApp";
import { customTheme } from "./styles/styles";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [accentColor, setAccentColor] = useState("#0077ff");

  useEffect(() => {
    const savedTheme = localStorage.getItem("isDark");
    const savedAccent = localStorage.getItem("accentColor");

    setIsDark(savedTheme ? savedTheme === "true" : window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (savedAccent) setAccentColor(savedAccent);
  }, []);

  useEffect(() => {
    localStorage.setItem("isDark", isDark);
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  const theme = customTheme(accentColor, isDark);

  const toggleTheme = () => setIsDark(prev => !prev);
  const handleAccentChange = e => setAccentColor(e.target.value);

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: theme.background,
          color: theme.text,
          transition: "background-color 0.6s ease, color 0.6s ease",
          paddingTop: "4rem",
        }}
      >
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark/light mode"
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            padding: "0.55rem 1rem",
            borderRadius: "50%",
            border: "none",
            backgroundColor: isDark ? "#333" : "#eee",
            color: isDark ? "#fff" : "#111",
            cursor: "pointer",
            boxShadow: isDark
              ? "0 0 8px rgba(255, 255, 255, 0.3)"
              : "0 0 8px rgba(0, 0, 0, 0.1)",
            zIndex: 1000,
            fontSize: "1.25rem",
          }}
        >
          {isDark ? <FiSun /> : <FiMoon />}
        </button>

        {/* Accent color picker */}
        <div
          title="Pick accent color"
          style={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 1000,
          }}
        >
          <input
            type="color"
            value={accentColor}
            onChange={handleAccentChange}
            aria-label="Choose accent color"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 0 4px rgba(0,0,0,0.3)",
              backgroundColor: "transparent",
            }}
          />
        </div>

        <WeatherApp />
      </div>
    </ThemeProvider>
  );
}
