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
        whileTap={{ scale: 0.98, backgroundColor: "rgba(20,20,28,0.06)" }}
        onClick={() => onSelectCity(city)}
        className="flex-1 flex items-center gap-3.5 py-3.5 px-3 text-left rounded-xl cursor-pointer min-w-0"
      >
        <IconPin className="w-[18px] h-[18px] text-[var(--ink)]/45 shrink-0" />
        <span className="flex flex-col min-w-0">
          <span className="comic-body text-[var(--ink)] text-[15px] font-bold truncate">{city.name}</span>
          <span className="comic-body text-[var(--ink)]/45 text-[12px] font-bold truncate">
            {sub ?? [city.state, city.country].filter(Boolean).join(", ")}
          </span>
        </span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.8, rotate: -20 }}
        onClick={() => toggleSaved(city)}
        aria-label={isSaved(city) ? `Remove ${city.name} from saved` : `Save ${city.name}`}
        className={`p-2.5 rounded-full cursor-pointer ${isSaved(city) ? "text-[var(--comic-yellow)]" : "text-[var(--ink)]/25 hover:text-[var(--ink)]/55"}`}
      >
        <motion.span animate={{ scale: isSaved(city) ? 1 : 0.92 }} className="block">
          <IconStar className="w-[18px] h-[18px]" filled={isSaved(city)} />
        </motion.span>
      </motion.button>
    </motion.div>
  );

  return (
    <BottomSheet open={open} onClose={onClose} bare maxHeight="92vh">
      <div className="sticky top-0 z-10 px-4 pt-1 pb-3 bg-[var(--paper)] border-b-[3px] border-[var(--ink)]">
        <div className="flex items-center gap-3 px-4 h-12 rounded-full bg-white border-[2.5px] border-[var(--ink)] comic-shadow-sm">
          <IconSearch className="w-[18px] h-[18px] text-[var(--ink)]/50 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && onClose()}
            placeholder="Search any city…"
            className="comic-body flex-1 bg-transparent outline-none text-[var(--ink)] text-[16px] font-bold placeholder:text-[var(--ink)]/35"
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
                className="text-[var(--ink)]/45 hover:text-[var(--ink)] p-1 cursor-pointer"
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
                className="w-full flex items-center gap-3.5 py-3.5 px-4 rounded-xl bg-[var(--comic-yellow)] border-[2.5px] border-[var(--ink)] comic-shadow-sm text-left cursor-pointer mb-3 comic-press"
              >
                <span className="relative flex w-[18px] h-[18px] items-center justify-center shrink-0">
                  <IconPin className="w-[18px] h-[18px] text-[var(--ink)]" />
                </span>
                <span className="comic-body text-[var(--ink)] text-[15px] font-bold">Use my current location</span>
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
              <p className="comic-body text-[var(--ink)]/45 text-[13px] font-bold px-2 py-8 text-center">
                Type the name of a city to begin.
              </p>
            )}
          </>
        ) : searching ? (
          <div className="flex justify-center py-12 text-[var(--ink)]/60">
            <Spinner />
          </div>
        ) : error ? (
          <p className="comic-body text-[var(--comic-red)] text-[13px] font-bold px-2 py-8 text-center">{error}</p>
        ) : results.length === 0 ? (
          <p className="comic-body text-[var(--ink)]/45 text-[13px] font-bold px-2 py-8 text-center">
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
    <p className="comic-title text-[var(--ink)]/55 text-[13px] tracking-[0.12em] uppercase px-3 pt-4 pb-1">
      {children}
    </p>
  );
}
