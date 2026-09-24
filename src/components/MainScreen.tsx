import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { City, Coordinates } from "../types/weather";
import { useAppStore } from "../store/useAppStore";
import { isDemoMode, reverseGeocode } from "../services/weatherApi";
import { useWeatherData } from "../hooks/useWeatherData";
import { usePageVisible, usePrefersReducedMotion, useOnlineStatus } from "../hooks/useEnvironment";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import { deriveScene } from "../lib/weatherScene";
import type { GeoStatus } from "../hooks/useGeolocation";
import WeatherScene from "./scenes/WeatherScene";
import TopBar from "./TopBar";
import Hero, { HeroSkeleton } from "./Hero";
import HourlyStrip from "./HourlyStrip";
import ForecastPanel from "./ForecastPanel";
import SearchModal from "./SearchModal";
import SavedPanel from "./SavedPanel";
import SettingsPanel from "./SettingsPanel";
import ErrorState from "./ErrorState";
import { IconPin, IconSearch } from "./Icons";
import { Spinner } from "./OnboardingScreen";

interface Props {
  geoStatus: GeoStatus;
  geoCoords: Coordinates | null;
  onRequestLocation: () => Promise<Coordinates | null>;
  initialSearchOpen: boolean;
}

interface Page {
  key: string;
  name: string;
  coords: Coordinates;
  isCurrent: boolean;
  city?: City;
}

