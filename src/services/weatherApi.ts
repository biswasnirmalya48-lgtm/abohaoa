import type { City, WeatherData } from "../types/weather";
import { MOCK_CITIES, mockSearch, mockWeather } from "./mockWeather";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY as string | undefined;
const BASE = "https://api.openweathermap.org";

export const hasApiKey = Boolean(API_KEY && API_KEY.trim() && !API_KEY.includes("your_"));
export const demoForced = new URLSearchParams(window.location.search).has("demo");

export function isDemoMode(settingDemo: boolean): boolean {
  return demoForced || settingDemo || !hasApiKey;
}

export class WeatherError extends Error {
  constructor(message: string, public readonly retryable: boolean) {
    super(message);
    this.name = "WeatherError";
  }
}

interface LegacyCurrentResponse {
  dt: number;
  main: { temp: number; feels_like: number; humidity: number };
  wind: { speed: number; deg: number };
  sys: { sunrise: number; sunset: number };
  visibility?: number;
  weather: { id: number; main: string; description: string; icon: string }[];
  coord: { lat: number; lon: number };
  timezone: number;
}

interface LegacyForecastItem {
  dt: number;
  main: { temp: number; temp_min: number; temp_max: number; humidity: number };
  pop?: number;
  wind: { speed: number };
  weather: { id: number; main: string; description: string; icon: string }[];
}

interface LegacyForecastResponse {
  list: LegacyForecastItem[];
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchWeather(lat: number, lon: number, demo: boolean): Promise<WeatherData> {
  if (demo) {
    await delay(350 + Math.random() * 450);
    return mockWeather(lat, lon);
  }

  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    units: "metric",
    appid: API_KEY ?? "",
  });
  try {
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`${BASE}/data/2.5/weather?${params}`),
      fetch(`${BASE}/data/2.5/forecast?${params}`),
    ]);
    if (currentRes.status === 401 || forecastRes.status === 401) {
      throw new WeatherError("Invalid API key. Check VITE_WEATHER_API_KEY in your .env file.", false);
    }
    if (currentRes.status === 429 || forecastRes.status === 429) {
      throw new WeatherError("API call limit reached for today. Try again later.", true);
    }
    if (!currentRes.ok || !forecastRes.ok) {
      const status = !currentRes.ok ? currentRes.status : forecastRes.status;
      throw new WeatherError(`Weather service error (${status}). Please retry.`, true);
    }
    const current = (await currentRes.json()) as LegacyCurrentResponse;
    const forecast = (await forecastRes.json()) as LegacyForecastResponse;
    return mapLegacyWeather(current, forecast.list);
  } catch (error) {
    if (error instanceof WeatherError) throw error;
    throw new WeatherError("Network unavailable. Check your connection and retry.", true);
  }
}

function mapLegacyWeather(current: LegacyCurrentResponse, forecast: LegacyForecastItem[]): WeatherData {
  const weatherInfo = (items: LegacyForecastItem["weather"]) => items[0];
  const hourly = forecast.slice(0, 16).map((item) => ({
    dt: item.dt,
    temp: item.main.temp,
    pop: item.pop ?? 0,
    weather: weatherInfo(item.weather),
  }));

  const days = new Map<string, LegacyForecastItem[]>();
  for (const item of forecast) {
    const day = new Date((item.dt + current.timezone) * 1000).toISOString().slice(0, 10);
    const entries = days.get(day) ?? [];
    entries.push(item);
    days.set(day, entries);
  }

  const daily = [...days.values()].slice(0, 5).map((items) => {
    const first = items[0];
    const min = Math.min(...items.map((item) => item.main.temp_min));
    const max = Math.max(...items.map((item) => item.main.temp_max));
    const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
    return {
      dt: first.dt,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      min,
      max,
      pop: Math.max(...items.map((item) => item.pop ?? 0)),
      humidity: average(items.map((item) => item.main.humidity)),
      windSpeed: average(items.map((item) => item.wind.speed)),
      uvi: 0,
      weather: weatherInfo(items[Math.floor(items.length / 2)].weather),
    };
  });

  return {
    lat: current.coord.lat,
    lon: current.coord.lon,
    timezone: "OpenWeather",
    timezoneOffset: current.timezone,
    fetchedAt: Date.now(),
    current: {
      dt: current.dt,
      sunrise: current.sys.sunrise,
      sunset: current.sys.sunset,
      temp: current.main.temp,
      feelsLike: current.main.feels_like,
      humidity: current.main.humidity,
      windSpeed: current.wind.speed,
      windDeg: current.wind.deg,
      uvi: 0,
      visibility: current.visibility ?? 10000,
      weather: weatherInfo(current.weather),
    },
    hourly,
    daily,
  };
}

export async function searchCities(query: string, demo: boolean): Promise<City[]> {
  if (demo) {
    await delay(120 + Math.random() * 180);
    return mockSearch(query);
  }
  const url = `${BASE}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new WeatherError(`City search failed (${res.status}).`, true);
  const json = (await res.json()) as {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
  }[];
  return json.map((c) => ({
    id: `${c.lat.toFixed(3)},${c.lon.toFixed(3)}`,
    name: c.name,
    country: c.country,
    state: c.state,
    lat: c.lat,
    lon: c.lon,
  }));
}

/** Resolve a human-friendly place name for coordinates (used for "current location"). */
export async function reverseGeocode(
  lat: number,
  lon: number,
  demo: boolean,
): Promise<{ name: string; country: string }> {
  if (demo) {
    let best: { name: string; country: string; d: number } | null = null;
    for (const c of MOCK_CITIES) {
      const d = Math.hypot(c.lat - lat, c.lon - lon);
      if (!best || d < best.d) best = { name: c.name, country: c.country, d };
    }
    return best && best.d < 2.5
      ? { name: best.name, country: best.country }
      : { name: "Current location", country: "" };
  }
  try {
    const url = `${BASE}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return { name: "Current location", country: "" };
    const json = (await res.json()) as { name: string; country: string }[];
    return json[0] ?? { name: "Current location", country: "" };
  } catch {
    return { name: "Current location", country: "" };
  }
}
