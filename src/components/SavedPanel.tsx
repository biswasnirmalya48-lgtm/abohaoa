import { AnimatePresence, motion } from "framer-motion";
import type { City } from "../types/weather";
import { useAppStore } from "../store/useAppStore";
import { IconCheck, IconPin, IconTrash, IconSearch } from "./Icons";
import BottomSheet from "./BottomSheet";

interface Props {
  open: boolean;
  geoAvailable: boolean;
  activeCityId: string | null;
  activeIsCurrent: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  onUseCurrentLocation: () => void;
  onSearch: () => void;
}

export default function SavedPanel({
  open,
  geoAvailable,
  activeCityId,
  activeIsCurrent,
  onClose,
  onSelectCity,
  onUseCurrentLocation,
  onSearch,
}: Props) {
  const savedCities = useAppStore((s) => s.savedCities);
  const removeSaved = useAppStore((s) => s.removeSaved);

  return (
    <BottomSheet open={open} onClose={onClose} title="Saved locations" subtitle={`${savedCities.length} pinned`}>
      <div className="px-3 pb-6">
        {geoAvailable && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            onClick={onUseCurrentLocation}
            className="w-full flex items-center gap-3 py-3.5 px-3 rounded-2xl bg-white/[0.05] text-left cursor-pointer mb-2"
          >
            <span className="relative flex w-2.5 h-2.5 ml-1">
              <span className="absolute inset-0 rounded-full bg-emerald-300" />
              <span className="absolute inset-0 rounded-full bg-emerald-300/60 pulse-ring" />
            </span>
            <span className="flex-1 text-white text-[15px] font-medium">My location</span>
            {activeIsCurrent && <IconCheck className="w-4 h-4 text-emerald-300" />}
          </motion.button>
        )}

        {savedCities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center text-center px-6 py-10"
          >
            <div className="w-14 h-14 rounded-full bg-white/[0.06] flex items-center justify-center mb-4 text-white/40">
              <IconPin className="w-6 h-6" />
            </div>
            <p className="text-white/45 text-[13.5px] font-light leading-relaxed mb-5">
              No saved cities yet. Search for a place and tap the star to keep it here.
            </p>
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={onSearch}
              className="h-10 px-5 rounded-full bg-white/90 text-slate-900 text-[13.5px] font-semibold flex items-center gap-2 cursor-pointer"
            >
              <IconSearch className="w-4 h-4" /> Find a city
            </motion.button>
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {savedCities.map((city, i) => (
              <motion.div
                key={city.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
                transition={{ delay: i * 0.03, type: "spring", stiffness: 340, damping: 30 }}
                className="flex items-center"
              >
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectCity(city)}
                  className="flex-1 flex items-center gap-3 py-3.5 px-3 rounded-2xl hover:bg-white/[0.06] transition-colors text-left cursor-pointer min-w-0"
                >
                  <span className="w-9 h-9 rounded-full bg-white/[0.07] flex items-center justify-center shrink-0">
                    <IconPin className="w-[17px] h-[17px] text-white/60" />
                  </span>
                  <span className="flex flex-col min-w-0 flex-1">
                    <span className="text-white text-[15px] font-medium truncate">{city.name}</span>
                    <span className="text-white/40 text-[12px] font-light truncate">
                      {[city.state, city.country].filter(Boolean).join(", ")}
                    </span>
                  </span>
                  {activeCityId === city.id && <IconCheck className="w-4 h-4 text-emerald-300 shrink-0" />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.82 }}
                  onClick={() => removeSaved(city.id)}
                  aria-label={`Remove ${city.name}`}
                  className="p-3 text-white/25 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <IconTrash />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </BottomSheet>
  );
}
