import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { City } from "../types/weather";
import { searchCities } from "../services/weatherApi";
import { useAppStore } from "../store/useAppStore";
import { IconClose, IconPin, IconSearch, IconStar } from "./Icons";
import { Spinner } from "./OnboardingScreen";
import BottomSheet from "./BottomSheet";

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
      setTimeout(() => inputRef.current?.focus(), 380);
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

  const row = (city: City, i: number, sub?: string) => (
    <motion.div
      key={city.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i * 0.035, 0.3), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center"
    >
      <motion.button
        whileTap={{ scale: 0.98, backgroundColor: "rgba(255,255,255,0.08)" }}
        onClick={() => onSelectCity(city)}
        className="flex-1 flex items-center gap-3.5 py-3.5 px-3 text-left rounded-2xl cursor-pointer min-w-0"
      >
        <IconPin className="w-[18px] h-[18px] text-white/40 shrink-0" />
        <span className="flex flex-col min-w-0">
          <span className="text-white text-[15px] font-medium truncate">{city.name}</span>
          <span className="text-white/40 text-[12px] font-light truncate">
            {sub ?? [city.state, city.country].filter(Boolean).join(", ")}
          </span>
        </span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.8, rotate: -20 }}
        onClick={() => toggleSaved(city)}
        aria-label={isSaved(city) ? `Remove ${city.name} from saved` : `Save ${city.name}`}
        className={`p-2.5 rounded-full cursor-pointer ${isSaved(city) ? "text-amber-300" : "text-white/25 hover:text-white/60"}`}
      >
        <motion.span animate={{ scale: isSaved(city) ? 1 : 0.92 }} className="block">
          <IconStar className="w-[18px] h-[18px]" filled={isSaved(city)} />
        </motion.span>
      </motion.button>
    </motion.div>
  );

  return (
    <BottomSheet open={open} onClose={onClose} bare maxHeight="92vh">
      <div className="sticky top-0 z-10 px-4 pt-1 pb-3 bg-[rgba(9,18,30,0.6)] backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 h-12 rounded-full bg-white/[0.07] border border-white/10">
          <IconSearch className="w-[18px] h-[18px] text-white/45 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search any city…"
            className="flex-1 bg-transparent outline-none text-white text-[16px] font-light placeholder:text-white/35"
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => setQuery("")}
                aria-label="Clear"
                className="text-white/40 hover:text-white/80 p-1 cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="px-3 pb-6">
        {query.trim() === "" ? (
          <>
            {geoAvailable && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                whileTap={{ scale: 0.98 }}
                onClick={onUseCurrentLocation}
                className="w-full flex items-center gap-3.5 py-3.5 px-3 rounded-2xl bg-white/[0.05] text-left cursor-pointer mb-2"
              >
                <span className="relative flex w-[18px] h-[18px] items-center justify-center shrink-0">
                  <IconPin className="w-[18px] h-[18px] text-emerald-300" />
                </span>
                <span className="text-white/90 text-[15px] font-medium">Use my current location</span>
              </motion.button>
            )}
            {recentSearches.length > 0 && (
              <>
                <SectionLabel>Recent</SectionLabel>
                {recentSearches.map((c, i) => row(c, i))}
              </>
            )}
            {savedCities.length > 0 && (
              <>
                <SectionLabel>Saved</SectionLabel>
                {savedCities.map((c, i) => row(c, i))}
              </>
            )}
            {recentSearches.length === 0 && savedCities.length === 0 && !geoAvailable && (
              <p className="text-white/35 text-[13px] font-light px-2 py-8 text-center">
                Type the name of a city to begin.
              </p>
            )}
          </>
        ) : searching ? (
          <div className="flex justify-center py-12 text-white/50">
            <Spinner />
          </div>
        ) : error ? (
          <p className="text-red-200/70 text-[13px] font-light px-2 py-8 text-center">{error}</p>
        ) : results.length === 0 ? (
          <p className="text-white/40 text-[13px] font-light px-2 py-8 text-center">
            No cities found for “{query.trim()}”
          </p>
        ) : (
          results.map((c, i) => row(c, i))
        )}
      </div>
    </BottomSheet>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="text-white/35 text-[11px] tracking-[0.16em] uppercase font-semibold px-3 pt-4 pb-1">
      {children}
    </p>
  );
}
