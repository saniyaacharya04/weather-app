import styled, { keyframes } from "styled-components";

/**
 * ---------- THEME PRIMITIVES ----------
 * Base tokens for consistent spacing, radius, and colors.
 * Adjust here to update styles globally.
 */

// Spacing scale based on 8-pt grid system
export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "0.75rem", // 12px
  lg: "1rem",    // 16px
  xl: "1.5rem",  // 24px
};

// Unified border-radius for cards/pills
export const radius = "12px";

/** 
 * Adjusts an #rrggbb hex color by lightening or darkening.
 * amount: -255 (darken) to +255 (lighten)
 */
const adjustColor = (hex, amount) => {
  let col = hex.startsWith("#") ? hex.slice(1) : hex;
  if (col.length === 3) col = col.split("").map(c => c + c).join("");
  const num = parseInt(col, 16);
  const clamp = v => Math.max(0, Math.min(255, v));
  const r = clamp(((num >> 16) & 0xff) + amount);
  const g = clamp(((num >> 8) & 0xff) + amount);
  const b = clamp((num & 0xff) + amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
};


/**
 * Creates a theme object based on mode and primary color.
 * Supports light/dark modes with dynamic color adjustments.
 */
export const createTheme = ({ mode = "light", primary = "#0077ff" } = {}) => {
  const isDark = mode === "dark";
  const uiBg = isDark ? "#1a1a2e" : "#f0f4f8";
  const uiText = isDark ? "#eee" : "#222";
  const uiBgAlt = isDark ? "#2a2a4a" : "#f5f5f5";
  const primaryHover = adjustColor(primary, isDark ? 40 : -40);

  return {
    mode,
    isDark,
    background: uiBg,
    backgroundAlt: uiBgAlt,
    text: uiText,
    primary,
    primaryHover,
    spacing,
    radius,
  };
};

// Preset light and dark themes
export const lightTheme = createTheme();
export const darkTheme = createTheme({ mode: "dark" });

// Helper for creating custom themes from user inputs
export const customTheme = (primaryColour, prefersDark) =>
  createTheme({ mode: prefersDark ? "dark" : "light", primary: primaryColour });

/*
 * ---------- STYLED COMPONENTS ----------
 * Components use theme tokens to maintain consistency and support theming.
 */

export const Container = styled.div`
  max-width: 500px;
  margin: calc(${spacing.lg} * 2) auto;
  padding: ${spacing.lg} ${spacing.md};
  border-radius: ${radius};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  user-select: none;
  transition: background-color 0.6s ease, color 0.6s ease;

  @media (max-width: 540px) {
    margin: ${spacing.md};
    padding: ${spacing.md} ${spacing.sm};
  }
`;

export const Title = styled.h1`
  font-size: 2.4rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: ${spacing.md};
  color: ${({ theme }) => theme.text};
  user-select: none;
  transition: color 0.6s ease;
`;

export const Form = styled.form`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: ${spacing.md};
  margin-bottom: ${spacing.md};
`;

export const Input = styled.input`
  flex: 1 1 240px;
  padding: ${spacing.sm} ${spacing.md};
  font-size: 1.1rem;
  border: 2px solid ${({ theme }) => (theme.isDark ? adjustColor("#555", 20) : "#888")};
  border-radius: ${radius};
  outline-offset: 2px;
  background-color: ${({ theme }) => (theme.isDark ? "#222" : "#fff")};
  color: ${({ theme }) => theme.text};
  transition: border-color 0.3s ease, background-color 0.4s ease, color 0.4s ease;

  &:focus {
    border-color: ${({ theme }) => theme.primary};
    box-shadow: 0 0 6px ${({ theme }) => adjustColor(theme.primary, -70)}80;
    background-color: ${({ theme }) => (theme.isDark ? "#333" : "#fff")};
  }

  &::placeholder {
    color: ${({ theme }) => (theme.isDark ? "#aaa" : "#666")};
  }
`;

export const Button = styled.button`
  padding: ${spacing.sm} ${spacing.lg};
  font-size: 1.1rem;
  background-color: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: ${radius};
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &:disabled {
    background-color: ${({ theme }) => adjustColor(theme.primary, 120)};
    cursor: not-allowed;
    box-shadow: none;
  }

  &:not(:disabled):hover,
  &:not(:disabled):focus-visible {
    background-color: ${({ theme }) => theme.primaryHover};
    outline: none;
    box-shadow: 0 0 8px ${({ theme }) => adjustColor(theme.primaryHover, -70)}b3;
  }
`;

export const WeatherInfo = styled.section`
  background-color: ${({ theme }) =>
    theme.isDark ? "rgba(30, 30, 50, 0.85)" : "rgba(255, 255, 255, 0.85)"};
  border-radius: ${radius};
  padding: ${spacing.lg};
  margin-top: ${spacing.md};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  color: ${({ theme }) => theme.text};
  transition: background-color 0.6s ease, color 0.6s ease;

  h2 {
    margin-top: 0;
    font-size: 1.9rem;
    font-weight: 700;
  }

  p {
    margin: ${spacing.xs} 0;
    font-size: 1.05rem;
    line-height: 1.5;
  }
`;

export const ForecastContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-top: ${spacing.md};
  flex-wrap: nowrap;
  overflow-x: auto;
  padding-bottom: ${spacing.sm};
  gap: ${spacing.sm};

  scrollbar-width: thin;
  scrollbar-color: ${({ theme }) => `${theme.primary} transparent`};

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.primary};
    border-radius: 3px;
  }

  /* Light mode background for better icon visibility */
  background-color: ${({ theme }) =>
    theme.isDark ? "transparent" : "rgba(220, 220, 220, 0.6)"};
  border-radius: ${radius};
  padding: ${spacing.sm};
