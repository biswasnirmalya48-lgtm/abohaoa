import type { WeatherData } from "../types/weather";
import { localHour } from "./units";

export type SceneKind =
  | "clear"
  | "partly"
  | "cloudy"
  | "overcast"
  | "rain"
  | "heavy-rain"
  | "thunder"
  | "snow"
  | "fog";

export interface CelestialBody {
  /** 0..100 horizontal position, percent */
  x: number;
  /** 0..100 vertical position from top, percent */
  y: number;
  color: string;
  isMoon: boolean;
}

export interface Scene {
  key: string;
  kind: SceneKind;
  isNight: boolean;
  hot: boolean;
  cold: boolean;
  /** top → mid → bottom gradient stops */
  sky: [string, string, string];
  celestial: CelestialBody | null;
  stars: boolean;
  /** number of moving cloud layers 0..3 */
  cloudLayers: number;
  cloudOpacity: number;
  precip: "none" | "rain" | "heavy" | "snow";
  fog: boolean;
  lightning: boolean;
  haze: boolean;
  /** local hour (fractional) at the location */
  hour: number;
}

type Palette = [string, string, string];

const PALETTES: Record<SceneKind, { day: Palette; night: Palette }> = {
  clear: {
    day: ["#2f6db5", "#5f9ad6", "#a8cfe8"],
    night: ["#070b1c", "#101736", "#1e2a4f"],
  },
  partly: {
    day: ["#3d6f9f", "#6f9cc4", "#b3cede"],
    night: ["#0a1024", "#182140", "#2a3657"],
  },
  cloudy: {
    day: ["#4a6a86", "#71899e", "#a5b7c4"],
    night: ["#0d1220", "#1a2131", "#2c3444"],
  },
  overcast: {
    day: ["#4d5b6a", "#6b7887", "#939da9"],
    night: ["#10141b", "#1d232c", "#333b45"],
  },
  rain: {
    day: ["#39505f", "#54697a", "#7c8f9d"],
    night: ["#0a0f16", "#161d28", "#27303c"],
  },
  "heavy-rain": {
    day: ["#26333e", "#3c4a56", "#596873"],
    night: ["#070a0f", "#111720", "#1f2731"],
  },
  thunder: {
    day: ["#22262f", "#363d4e", "#4e566a"],
    night: ["#080a10", "#141824", "#232a3a"],
  },
  snow: {
    day: ["#5f7a94", "#87a0b5", "#b9c9d6"],
    night: ["#101725", "#1f2b40", "#37475f"],
  },
  fog: {
    day: ["#67717a", "#8b939a", "#adb3b8"],
    night: ["#12151a", "#1f242b", "#343a42"],
  },
};

function kindFromWeatherId(id: number, main: string): SceneKind {
  if (id >= 200 && id < 300) return "thunder";
  if (id >= 600 && id < 700) return "snow";
  if (id === 701 || id === 741) return "fog";
  if (id >= 700 && id < 800) return "fog";
  if (id >= 500 && id < 600) {
    if (id === 500 || id === 520) return "rain";
    return "heavy-rain";
  }
  if (id >= 300 && id < 400) return "rain";
  if (id === 800) return "clear";
  if (id === 801 || id === 802) return "partly";
  if (id === 803) return "cloudy";
  void main;
  return "overcast";
}

const CLOUD_OPACITY: Record<SceneKind, number> = {
  clear: 0,
  partly: 0.55,
  cloudy: 0.8,
  overcast: 1,
  rain: 0.85,
  "heavy-rain": 0.95,
  thunder: 0.95,
  snow: 0.75,
  fog: 0.5,
};

const CLOUD_LAYERS: Record<SceneKind, number> = {
  clear: 0,
  partly: 2,
  cloudy: 3,
  overcast: 3,
  rain: 3,
  "heavy-rain": 3,
  thunder: 3,
  snow: 2,
  fog: 1,
};

/**
 * Derives the full visual scene from live weather data: condition, local time,
 * temperature, sun position. Pure function — cheap enough to run per render.
 */
export function deriveScene(data: WeatherData): Scene {
  const { current, timezoneOffset } = data;
  const hour = localHour(current.dt, timezoneOffset);
  const isNight = current.dt < current.sunrise || current.dt > current.sunset;
  const kind = kindFromWeatherId(current.weather.id, current.weather.main);
  const hot = current.temp >= 30 && (kind === "clear" || kind === "partly" || kind === "cloudy");
  const cold = current.temp <= 0;

  const celestial = computeCelestial(data, isNight, kind);

  let precip: Scene["precip"] = "none";
  if (kind === "rain") precip = "rain";
  if (kind === "heavy-rain" || kind === "thunder") precip = "heavy";
  if (kind === "snow") precip = "snow";
  if (cold && precip === "heavy") precip = "snow";

  return {
    key: `${kind}-${isNight ? "n" : "d"}${hot ? "-hot" : ""}`,
    kind,
    isNight,
    hot,
    cold,
    sky: isNight ? PALETTES[kind].night : PALETTES[kind].day,
    celestial,
    stars: isNight && (kind === "clear" || kind === "partly"),
    cloudLayers: CLOUD_LAYERS[kind],
    cloudOpacity: CLOUD_OPACITY[kind],
    precip,
    fog: kind === "fog" || kind === "overcast",
    lightning: kind === "thunder",
    haze: hot,
    hour,
  };
}

function computeCelestial(data: WeatherData, isNight: boolean, kind: SceneKind): CelestialBody | null {
  if (kind === "heavy-rain" || kind === "thunder" || kind === "overcast") return null;
  const { current, daily } = data;

  if (!isNight) {
    const span = Math.max(current.sunset - current.sunrise, 1);
    const p = Math.min(Math.max((current.dt - current.sunrise) / span, 0), 1);
    return {
      x: 10 + p * 80,
      y: 68 - Math.sin(p * Math.PI) * 52,
      color: kind === "fog" ? "rgba(255,236,200,0.5)" : "rgba(255,224,170,0.9)",
      isMoon: false,
    };
  }

  const tomorrow = daily[1];
  const moonrise = current.sunset;
  const moonset = tomorrow ? tomorrow.sunrise : current.sunrise + 86400;
  const span = Math.max(moonset - moonrise, 1);
  const p = Math.min(Math.max((current.dt - moonrise) / span, 0), 1);
  return {
    x: 12 + p * 76,
    y: 64 - Math.sin(p * Math.PI) * 46,
    color: "rgba(220,230,255,0.92)",
    isMoon: true,
  };
}

/** Screen-space wind vector: meteorological deg = where wind comes FROM. */
export function windVector(deg: number, speedMs: number): { vx: number; vy: number } {
  const rad = ((deg + 180) % 360) * (Math.PI / 180);
  const strength = Math.min(speedMs, 25);
  return { vx: Math.sin(rad) * strength, vy: Math.cos(rad) * strength * 0.06 };
}
