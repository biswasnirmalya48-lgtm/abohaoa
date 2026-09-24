import { AnimatePresence, motion } from "framer-motion";
import { IconPin, IconSearch } from "./Icons";

interface Props {
  placeName: string;
  isCurrentLocation: boolean;
  locating?: boolean;
  offline: boolean;
  demo: boolean;
  lastUpdated: number | null;
  onSearch: () => void;
}

/**
 * Minimal, thumb-friendly header: an animated pin + tappable place name that
 * opens search, with a compact status row underneath.
 */
export default function TopBar({
  placeName,
  isCurrentLocation,
  locating = false,
  offline,
  demo,
  lastUpdated,
  onSearch,
}: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 flex items-center gap-3 px-4 md:px-8 safe-top"
    >
      {/* animated location pin */}
      <motion.button
        onClick={onSearch}
        whileTap={{ scale: 0.9 }}
        aria-label="Change location"
        className="relative shrink-0 w-11 h-11 rounded-full glass glass-text flex items-center justify-center cursor-pointer press-ring"
      >
        <motion.span
          animate={
            locating
              ? { scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }
              : isCurrentLocation
                ? { y: [0, -2, 0] }
                : undefined
          }
          transition={{ duration: locating ? 1 : 2.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center justify-center"
        >
          <IconPin className={`w-[19px] h-[19px] ${isCurrentLocation ? "text-emerald-200" : "text-white/85"}`} />
        </motion.span>
        {isCurrentLocation && (
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-[#0a1020]" />
        )}
      </motion.button>

      {/* place name (tap to search) + status */}
      <button
        onClick={onSearch}
        className="flex flex-col items-start min-w-0 flex-1 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-1.5 max-w-full">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={placeName}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-white text-[19px] md:text-2xl font-semibold tracking-tight text-glow truncate"
            >
              {placeName}
            </motion.h1>
          </AnimatePresence>
          <motion.span
            aria-hidden="true"
            className="text-white/35 group-hover:text-white/70 transition-colors shrink-0"
          >
            <IconSearch className="w-3.5 h-3.5" />
          </motion.span>
        </div>

        <div className="flex items-center gap-2 mt-1 min-h-[16px]">
          <AnimatePresence initial={false}>
            {locating ? (
              <motion.span
                key="locating"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-medium tracking-wide text-emerald-200/80"
              >
                Finding you…
              </motion.span>
            ) : offline ? (
              <motion.span
                key="offline"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="text-[11px] font-medium tracking-wide text-amber-200/80"
              >
                Offline{lastUpdated ? ` · ${fmtTime(lastUpdated)}` : ""}
              </motion.span>
            ) : (
              <motion.span
                key="live"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-[11px] font-medium tracking-wide text-white/45"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-300/90" />
                  <span className="absolute inset-0 rounded-full bg-emerald-300/60 pulse-ring" />
                </span>
                Live
              </motion.span>
            )}
          </AnimatePresence>
          {demo && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-[9px] tracking-[0.16em] uppercase text-white/50 border border-white/20 rounded-full px-1.5 py-[1px]"
            >
              Demo
            </motion.span>
          )}
        </div>
      </button>
    </motion.header>
  );
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
