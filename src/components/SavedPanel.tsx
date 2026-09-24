import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { City } from "../types/weather";
import { useAppStore } from "../store/useAppStore";
import { IconCheck, IconClose, IconPin, IconTrash } from "./Icons";

interface Props {
  open: boolean;
  geoAvailable: boolean;
  activeCityId: string | null;
  activeIsCurrent: boolean;
  onClose: () => void;
  onSelectCity: (city: City) => void;
  onUseCurrentLocation: () => void;
}

export function Drawer({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[4px]" onClick={onClose} />
          <motion.aside
            data-no-pull
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
            className="absolute right-0 top-0 h-full w-full max-w-[360px] glass rounded-l-[28px] flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 safe-top pb-3">
              <h2 className="text-white text-[17px] font-normal tracking-tight">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                aria-label="Close panel"
                className="w-9 h-9 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <IconClose className="w-[17px] h-[17px]" />
              </motion.button>
            </div>
            <div className="flex-1 overflow-y-auto thin-scroll px-4 pb-8">{children}</div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SavedPanel({ open, geoAvailable, activeCityId, activeIsCurrent, onClose, onSelectCity, onUseCurrentLocation }: Props) {
  const savedCities = useAppStore((s) => s.savedCities);
  const removeSaved = useAppStore((s) => s.removeSaved);

  return (
    <Drawer open={open} onClose={onClose} title="Saved locations">
      {geoAvailable && (
        <button
          onClick={onUseCurrentLocation}
          className="w-full flex items-center gap-3 py-3.5 px-3 rounded-2xl hover:bg-white/[0.07] transition-colors text-left cursor-pointer mb-1"
        >
          <span className="relative flex w-2 h-2 ml-1">
            <span className="absolute inset-0 rounded-full bg-emerald-300/90" />
            <span className="absolute inset-0 rounded-full bg-emerald-300/60 pulse-ring" />
          </span>
          <span className="flex-1 text-white text-[15px] font-light">My location</span>
          {activeIsCurrent && <IconCheck className="w-4 h-4 text-white/70" />}
        </button>
      )}

      {savedCities.length === 0 && (
        <p className="text-white/40 text-[13px] font-light px-3 py-8 text-center leading-relaxed">
          No saved cities yet.
          <br />
          Tap the star next to a search result to keep it here.
        </p>
      )}

      {savedCities.map((city) => (
        <motion.div
          key={city.id}
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="group flex items-center"
        >
          <button
            onClick={() => onSelectCity(city)}
            className="flex-1 flex items-center gap-3 py-3.5 px-3 rounded-2xl hover:bg-white/[0.07] transition-colors text-left cursor-pointer min-w-0"
          >
            <IconPin className="w-[17px] h-[17px] text-white/40 shrink-0" />
            <span className="flex flex-col min-w-0 flex-1">
              <span className="text-white text-[15px] font-light truncate">{city.name}</span>
              <span className="text-white/40 text-[12px] font-light truncate">
                {[city.state, city.country].filter(Boolean).join(", ")}
              </span>
            </span>
            {activeCityId === city.id && <IconCheck className="w-4 h-4 text-white/70 shrink-0" />}
          </button>
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => removeSaved(city.id)}
            aria-label={`Remove ${city.name}`}
            className="p-3 text-white/25 hover:text-red-200/90 transition-colors cursor-pointer"
          >
            <IconTrash />
          </motion.button>
        </motion.div>
      ))}
    </Drawer>
  );
}
