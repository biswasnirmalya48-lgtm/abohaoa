import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import LoadingScreen from "./components/LoadingScreen";
import OnboardingScreen from "./components/OnboardingScreen";
import MainScreen from "./components/MainScreen";
import { useGeolocation } from "./hooks/useGeolocation";
import { useAppStore } from "./store/useAppStore";

type Stage = "loading" | "onboarding" | "app";

export default function App() {
  const geo = useGeolocation();
  const [stage, setStage] = useState<Stage>("loading");
  const [pendingSearch, setPendingSearch] = useState(false);

  const settings = useAppStore((s) => s.settings);
  const savedCities = useAppStore((s) => s.savedCities);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const setActive = useAppStore((s) => s.setActive);

  // minimum splash duration for a calm entrance
  const [splashDone, setSplashDone] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSplashDone(true), 2300);
    return () => clearTimeout(t);
  }, []);

  // ask for location automatically the moment a first-time visitor enters
  const [autoAsked, setAutoAsked] = useState(false);
  useEffect(() => {
    if (autoAsked || hasCompletedOnboarding) return;
    setAutoAsked(true);
    void geo.request();
  }, [autoAsked, hasCompletedOnboarding, geo.request]);

  // don't sit on the splash forever if the permission prompt is ignored
  const [locatingTimedOut, setLocatingTimedOut] = useState(false);
  useEffect(() => {
    if (geo.status !== "locating") return;
    const t = setTimeout(() => setLocatingTimedOut(true), 10000);
    return () => clearTimeout(t);
  }, [geo.status]);

  // decide where to go after the splash
  useEffect(() => {
    if (!splashDone || stage !== "loading") return;
    if (geo.status === "locating" && !locatingTimedOut) return;
    if (hasCompletedOnboarding || geo.status === "granted") {
      if (!hasCompletedOnboarding) completeOnboarding();
      setStage("app");
    } else {
      setStage("onboarding");
    }
  }, [splashDone, stage, hasCompletedOnboarding, geo.status, locatingTimedOut, completeOnboarding]);

  // permission approved late (native prompt answered on any screen) → enter the app
  useEffect(() => {
    if (geo.status === "granted" && geo.coords && stage !== "app") {
      if (!hasCompletedOnboarding) completeOnboarding();
      setStage("app");
    }
  }, [geo.status, geo.coords, stage, hasCompletedOnboarding, completeOnboarding]);

  // apply stored default location once when entering the app
  const [appliedDefault, setAppliedDefault] = useState(false);
  useEffect(() => {
    if (stage !== "app" || appliedDefault) return;
    setAppliedDefault(true);
    const id = settings.defaultLocation;
    if (id !== "current") {
      const city = savedCities.find((c) => c.id === id);
      if (city) setActive({ type: "city", city });
    }
  }, [stage, appliedDefault, settings.defaultLocation, savedCities, setActive]);

  // theme preference → root attribute (affects glass surfaces)
  useEffect(() => {
    const resolve = () => {
      if (settings.theme === "auto") {
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
      }
      return settings.theme;
    };
    document.documentElement.dataset.theme = resolve();
    const mq = window.matchMedia("(prefers-color-scheme: light)");
    const onChange = () => {
      if (settings.theme === "auto") document.documentElement.dataset.theme = resolve();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [settings.theme]);

  const handleAllow = async () => {
    const coords = await geo.request();
    if (coords) {
      completeOnboarding();
      setStage("app");
    }
  };

  return (
    <div className="h-dvh w-full">
      {stage === "app" && (
        <MainScreen
          geoStatus={geo.status}
          geoCoords={geo.coords}
          onRequestLocation={geo.request}
          initialSearchOpen={pendingSearch}
        />
      )}

      <AnimatePresence>
        {stage === "loading" && <LoadingScreen key="splash" />}
        {stage === "onboarding" && (
          <OnboardingScreen
            key="onboarding"
            status={
              geo.status === "granted" ? "idle" : geo.status === "locating" ? "locating" : geo.status
            }
            onAllow={() => void handleAllow()}
            onChooseCity={() => {
              completeOnboarding();
              setPendingSearch(true);
              setStage("app");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
