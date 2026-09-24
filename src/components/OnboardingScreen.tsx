import { motion, useReducedMotion } from "framer-motion";
import { IconPin, IconSearch } from "./Icons";

interface Props {
  status: "idle" | "locating" | "denied" | "error" | "unsupported";
  onAllow: () => void;
  onChooseCity: () => void;
}

export default function OnboardingScreen({ status, onAllow, onChooseCity }: Props) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-8"
      style={{ background: "var(--paper)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="pointer-events-none absolute inset-0 halftone opacity-50" aria-hidden="true" />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute left-[12%] top-[24%] text-3xl text-[var(--comic-red)]/40"
        animate={reducedMotion ? undefined : { y: [0, -18, 0], rotate: [0, 12, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        ✦
      </motion.span>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute right-[14%] top-[35%] h-8 w-3 rotate-45 rounded-full border-[2.5px] border-[var(--ink)]/30"
        animate={reducedMotion ? undefined : { y: [0, 24, 0], rotate: [45, 32, 45] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
      />
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[24%] left-[22%] text-xl text-[var(--comic-blue)]/60"
        animate={reducedMotion ? undefined : { y: [0, -12, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      >
        +
      </motion.span>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex flex-col items-center text-center max-w-sm"
      >
        <div className="relative mb-10">
          <div className="w-20 h-20 rounded-full bg-[var(--comic-yellow)] border-[3px] border-[var(--ink)] comic-shadow flex items-center justify-center text-[var(--ink)]">
            <IconPin className="w-8 h-8" />
          </div>
          {status === "idle" && (
            <span className="absolute inset-0 rounded-full border-[3px] border-[var(--ink)]/40 pulse-ring" />
          )}
        </div>

        <h2 className="comic-title text-[var(--ink)] text-3xl md:text-4xl tracking-wide mb-4">
          WEATHER, WHERE YOU ARE
        </h2>
        <p className="comic-body text-[var(--ink)]/60 text-[15px] leading-relaxed font-bold mb-12">
          We asked for your location as you arrived so the sky matches your street.
          A rough network estimate is used only if needed — nothing ever leaves your device.
        </p>

        {status === "denied" && (
          <p className="comic-body text-[var(--comic-red)] text-sm font-bold mb-6 -mt-6">
            Location access is blocked. You can enable it in your browser settings —
            or simply search for your city.
          </p>
        )}
        {status === "error" && (
          <p className="comic-body text-[var(--comic-red)] text-sm font-bold mb-6 -mt-6">
            Couldn't get precise location. We'll try a rough network estimate, or you can search for your city.
          </p>
        )}
        {status === "unsupported" && (
          <p className="comic-body text-[var(--comic-red)] text-sm font-bold mb-6 -mt-6">
            Your browser doesn't support precise location. We'll try a rough network estimate, or search for your city.
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onAllow}
          disabled={status === "locating"}
          className="comic-body comic-press w-full max-w-xs py-3.5 rounded-full bg-[var(--comic-yellow)] border-[3px] border-[var(--ink)] comic-shadow text-[var(--ink)] text-[15px] font-bold tracking-wide flex items-center justify-center gap-2.5 disabled:opacity-60 mb-4 cursor-pointer"
        >
          {status === "locating" ? (
            <span className="flex items-center gap-2.5">
              <Spinner /> Finding you…
            </span>
          ) : (
            <>
              <IconPin className="w-[18px] h-[18px]" />
              {status === "denied" || status === "error" ? "Try again" : "Allow location"}
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={onChooseCity}
          className="comic-body comic-press w-full max-w-xs py-3.5 rounded-full bg-white border-[3px] border-[var(--ink)] comic-shadow-sm text-[var(--ink)]/75 text-[15px] font-bold tracking-wide flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <IconSearch className="w-[18px] h-[18px]" /> Choose a city instead
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export function Spinner() {
  return (
    <motion.span
      className="inline-block w-4 h-4 rounded-full border-[1.5px] border-current border-t-transparent"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
    />
  );
}
