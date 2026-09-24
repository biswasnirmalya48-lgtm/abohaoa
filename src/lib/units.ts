export type TempUnit = "c" | "f";
export type SpeedUnit = "kmh" | "mph";

export function bengaliDigits(value: string | number): string {
  return String(value);
}

export function celsiusTo(v: number, unit: TempUnit): number {
  return unit === "f" ? v * 1.8 + 32 : v;
}

export function formatTemp(celsius: number, unit: TempUnit): string {
  return `${bengaliDigits(Math.round(celsiusTo(celsius, unit)))}°`;
}

/** Input wind speed is m/s (OpenWeatherMap metric). */
export function formatSpeed(ms: number, unit: SpeedUnit): string {
  const v = unit === "kmh" ? ms * 3.6 : ms * 2.23694;
  return `${bengaliDigits(Math.round(v))} ${unit === "kmh" ? "km/h" : "mph"}`;
}

export function formatVisibility(meters: number): string {
  const value = meters >= 1000 ? (meters / 1000).toFixed(meters >= 10000 ? 0 : 1) : Math.round(meters);
  return `${bengaliDigits(value)} ${meters >= 1000 ? "km" : "m"}`;
}

const COMPASS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

export function degToCompass(deg: number): string {
  return COMPASS[Math.round((((deg % 360) + 360) % 360) / 45) % 8];
}

/**
 * All timestamps in WeatherData are unix seconds. Formatting for a remote
 * city uses its timezoneOffset so we render local wall-clock time via UTC getters.
 */
function shifted(unixSec: number, offsetSec: number): Date {
  return new Date((unixSec + offsetSec) * 1000);
}

export function formatHour(unixSec: number, offsetSec: number): string {
  const d = shifted(unixSec, offsetSec);
  const h = d.getUTCHours();
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${bengaliDigits(h12)}${ampm}`;
}

export function formatTime(unixSec: number, offsetSec: number): string {
  const d = shifted(unixSec, offsetSec);
  const h = d.getUTCHours();
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${bengaliDigits(h12)}:${bengaliDigits(m)} ${ampm}`;
}

export function formatDayName(unixSec: number, offsetSec: number, todayDt?: number): string {
  const d = shifted(unixSec, offsetSec);
  const day = Math.floor(d.getTime() / 86400000);
  if (todayDt !== undefined) {
    const today = Math.floor(shifted(todayDt, offsetSec).getTime() / 86400000);
    if (day === today) return "Today";
    if (day === today + 1) return "Tomorrow";
  }
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function localHour(unixSec: number, offsetSec: number): number {
  return shifted(unixSec, offsetSec).getUTCHours() + shifted(unixSec, offsetSec).getUTCMinutes() / 60;
}

export function uviLabel(uvi: number): string {
  if (uvi < 3) return "Low";
  if (uvi < 6) return "Moderate";
  if (uvi < 8) return "High";
  if (uvi < 11) return "Very high";
  return "Extreme";
}