`;

export const ForecastDay = styled.div`
  flex: 0 0 90px;
  background-color: ${({ theme }) =>
    theme.isDark ? "rgba(30, 30, 50, 0.85)" : "rgba(255, 255, 255, 0.95)"};
  border-radius: ${radius};
  padding: ${spacing.sm};
  text-align: center;
  box-shadow: ${({ theme }) =>
    theme.isDark ? "0 1px 6px rgba(0, 0, 0, 0.2)" : "0 2px 8px rgba(0, 0, 0, 0.08)"};
  color: ${({ theme }) => theme.text};
  transition: background-color 0.6s ease, color 0.6s ease;

  p {
    margin: ${spacing.xs} 0;
    font-size: 1rem;
    color: ${({ theme }) => (theme.isDark ? "#ccc" : "#222")};
  }

  img {
    margin: ${spacing.xs} auto;
    width: 52px;
    height: 52px;
    object-fit: contain;
    display: block;
    filter: ${({ theme }) =>
      theme.isDark ? "brightness(1)" : "brightness(0.8) contrast(1.2)"};
  }
`;

// Spinner animation for loading states
const spin = keyframes`
  to { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  margin: ${spacing.lg} auto;
  border: 5px solid ${({ theme }) => adjustColor(theme.primary, 80)};
  border-top-color: ${({ theme }) => theme.primary};
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: ${spin} 1s linear infinite;
`;

export const ErrorText = styled.p`
  margin: ${spacing.md} 0;
  font-weight: 700;
  color: #f44336; /* Material Red */
  text-align: center;
`;

export const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 52px;
  height: 28px;
  margin-left: ${spacing.md};
  vertical-align: middle;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    background-color: ${({ theme }) => (theme.isDark ? "#555" : "#ccc")};
    border-radius: 28px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    transition: background-color 0.3s ease;
  }

  span::before {
    content: "";
    position: absolute;
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 3px;
    background-color: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
    box-shadow: 0 0 4px rgb(0 0 0 / 0.2);
  }

  input:checked + span {
    background-color: ${({ theme }) => theme.primary};
  }

  input:checked + span::before {
    transform: translateX(24px);
  }
`;

export const SavedCitiesContainer = styled.section`
  margin: 35px auto 0;
  padding: 18px 20px;
  border-top: 2px solid ${({ theme }) => theme.text};
  max-width: 420px;
  background-color: ${({ theme }) => theme.backgroundAlt};
  border-radius: ${radius};
  color: ${({ theme }) => theme.text};
  transition: background-color 0.6s ease, color 0.6s ease;

  h3 {
    margin-bottom: ${spacing.sm};
  }

  ul {
    list-style: none;
    padding-left: 0;
    display: flex;
    flex-wrap: wrap;
    gap: ${spacing.xs};
    justify-content: center;
  }

  li {
    background-color: ${({ theme }) =>
      theme.isDark ? "rgba(40, 40, 60, 0.8)" : "rgba(240, 240, 250, 0.9)"};
    padding: 0.45rem 0.9rem;
    border-radius: 8px;
    font-weight: 600;
    color: ${({ theme }) => theme.text};  /* Make sure text color is themed */
    display: flex;
    align-items: center;
    gap: 0.5rem;
    box-shadow: ${({ theme }) =>
      theme.isDark
        ? "0 2px 6px rgba(0, 0, 0, 0.5)"
        : "0 2px 6px rgba(0, 0, 0, 0.1)"};
    user-select: text;

    /* If city name is a link or span inside li, style it explicitly */
    span,
    a {
      color: ${({ theme }) => theme.text} !important; /* force themed color */
      text-decoration: none;  /* remove underline */
      cursor: default;

      &:hover,
      &:focus {
        text-decoration: underline; /* optional on hover/focus */
      }
    }
  }

  button.remove-btn {
    background: transparent;
    border: none;
    color: red;
    cursor: pointer;
    font-size: 1.3rem;
    line-height: 1;
    margin-left: 6px;
  }
`;
