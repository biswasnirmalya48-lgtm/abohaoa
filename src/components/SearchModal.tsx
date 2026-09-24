import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { City } from "../types/weather";
import { searchCities } from "../services/weatherApi";
import { useAppStore } from "../store/useAppStore";
import { IconClose, IconPin, IconSearch, IconStar } from "./Icons";
import { Spinner } from "./OnboardingScreen";

interface Props {
  open: boolean;
  demo: boolean;
  geoAvailable: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  onUseCurrentLocation: () => void;
}

export default function SearchModal({ open, demo, geoAvailable, onClose, onSelectCity, onUseCurrentLocation }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<City[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recentSearches = useAppStore((s) => s.recentSearches);
  const savedCities = useAppStore((s) => s.savedCities);
  const toggleSaved = useAppStore((s) => s.toggleSaved);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 320);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearching(false);
      return;
    }
    let cancelled = false;
    setSearching(true);
    setError(null);
    const t = setTimeout(async () => {
      try {
        const cities = await searchCities(q, demo);
        if (!cancelled) setResults(cities);
      } catch {
        if (!cancelled) setError("Search failed. Check your connection.");
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [query, demo]);

  const isSaved = (c: City) => savedCities.some((s) => s.id === c.id);

  const row = (city: City, sub?: string) => (
    <div key={city.id} className="group flex items-center">
      <motion.button
        whileTap={{ scale: 0.985 }}
        onClick={() => onSelectCity(city)}
        className="flex-1 flex items-center gap-3.5 py-3.5 px-2 text-left rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
      >
        <IconPin className="w-[18px] h-[18px] text-white/40 shrink-0" />
        <span className="flex flex-col min-w-0">
          <span className="text-white text-[15px] font-light truncate">{city.name}</span>
          <span className="text-white/40 text-[12px] font-light truncate">
            {sub ?? [city.state, city.country].filter(Boolean).join(", ")}
          </span>
        </span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.85 }}
        onClick={() => toggleSaved(city)}
        aria-label={isSaved(city) ? `Remove ${city.name} from saved` : `Save ${city.name}`}
        className={`p-2.5 rounded-full cursor-pointer ${isSaved(city) ? "text-amber-200" : "text-white/25 hover:text-white/60"}`}
      >
        <IconStar className="w-[17px] h-[17px]" filled={isSaved(city)} />
      </motion.button>
    </div>
  );

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[6px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-lg mx-4 mt-[10vh] md:mt-[12vh] h-fit max-h-[74vh] glass rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="flex items-center gap-3 px-5 pt-5 pb-3">
              <IconSearch className="w-[18px] h-[18px] text-white/45 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && onClose()}
                placeholder="Search any city…"
                className="flex-1 bg-transparent outline-none text-white text-[16px] font-light placeholder:text-white/35"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Close search"
                className="text-white/40 hover:text-white/80 p-1 cursor-pointer"
              >
                <IconClose className="w-[18px] h-[18px]" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto thin-scroll px-4 pb-4">
              {query.trim() === "" ? (
                <>
                  {geoAvailable && (
                    <button
                      onClick={onUseCurrentLocation}
                      className="w-full flex items-center gap-3.5 py-3.5 px-2 rounded-xl hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                    >
                      <span className="relative flex w-[18px] h-[18px] items-center justify-center shrink-0">
                        <IconPin className="w-[18px] h-[18px] text-emerald-300/90" />
                      </span>
                      <span className="text-white/90 text-[15px] font-light">Use my current location</span>
                    </button>
                  )}
                  {recentSearches.length > 0 && (
                    <>
                      <p className="text-white/35 text-[11px] tracking-[0.16em] uppercase font-light px-2 pt-4 pb-1">
                        Recent
                      </p>
                      {recentSearches.map((c) => row(c))}
                    </>
                  )}
                  {savedCities.length > 0 && (
                    <>
                      <p className="text-white/35 text-[11px] tracking-[0.16em] uppercase font-light px-2 pt-4 pb-1">
                        Saved
                      </p>
                      {savedCities.map((c) => row(c))}
                    </>
                  )}
                  {recentSearches.length === 0 && savedCities.length === 0 && !geoAvailable && (
                    <p className="text-white/35 text-[13px] font-light px-2 py-6 text-center">
                      Type the name of a city to begin.
                    </p>
                  )}
                </>
              ) : searching ? (
                <div className="flex justify-center py-10 text-white/50">
                  <Spinner />
                </div>
              ) : error ? (
                <p className="text-red-200/70 text-[13px] font-light px-2 py-6 text-center">{error}</p>
              ) : results.length === 0 ? (
                <p className="text-white/40 text-[13px] font-light px-2 py-6 text-center">
                  No cities found for “{query.trim()}”
                </p>
              ) : (
                results.map((c) => row(c))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
