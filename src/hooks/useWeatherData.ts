import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates, WeatherData } from "../types/weather";
import { WeatherError, fetchWeather } from "../services/weatherApi";
import { readWeatherCache, writeWeatherCache } from "../store/useAppStore";

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  errorRetryable: boolean;
  /** true when showing cached data because the network failed */
  offline: boolean;
  isDemo: boolean;
  refresh: () => Promise<void>;
}

export function useWeatherData(
  coords: Coordinates | null,
  demo: boolean,
): WeatherState {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorRetryable, setErrorRetryable] = useState(true);
  const [offline, setOffline] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const requestSeq = useRef(0);

  const load = useCallback(
    async (lat: number, lon: number, mode: "initial" | "refresh", demoMode: boolean) => {
      const seq = ++requestSeq.current;
      if (mode === "initial") {
        setLoading(true);
        setData(null);
        setError(null);
        setOffline(false);
      } else {
        setRefreshing(true);
      }
      try {
        const fresh = await fetchWeather(lat, lon, demoMode);
        if (seq !== requestSeq.current) return;
        setData(fresh);
        setError(null);
        setOffline(false);
        setIsDemo(demoMode);
        writeWeatherCache(lat, lon, fresh);
      } catch (e) {
        if (seq !== requestSeq.current) return;
        const cached = readWeatherCache(lat, lon);
        const message =
          e instanceof WeatherError ? e.message : "Something went wrong. Please retry.";
        const retryable = e instanceof WeatherError ? e.retryable : true;
        if (cached) {
          setData(cached);
          setIsDemo(demoMode);
          setOffline(true);
          setError(null);
        } else {
          setError(message);
          setErrorRetryable(retryable);
        }
      } finally {
        if (seq === requestSeq.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  const lat = coords?.lat ?? null;
  const lon = coords?.lon ?? null;

  useEffect(() => {
    if (lat === null || lon === null) return;
    void load(lat, lon, "initial", demo);
  }, [lat, lon, demo, load]);

  const refresh = useCallback(async () => {
    if (lat === null || lon === null) return;
    await load(lat, lon, "refresh", demo);
  }, [lat, lon, demo, load]);

  return { data, loading, refreshing, error, errorRetryable, offline, isDemo, refresh };
}
