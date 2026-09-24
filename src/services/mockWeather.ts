import type { City, DayForecast, HourForecast, WeatherData, WeatherInfo } from "../types/weather";

export const MOCK_CITIES: City[] = [
  { id: "tokyo", name: "Tokyo", country: "JP", lat: 35.6895, lon: 139.6917 },
  { id: "new-york", name: "New York", country: "US", state: "New York", lat: 40.7128, lon: -74.006 },
  { id: "london", name: "London", country: "GB", lat: 51.5074, lon: -0.1278 },
  { id: "paris", name: "Paris", country: "FR", lat: 48.8566, lon: 2.3522 },
  { id: "sydney", name: "Sydney", country: "AU", lat: -33.8688, lon: 151.2093 },
  { id: "dubai", name: "Dubai", country: "AE", lat: 25.2048, lon: 55.2708 },
  { id: "singapore", name: "Singapore", country: "SG", lat: 1.3521, lon: 103.8198 },
  { id: "san-francisco", name: "San Francisco", country: "US", state: "California", lat: 37.7749, lon: -122.4194 },
  { id: "berlin", name: "Berlin", country: "DE", lat: 52.52, lon: 13.405 },
  { id: "mumbai", name: "Mumbai", country: "IN", lat: 19.076, lon: 72.8777 },
  { id: "toronto", name: "Toronto", country: "CA", lat: 43.6532, lon: -79.3832 },
  { id: "cape-town", name: "Cape Town", country: "ZA", lat: -33.9249, lon: 18.4241 },
  { id: "seoul", name: "Seoul", country: "KR", lat: 37.5665, lon: 126.978 },
  { id: "auckland", name: "Auckland", country: "NZ", lat: -36.8485, lon: 174.7633 },
  { id: "reykjavik", name: "Reykjavík", country: "IS", lat: 64.1466, lon: -21.9426 },
  { id: "zurich", name: "Zurich", country: "CH", lat: 47.3769, lon: 8.5417 },
  { id: "oslo", name: "Oslo", country: "NO", lat: 59.9139, lon: 10.7522 },
  { id: "madrid", name: "Madrid", country: "ES", lat: 40.4168, lon: -3.7038 },
  { id: "rome", name: "Rome", country: "IT", lat: 41.9028, lon: 12.4964 },
  { id: "vancouver", name: "Vancouver", country: "CA", lat: 49.2827, lon: -123.1207 },
];

interface Profile {
  id: number;
  main: string;
  description: string;
  weight: number;
  baseUvi: number;
  pop: number;
}

const PROFILES: Profile[] = [
  { id: 800, main: "Clear", description: "clear sky", weight: 24, baseUvi: 7, pop: 0 },
  { id: 802, main: "Clouds", description: "scattered clouds", weight: 16, baseUvi: 5, pop: 0.05 },
  { id: 804, main: "Clouds", description: "overcast clouds", weight: 13, baseUvi: 3, pop: 0.1 },
  { id: 500, main: "Rain", description: "light rain", weight: 12, baseUvi: 2, pop: 0.55 },
  { id: 501, main: "Rain", description: "moderate rain", weight: 7, baseUvi: 1, pop: 0.8 },
  { id: 200, main: "Thunderstorm", description: "thunderstorm with rain", weight: 4, baseUvi: 1, pop: 0.9 },
  { id: 601, main: "Snow", description: "snow", weight: 6, baseUvi: 2, pop: 0.7 },
  { id: 741, main: "Fog", description: "fog", weight: 5, baseUvi: 1, pop: 0.15 },
];

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickWeighted(rnd: () => number): Profile {
  const total = PROFILES.reduce((s, p) => s + p.weight, 0);
  let r = rnd() * total;
  for (const p of PROFILES) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return PROFILES[0];
}

function weatherInfo(profile: Profile, isNight: boolean): WeatherInfo {
  const iconMap: Record<number, string> = {
    800: "01",
    802: "02",
    804: "04",
    500: "10",
    501: "10",
    200: "11",
    601: "13",
    741: "50",
  };
  const base = iconMap[profile.id] ?? "03";
  return {
    id: profile.id,
    main: profile.main,
    description: profile.description,
    icon: `${base}${isNight ? "n" : "d"}`,
  };
}

export function mockSearch(query: string): City[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return MOCK_CITIES.filter(
    (c) => c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q),
  ).slice(0, 6);
}

/**
 * Deterministic-ish plausible weather for any coordinate. Re-seeded hourly so
 * the demo feels alive but stays stable while browsing.
 */
