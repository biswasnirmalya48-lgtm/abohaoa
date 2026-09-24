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
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 120 : -120, opacity: 0, filter: "blur(8px)", scale: 0.94 }),
  center: { x: 0, opacity: 1, filter: "blur(0px)", scale: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -120 : 120, opacity: 0, filter: "blur(8px)", scale: 0.94 }),
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
    <div className="relative flex-1 flex flex-col items-center justify-center select-none min-h-0">
      {/* desktop arrows */}
      {canPrev && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onArrow(-1)}
          aria-label="Previous city"
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass glass-text items-center justify-center cursor-pointer z-10"
        >
          <IconChevronLeft />
        </motion.button>
      )}
      {canNext && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onArrow(1)}
          aria-label="Next city"
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full glass glass-text items-center justify-center cursor-pointer z-10"
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
        className="cursor-grab active:cursor-grabbing touch-pan-y px-6 flex flex-col items-center"
      >
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={pageKey}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center text-white"
          >
            {/* breathing glow behind the number */}
            <div className="relative flex items-center justify-center">
              <div
                aria-hidden="true"
                className="absolute w-[240px] h-[240px] md:w-[320px] md:h-[320px] rounded-full glow-breathe"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 42%, transparent 70%)",
                }}
              />
              <motion.div
                whileTap={{ scale: 0.93 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative flex items-start cursor-pointer"
              >
                <AnimatedNumber
                  value={celsiusTo(current.temp, tempUnit)}
                  className="temp-shine text-[92px] md:text-[150px] leading-none font-extralight tracking-[-0.06em] text-glow tabular-nums"
                />
                <motion.span
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-5xl font-extralight mt-3 md:mt-5 text-white/75"
                >
                  {tempUnit === "c" ? "°C" : "°F"}
                </motion.span>
              </motion.div>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="mt-4 text-[19px] md:text-2xl font-medium tracking-wide text-white/95 text-glow"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.5 }}
              className="mt-3 flex items-center gap-2.5 px-4 py-1.5 rounded-full glass-soft"
            >
              <span className="text-[13.5px] font-light text-white/70">
                Feels {formatTemp(current.feelsLike, tempUnit)}
              </span>
              {today && (
                <>
                  <span className="w-px h-3.5 bg-white/20" />
                  <span className="text-[13.5px] font-light text-white/70 tabular-nums">
                    <span className="text-white/90">{formatTemp(today.max, tempUnit)}</span>
                    <span className="mx-1 text-white/30">/</span>
                    {formatTemp(today.min, tempUnit)}
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
          className="flex items-center gap-1.5 mt-5"
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
                  width: i === activeIndex ? 20 : 6,
                  opacity: i === activeIndex ? 1 : 0.4,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="block h-1.5 rounded-full bg-white"
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
        <div className="skeleton w-36 h-5" />
        <div className="skeleton w-56 h-8" />
      </div>
    </div>
  );
}
