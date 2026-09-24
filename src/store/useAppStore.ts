import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ActiveTarget, City, WeatherData } from "../types/weather";
import type { SpeedUnit, TempUnit } from "../lib/units";

export type AnimationIntensity = "low" | "normal" | "high";
export type ThemePreference = "auto" | "dark" | "light";

export interface Settings {
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
  animation: AnimationIntensity;
  theme: ThemePreference;
  demoMode: boolean;
  /** "current" or a saved City id */
  defaultLocation: string;
}

interface AppState {
  settings: Settings;
  savedCities: City[];
  recentSearches: City[];
  active: ActiveTarget;
  hasCompletedOnboarding: boolean;

  setSettings: (patch: Partial<Settings>) => void;
  setActive: (target: ActiveTarget) => void;
  toggleSaved: (city: City) => void;
  isSaved: (city: City) => boolean;
  removeSaved: (id: string) => void;
  addRecent: (city: City) => void;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: {
        tempUnit: "c",
        speedUnit: "kmh",
        animation: "normal",
        theme: "dark",
        demoMode: false,
        defaultLocation: "current",
      },
      savedCities: [],
      recentSearches: [],
      active: { type: "current" },
      hasCompletedOnboarding: false,

      setSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      setActive: (target) => set({ active: target }),
      toggleSaved: (city) =>
        set((s) => {
          const exists = s.savedCities.some((c) => c.id === city.id);
          return {
            savedCities: exists
              ? s.savedCities.filter((c) => c.id !== city.id)
              : [...s.savedCities, city],
          };
        }),
      isSaved: (city) => get().savedCities.some((c) => c.id === city.id),
      removeSaved: (id) => set((s) => ({ savedCities: s.savedCities.filter((c) => c.id !== id) })),
      addRecent: (city) =>
        set((s) => ({
          recentSearches: [city, ...s.recentSearches.filter((c) => c.id !== city.id)].slice(0, 6),
        })),
      completeOnboarding: () => set({ hasCompletedOnboarding: true }),
    }),
    { name: "abohaoa:settings" },
  ),
);

/** Last-known weather cache per location, for the offline view. */
const CACHE_PREFIX = "abohaoa:cache:";

export function cacheKeyFor(lat: number, lon: number): string {
  return `${CACHE_PREFIX}${lat.toFixed(2)},${lon.toFixed(2)}`;
}

export function readWeatherCache(lat: number, lon: number): WeatherData | null {
  try {
    const raw = localStorage.getItem(cacheKeyFor(lat, lon));
    return raw ? (JSON.parse(raw) as WeatherData) : null;
  } catch {
    return null;
  }
}

export function writeWeatherCache(lat: number, lon: number, data: WeatherData): void {
  try {
    localStorage.setItem(cacheKeyFor(lat, lon), JSON.stringify(data));
  } catch {
    // storage full or unavailable — cache is best-effort
  }
}