export default function MainScreen({ geoStatus, geoCoords, onRequestLocation, initialSearchOpen }: Props) {
  const settings = useAppStore((s) => s.settings);
  const active = useAppStore((s) => s.active);
  const setActive = useAppStore((s) => s.setActive);
  const savedCities = useAppStore((s) => s.savedCities);
  const addRecent = useAppStore((s) => s.addRecent);

  const demo = isDemoMode(settings.demoMode);
  const reducedMotion = usePrefersReducedMotion();
  const visible = usePageVisible();
  const online = useOnlineStatus();

  const [searchOpen, setSearchOpen] = useState(initialSearchOpen);
  const [savedOpen, setSavedOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [direction, setDirection] = useState(1);
  const [currentPlaceName, setCurrentPlaceName] = useState("My location");

  const geoReady = geoStatus === "granted" && geoCoords !== null;

  const coords: Coordinates | null =
    active.type === "current" ? (geoReady ? geoCoords : null) : { lat: active.city.lat, lon: active.city.lon };

  const weather = useWeatherData(coords, demo);
  const { data, loading, refreshing, error, errorRetryable, offline, refresh } = weather;

  // resolve a friendly name for the current location
  const nameCache = useRef<Map<string, { name: string; country: string }>>(new Map());
  useEffect(() => {
    if (active.type !== "current" || !geoCoords) return;
    const key = `${geoCoords.lat.toFixed(2)},${geoCoords.lon.toFixed(2)}`;
    const hit = nameCache.current.get(key);
    if (hit) {
      setCurrentPlaceName(hit.name);
      return;
    }
    let cancelled = false;
    void reverseGeocode(geoCoords.lat, geoCoords.lon, demo).then((r) => {
      nameCache.current.set(key, r);
      if (!cancelled) setCurrentPlaceName(r.name);
    });
    return () => {
      cancelled = true;
    };
  }, [active.type, geoCoords, demo]);

  const placeName = active.type === "city" ? active.city.name : currentPlaceName;

  // swipeable pages: visiting city (if unsaved) + my location + saved cities
  const pages = useMemo<Page[]>(() => {
    const list: Page[] = [];
    if (active.type === "city" && !savedCities.some((c) => c.id === active.city.id)) {
      list.push({
        key: `city:${active.city.id}`,
        name: active.city.name,
        coords: { lat: active.city.lat, lon: active.city.lon },
        isCurrent: false,
        city: active.city,
      });
    }
    if (geoReady && geoCoords) {
      list.push({ key: "current", name: "My location", coords: geoCoords, isCurrent: true });
    }
    for (const c of savedCities) {
      list.push({ key: `city:${c.id}`, name: c.name, coords: { lat: c.lat, lon: c.lon }, isCurrent: false, city: c });
    }
    return list;
  }, [active, savedCities, geoReady, geoCoords]);

  const activeKey =
    active.type === "current" ? "current" : `city:${active.city.id}`;
  const activeIndex = Math.max(
    pages.findIndex((p) => p.key === activeKey),
    0,
  );

  const goToPage = useCallback(
    (index: number) => {
      if (index < 0 || index >= pages.length || index === activeIndex) return;
      setDirection(index > activeIndex ? 1 : -1);
      const page = pages[index];
      setActive(page.isCurrent ? { type: "current" } : { type: "city", city: page.city! });
    },
    [pages, activeIndex, setActive],
  );

  const onSwipe = useCallback((dir: -1 | 1) => {
    setDirection(dir);
    goToPage(activeIndex + dir);
  }, [activeIndex, goToPage]);

  // keyboard arrows
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (searchOpen || savedOpen || settingsOpen) return;
      if (e.key === "ArrowRight") onSwipe(1);
      if (e.key === "ArrowLeft") onSwipe(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSwipe, searchOpen, savedOpen, settingsOpen]);

  const anyOverlayOpen = searchOpen || savedOpen || settingsOpen;
  const { pull, refreshing: pullActive } = usePullToRefresh(refresh, !anyOverlayOpen && !loading && !!coords);

  const onSelectCity = useCallback(
    (city: City) => {
      addRecent(city);
      setActive({ type: "city", city });
      setDirection(1);
      setSearchOpen(false);
    },
    [addRecent, setActive],
  );

  const onUseCurrentLocation = useCallback(async () => {
    let c = geoCoords;
    if (geoStatus !== "granted") c = await onRequestLocation();
    if (c) {
      setActive({ type: "current" });
      setDirection(-1);
      setSearchOpen(false);
      setSavedOpen(false);
    }
  }, [geoCoords, geoStatus, onRequestLocation, setActive]);

  const scene = data ? deriveScene(data) : null;
  const noLocationPrompt =
    active.type === "current" && !geoReady && !loading && geoStatus !== "locating";

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-[1] opacity-30 mix-blend-soft-light" aria-hidden="true">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,240,202,0.16),transparent_34%)]" />
        <div className="absolute -left-16 top-1/3 h-48 w-48 rounded-full border border-amber-100/20 monsoon-float" />
        <div className="absolute -right-20 top-1/2 h-64 w-64 rounded-full border border-orange-100/15 monsoon-float" style={{ animationDelay: "-2.2s" }} />
      </div>
      <WeatherScene
        scene={scene}
        windDeg={data?.current.windDeg ?? 0}
        windSpeed={data?.current.windSpeed ?? 2}
        intensity={settings.animation}
        reducedMotion={reducedMotion}
        visible={visible}
      />

      {/* pull-to-refresh indicator */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-30 pt-3 pointer-events-none"
        style={{ opacity: pullActive ? Math.min(pull / 60 || 0.6, 1) : 0, transition: "opacity 0.2s" }}
      >
        <div className="w-9 h-9 rounded-full glass flex items-center justify-center text-white/85">
          <motion.div animate={{ rotate: pullActive ? (pull / 130) * 360 : 0 }}>
            <Spinner />
          </motion.div>
        </div>
      </div>

      <motion.div
        className="relative z-10 h-full flex flex-col"
        style={{ y: pull > 0 ? pull * 0.6 : 0 }}
      >
        <TopBar
          placeName={coords ? placeName : "Abohaoa"}
          isCurrentLocation={active.type === "current" && geoReady}
          refreshing={refreshing}
          offline={offline || (!online && !!data)}
          demo={demo}
          lastUpdated={data?.fetchedAt ?? null}
          onSearch={() => setSearchOpen(true)}
          onSaved={() => setSavedOpen(true)}
          onSettings={() => setSettingsOpen(true)}
          onRefresh={() => void refresh()}
        />

        {loading || (!coords && !error) ? (
          <HeroSkeleton />
        ) : data ? (
          <>
            <Hero
              data={data}
              tempUnit={settings.tempUnit}
              direction={direction}
              onSwipe={onSwipe}
              canPrev={activeIndex > 0}
              canNext={activeIndex < pages.length - 1}
              onArrow={onSwipe}
              pageKey={activeKey}
            />
            <div className="pb-20 md:pb-16">
              <HourlyStrip data={data} tempUnit={settings.tempUnit} />
            </div>
            <ForecastPanel data={data} tempUnit={settings.tempUnit} speedUnit={settings.speedUnit} />
          </>
        ) : (
          <div className="flex-1" />
        )}
      </motion.div>

      {/* no-location fallback */}
      <AnimatePresence>
        {noLocationPrompt && !data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex items-center justify-center px-8"
          >
            <div className="glass rounded-3xl px-8 py-10 max-w-sm w-full flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-white/[0.07] flex items-center justify-center mb-6 text-white/70">
                <IconPin className="w-6 h-6" />
              </div>
              <h2 className="text-white text-lg font-light tracking-tight mb-2.5">
                No location yet
              </h2>
              <p className="text-white/50 text-[13.5px] font-light leading-relaxed mb-8">
                Allow location access for weather where you are, or pick any city in the world.
              </p>
              <div className="flex flex-col gap-2.5 w-full">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => void onUseCurrentLocation()}
                  className="h-11 rounded-full bg-white/90 text-slate-900 text-[14px] font-normal flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconPin className="w-4 h-4" /> Use my location
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSearchOpen(true)}
                  className="h-11 rounded-full glass glass-text text-[14px] font-light flex items-center justify-center gap-2 cursor-pointer"
                >
                  <IconSearch className="w-4 h-4" /> Search for a city
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && !data && (
        <ErrorState
          message={error}
          retryable={errorRetryable}
          onRetry={() => void refresh()}
          onSearch={() => setSearchOpen(true)}
        />
      )}

      <SearchModal
        open={searchOpen}
        demo={demo}
        geoAvailable={geoStatus !== "unsupported"}
        onClose={() => setSearchOpen(false)}
        onSelectCity={onSelectCity}
        onUseCurrentLocation={() => void onUseCurrentLocation()}
      />

      <div data-no-pull>
        <SavedPanel
          open={savedOpen}
          geoAvailable={geoReady}
          activeCityId={active.type === "city" ? active.city.id : null}
          activeIsCurrent={active.type === "current"}
          onClose={() => setSavedOpen(false)}
          onSelectCity={(c) => {
            setActive({ type: "city", city: c });
            setSavedOpen(false);
          }}
          onUseCurrentLocation={() => void onUseCurrentLocation()}
        />
        <SettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      </div>
    </div>
  );
}
