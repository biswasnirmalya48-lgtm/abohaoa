import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import type { WeatherData } from "../types/weather";
import type { TempUnit } from "../lib/units";
import { celsiusTo, formatTemp } from "../lib/units";
import AnimatedNumber from "./AnimatedNumber";
import { IconChevronLeft, IconChevronRight } from "./Icons";

interface Props {
  data: WeatherData;
  tempUnit: TempUnit;
  direction: number;
  onSwipe: (dir: -1 | 1) => void;
  canPrev: boolean;
  canNext: boolean;
  onArrow: (dir: -1 | 1) => void;
  onSelectPage: (index: number) => void;
  pageKey: string;
  pageCount: number;
  activeIndex: number;
  /** comic onomatopoeia for the current scene, e.g. "SPLASH!" */
  sfx: string;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, rotate: dir > 0 ? 4 : -4 }),
  center: { x: 0, opacity: 1, rotate: 0 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, rotate: dir > 0 ? -4 : 4 }),
};

export default function Hero({
  data,
  tempUnit,
  direction,
  onSwipe,
  canPrev,
  canNext,
  onArrow,
  onSelectPage,
  pageKey,
  pageCount,
  activeIndex,
  sfx,
}: Props) {
  const { current, daily } = data;
  const today = daily[0];
  const description = current.weather.description.replace(/\b\w/g, (c) => c.toUpperCase());

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -55 || velocity.x < -500) onSwipe(1);
    else if (offset.x > 55 || velocity.x > 500) onSwipe(-1);
  };

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center select-none min-h-0 px-4">
      {/* comic onomatopoeia burst */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={sfx}
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: -8, opacity: 1 }}
          exit={{ scale: 0, rotate: 12, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 16 }}
          className="absolute top-1 right-2 z-10 sticker comic-title text-[15px] px-3 py-1 bg-[var(--comic-yellow)]"
        >
          {sfx}
        </motion.div>
      </AnimatePresence>

      {/* desktop arrows */}
      {canPrev && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onArrow(-1)}
          aria-label="Previous city"
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full panel comic-press items-center justify-center cursor-pointer z-10 text-[var(--ink)]"
        >
          <IconChevronLeft />
        </motion.button>
      )}
      {canNext && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onArrow(1)}
          aria-label="Next city"
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full panel comic-press items-center justify-center cursor-pointer z-10 text-[var(--ink)]"
        >
          <IconChevronRight />
        </motion.button>
      )}

      <motion.div
        drag="x"
        dragDirectionLock
        dragElastic={0.2}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing touch-pan-y flex flex-col items-center"
      >
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={pageKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              whileTap={{ scale: 0.94 }}
              transition={{ type: "spring", stiffness: 400, damping: 16 }}
              className="relative flex items-start cursor-pointer"
            >
              <AnimatedNumber
                value={celsiusTo(current.temp, tempUnit)}
                className="outline-text text-[96px] md:text-[150px] leading-[0.95] tabular-nums"
              />
              <span className="outline-text text-3xl md:text-5xl mt-2 md:mt-4">
                {tempUnit === "c" ? "°C" : "°F"}
              </span>
            </motion.div>

            {/* condition as a speech bubble */}
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 20 }}
              className="speech comic-body font-bold text-[17px] md:text-xl px-5 py-2 mt-5 mb-4"
            >
              {description}!
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="sticker comic-body text-[13px] px-4 py-1.5"
            >
              <span>Feels {formatTemp(current.feelsLike, tempUnit)}</span>
              {today && (
                <>
                  <span className="w-px h-3.5 bg-[var(--ink)]/30" />
                  <span className="tabular-nums">
                    <span className="text-[var(--comic-red)]">{formatTemp(today.max, tempUnit)}</span>
                    <span className="mx-1 opacity-40">/</span>
                    <span className="text-[var(--comic-blue)]">{formatTemp(today.min, tempUnit)}</span>
                  </span>
                </>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* page dots */}
      {pageCount > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-2 mt-5"
        >
          {Array.from({ length: pageCount }).map((_, i) => (
            <motion.button
              key={i}
              onClick={() => onSelectPage(i)}
              aria-label={`Go to page ${i + 1}`}
              className="p-1 cursor-pointer"
            >
              <motion.span
                layout
                animate={{
                  width: i === activeIndex ? 22 : 10,
                  backgroundColor: i === activeIndex ? "var(--comic-yellow)" : "#ffffff",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="block h-3 rounded-full border-2 border-[var(--ink)]"
              />
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="skeleton w-52 h-28 md:w-72 md:h-36" />
        <div className="skeleton w-36 h-6" />
        <div className="skeleton w-56 h-8" />
      </div>
    </div>
  );
}
