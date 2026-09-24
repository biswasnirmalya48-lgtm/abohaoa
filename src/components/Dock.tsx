import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { IconBookmark, IconRefresh, IconSearch, IconSettings } from "./Icons";
import { Spinner } from "./OnboardingScreen";

interface Props {
  hidden?: boolean;
  refreshing?: boolean;
  savedCount?: number;
  onSearch: () => void;
  onSaved: () => void;
  onRefresh: () => void;
  onSettings: () => void;
}

/**
 * Floating thumb-zone dock. Springs in on load, animates away when the forecast
 * sheet is expanded or another overlay is open.
 */
export default function Dock({
  hidden = false,
  refreshing = false,
  savedCount = 0,
  onSearch,
  onSaved,
  onRefresh,
  onSettings,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={
        hidden
          ? { opacity: 0, y: 30, scale: 0.9, pointerEvents: "none" }
          : { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" }
      }
      transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.8 }}
      className="fixed z-[35] left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2.5 py-2 rounded-full panel"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
    >
      <DockButton label="Search city" onClick={onSearch}>
        <IconSearch className="w-[19px] h-[19px]" />
      </DockButton>

      <DockButton label="Saved locations" onClick={onSaved}>
        <IconBookmark className="w-[19px] h-[19px]" />
        {savedCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--comic-red)] border-2 border-[var(--ink)] text-[9px] font-bold text-white flex items-center justify-center">
            {savedCount}
          </span>
        )}
      </DockButton>

      <DockButton label="Refresh weather" onClick={onRefresh}>
        {refreshing ? <Spinner /> : <IconRefresh className="w-[19px] h-[19px]" />}
      </DockButton>

      <DockButton label="Settings" onClick={onSettings}>
        <IconSettings className="w-[19px] h-[19px]" />
      </DockButton>
    </motion.div>
  );
}

function DockButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.86 }}
      whileHover={{ scale: 1.06 }}
      onClick={onClick}
      aria-label={label}
      className="relative w-11 h-11 rounded-full bg-[var(--comic-yellow)] border-[2.5px] border-[var(--ink)] comic-shadow-sm text-[var(--ink)] flex items-center justify-center cursor-pointer comic-press"
    >
      {children}
    </motion.button>
  );
}