export function mockWeather(lat: number, lon: number): WeatherData {
  const seed = hashString(`${lat.toFixed(1)}:${lon.toFixed(1)}`) + Math.floor(Date.now() / 3_600_000);
  const rnd = mulberry32(seed);

  const now = Math.floor(Date.now() / 1000);
  const offset = Math.round(lon / 15) * 3600;
  const localNow = now + offset;
  const dayStartUtc = localNow - (localNow % 86400) - offset; // unix of local midnight
  const hourOfDay = ((localNow % 86400) + 86400) % 86400 / 3600;

  const profile = pickWeighted(rnd);
  let effective = profile;
  const baseTemp = 29 - Math.abs(lat) * 0.45 + (rnd() - 0.5) * 6;
  if (profile.main === "Snow" && baseTemp > 2) {
    effective = PROFILES[4]; // moderate rain instead of implausible snow
  }
  if (profile.main === "Clear" && baseTemp < -12) {
    effective = PROFILES[2]; // overcast for extreme cold variety
  }

  const avg = baseTemp;
  const amp = 3 + rnd() * 3.5;
  const tempAt = (h: number) => avg - amp * Math.cos(((h - 4) / 24) * 2 * Math.PI);
  const isNightHour = (h: number) => h < 6.2 || h > 18.6;

  const sunrise = dayStartUtc + Math.round((6.1 + rnd() * 0.5) * 3600);
  const sunset = dayStartUtc + Math.round((18.4 + rnd() * 0.6) * 3600);

  const humidity =
    effective.main === "Fog" ? 92 + Math.round(rnd() * 7)
    : effective.pop > 0.5 ? 70 + Math.round(rnd() * 22)
    : 35 + Math.round(rnd() * 35);

  const windSpeed = 1 + rnd() * (effective.pop > 0.5 || effective.main === "Fog" ? 9 : 6);
  const windDeg = Math.round(rnd() * 360);
  const visibility = effective.main === "Fog" ? 600 + Math.round(rnd() * 2400) : 10000;

  const hourly: HourForecast[] = [];
  const hourStart = now - (now % 3600);
  for (let i = 0; i < 48; i++) {
    const dt = hourStart + i * 3600;
    const h = (((dt + offset) % 86400) + 86400) % 86400 / 3600;
    const drift = (rnd() - 0.5) * 1.6;
    // weather may evolve: keep profile most of the time, occasionally shift
    const roll = rnd();
    const info =
      roll > 0.92
        ? weatherInfo(PROFILES[(PROFILES.indexOf(effective) + 1) % PROFILES.length], isNightHour(h))
        : weatherInfo(effective, isNightHour(h));
    hourly.push({
      dt,
      temp: tempAt(h) + drift,
      pop: effective.pop > 0 ? Math.min(1, Math.max(0, effective.pop + (rnd() - 0.55) * 0.5)) : rnd() > 0.9 ? 0.1 : 0,
      weather: info,
    });
  }

  const daily: DayForecast[] = [];
  for (let i = 0; i < 8; i++) {
    const dt = dayStartUtc + i * 86400 + 12 * 3600;
    const dayAvg = avg + (rnd() - 0.5) * 4;
    const dayAmp = amp + (rnd() - 0.5) * 2;
    const dayProfile = i === 0 ? effective : pickWeighted(rnd);
    daily.push({
      dt,
      sunrise: sunrise + i * 86400 + Math.round((rnd() - 0.5) * 600),
      sunset: sunset + i * 86400 + Math.round((rnd() - 0.5) * 600),
      min: dayAvg - dayAmp / 2 - rnd(),
      max: dayAvg + dayAmp / 2 + rnd(),
      pop: i === 0 ? effective.pop : dayProfile.pop * (0.6 + rnd() * 0.6),
      humidity: Math.min(98, Math.max(25, humidity + Math.round((rnd() - 0.5) * 24))),
      windSpeed: Math.max(0.5, windSpeed + (rnd() - 0.5) * 5),
      uvi: Math.max(0, dayProfile.baseUvi + (rnd() - 0.5) * 3),
      weather: weatherInfo(dayProfile, false),
    });
  }

  const currentTemp = tempAt(hourOfDay) + (rnd() - 0.5) * 1.2;
  const feelsDelta =
    (effective.pop > 0.5 ? -1.4 : 0) + (windSpeed > 7 && currentTemp < 10 ? -2.5 : 0) + (currentTemp > 27 && humidity > 65 ? 2.6 : 0);

  return {
    lat,
    lon,
    timezone: "Demo/Zone",
    timezoneOffset: offset,
    fetchedAt: Date.now(),
    current: {
      dt: now,
      sunrise,
      sunset,
      temp: currentTemp,
      feelsLike: currentTemp + feelsDelta,
      humidity,
      windSpeed,
      windDeg,
      uvi: Math.max(0, effective.baseUvi * (isNightHour(hourOfDay) ? 0 : 0.8 + rnd() * 0.5)),
      visibility,
      weather: weatherInfo(effective, isNightHour(hourOfDay)),
    },
    hourly,
    daily,
  };
}
