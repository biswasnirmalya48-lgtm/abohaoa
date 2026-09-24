import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "../types/weather";

export type GeoStatus = "idle" | "locating" | "granted" | "denied" | "error" | "unsupported";

interface GeoState {
  status: GeoStatus;
  coords: Coordinates | null;
}

interface ApproximateLocationResponse {
  latitude?: number;
  longitude?: number;
}

async function getApproximateLocation(): Promise<Coordinates | null> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch("https://ipapi.co/json/", { signal: controller.signal });
    if (!response.ok) return null;
    const result = (await response.json()) as ApproximateLocationResponse;
    if (typeof result.latitude !== "number" || typeof result.longitude !== "number") return null;
    return { lat: result.latitude, lon: result.longitude };
  } catch {
    return null;
  } finally {
    window.clearTimeout(timeout);
  }
}

/** Great-circle distance in meters (haversine). */
function distanceM(a: Coordinates, b: Coordinates): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Ignore GPS jitter smaller than this so the UI doesn't refetch constantly. */
const MIN_MOVE_METERS = 150;

export function useGeolocation() {
  const [state, setState] = useState<GeoState>({ status: "idle", coords: null });
  const watchId = useRef<number | null>(null);
  const lastCoords = useRef<Coordinates | null>(null);

  const supported = typeof navigator !== "undefined" && "geolocation" in navigator;

  /** Accept a position; background watch updates below MIN_MOVE_METERS are dropped. */
  const commit = useCallback((c: Coordinates, force = false) => {
    const prev = lastCoords.current;
    if (!force && prev && distanceM(prev, c) < MIN_MOVE_METERS) return;
    lastCoords.current = c;
    setState({ status: "granted", coords: c });
  }, []);

  const startWatching = useCallback(() => {
    if (!supported || watchId.current !== null) return;
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => commit({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {
        // keep previous coords if we already have them
        setState((s) => (s.coords ? s : { status: "error", coords: null }));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 },
    );
  }, [supported, commit]);

  const request = useCallback((): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      if (!supported) {
        void getApproximateLocation().then((coords) => {
          setState(coords ? { status: "granted", coords } : { status: "unsupported", coords: null });
          resolve(coords);
        });
        return;
      }
      setState((s) => ({ ...s, status: "locating" }));
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
          commit(coords, true);
          startWatching();
          resolve(coords);
        },
        (err) => {
          const denied = err.code === err.PERMISSION_DENIED;
          if (denied) {
            setState({ status: "denied", coords: null });
            resolve(null);
            return;
          }
          void getApproximateLocation().then((coords) => {
            setState(coords ? { status: "granted", coords } : { status: "error", coords: null });
            resolve(coords);
          });
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
      );
    });
  }, [supported, startWatching]);

  /** On mount, silently check whether permission was already granted before. */
  useEffect(() => {
    if (!supported) {
      setState({ status: "unsupported", coords: null });
      return;
    }
    let cancelled = false;
    const trySilent = async () => {
      try {
        const perm = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
        if (perm?.state === "granted" && !cancelled) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              if (cancelled) return;
              commit({ lat: pos.coords.latitude, lon: pos.coords.longitude }, true);
              startWatching();
            },
            () => undefined,
            { timeout: 8000, maximumAge: 600000 },
          );
        }
      } catch {
        // permissions API unavailable — stay idle, onboarding will ask
      }
    };
    void trySilent();
    return () => {
      cancelled = true;
    };
  }, [supported, startWatching]);

  useEffect(
    () => () => {
      if (watchId.current !== null) navigator.geolocation.clearWatch(watchId.current);
    },
    [],
  );

  return { ...state, request, supported };
}
