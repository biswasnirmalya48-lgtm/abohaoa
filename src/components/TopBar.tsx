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
        className="relative shrink-0 w-11 h-11 rounded-full panel comic-press flex items-center justify-center cursor-pointer text-[var(--ink)]"
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
          <IconPin className={`w-[19px] h-[19px] ${isCurrentLocation ? "text-[var(--comic-red)]" : ""}`} />
        </motion.span>
        {isCurrentLocation && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[var(--comic-blue)] border-2 border-[var(--ink)]" />
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
              className="font-display text-white text-[24px] md:text-3xl leading-none truncate"
              style={{ WebkitTextStroke: "3px var(--ink)", paintOrder: "stroke fill", textShadow: "3px 3px 0 var(--ink)" }}
            >
              {placeName}
            </motion.h1>
          </AnimatePresence>
          <motion.span
            aria-hidden="true"
            className="text-white/70 group-hover:text-white transition-colors shrink-0"
          >
            <IconSearch className="w-4 h-4" />
          </motion.span>
        </div>

        <div className="flex items-center gap-2 mt-1.5 min-h-[18px]">
          <AnimatePresence initial={false}>
            {locating ? (
              <motion.span
                key="locating"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="sticker comic-body text-[10px] px-2 py-[1px] font-bold"
              >
                Finding you…
              </motion.span>
            ) : offline ? (
              <motion.span
                key="offline"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="sticker comic-body text-[10px] px-2 py-[1px] font-bold bg-[var(--comic-yellow)]"
              >
                Offline{lastUpdated ? ` · ${fmtTime(lastUpdated)}` : ""}
              </motion.span>
            ) : (
              <motion.span
                key="live"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="sticker comic-body text-[10px] px-2 py-[1px] font-bold flex items-center gap-1.5"
              >
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inset-0 rounded-full bg-[var(--comic-red)]" />
                  <span className="absolute inset-0 rounded-full bg-[var(--comic-red)]/60 pulse-ring" />
                </span>
                Live
              </motion.span>
            )}
          </AnimatePresence>
          {demo && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="sticker comic-body text-[9px] px-2 py-[1px] font-bold bg-[var(--comic-blue)]"
            >
              DEMO
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
