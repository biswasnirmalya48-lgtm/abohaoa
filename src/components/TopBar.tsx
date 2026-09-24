import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconBookmark, IconRefresh, IconSearch, IconSettings } from "./Icons";
import { Spinner } from "./OnboardingScreen";

interface Props {
  placeName: string;
  isCurrentLocation: boolean;
  refreshing: boolean;
  offline: boolean;
  demo: boolean;
  lastUpdated: number | null;
  onSearch: () => void;
  onSaved: () => void;
  onSettings: () => void;
  onRefresh: () => void;
}

function GlassButton({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      aria-label={label}
      className="w-10 h-10 rounded-full glass glass-text flex items-center justify-center cursor-pointer"
    >
      {children}
    </motion.button>
  );
}

export default function TopBar({
  placeName,
  isCurrentLocation,
  refreshing,
  offline,
  demo,
  lastUpdated,
  onSearch,
  onSaved,
  onSettings,
  onRefresh,
}: Props) {
  return (
    <header className="relative z-20 flex items-start justify-between px-5 md:px-8 safe-top">
      {/* left: place name */}
      <div className="flex items-center gap-3 pt-1">
        <div className="alpana-mark shrink-0" aria-hidden="true" />
        <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.h1
              key={placeName}
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="text-white text-xl md:text-2xl font-normal tracking-tight text-glow"
            >
              {placeName}
            </motion.h1>
          </AnimatePresence>
          {isCurrentLocation && (
            <span className="relative flex w-2 h-2">
              <span className="absolute inset-0 rounded-full bg-emerald-300/90" />
              <span className="absolute inset-0 rounded-full bg-emerald-300/60 pulse-ring" />
            </span>
          )}
        </div>
        <span className="bengali-kicker">Live weather</span>
        <div className="flex items-center gap-2.5">
          {demo && (
            <span className="text-[10px] tracking-[0.18em] uppercase text-white/45 border border-white/20 rounded-full px-2 py-0.5">
              Demo
            </span>
          )}
          {offline && (
            <span className="text-[10px] tracking-[0.14em] uppercase text-amber-200/80 border border-amber-200/30 rounded-full px-2 py-0.5">
              Offline
              {lastUpdated
                ? ` · ${new Date(lastUpdated).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
                : ""}
            </span>
          )}
        </div>
        </div>
      </div>

      {/* right: actions */}
      <div className="flex items-center gap-2.5 pt-1">
        <GlassButton onClick={onRefresh} label="Refresh weather">
          {refreshing ? <Spinner /> : <IconRefresh className="w-[18px] h-[18px]" />}
        </GlassButton>
        <GlassButton onClick={onSearch} label="Search city">
          <IconSearch className="w-[18px] h-[18px]" />
        </GlassButton>
        <GlassButton onClick={onSaved} label="Saved locations">
          <IconBookmark className="w-[18px] h-[18px]" />
        </GlassButton>
        <GlassButton onClick={onSettings} label="Settings">
          <IconSettings className="w-[18px] h-[18px]" />
        </GlassButton>
      </div>
    </header>
  );
}
