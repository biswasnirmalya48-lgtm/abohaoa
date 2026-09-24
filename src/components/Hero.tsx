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
  pageKey: string;
}

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 90 : -90, opacity: 0, filter: "blur(6px)" }),
  center: { x: 0, opacity: 1, filter: "blur(0px)" },
  exit: (dir: number) => ({ x: dir > 0 ? -90 : 90, opacity: 0, filter: "blur(6px)" }),
};

export default function Hero({ data, tempUnit, direction, onSwipe, canPrev, canNext, onArrow, pageKey }: Props) {
  const { current, daily } = data;
  const today = daily[0];
  const description = current.weather.description.replace(/\b\w/g, (c) => c.toUpperCase());

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (offset.x < -60 || velocity.x < -600) onSwipe(1);
    else if (offset.x > 60 || velocity.x > 600) onSwipe(-1);
  };

  return (
    <div className="relative flex-1 flex items-center justify-center select-none">
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
        dragElastic={0.18}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="cursor-grab active:cursor-grabbing touch-pan-y px-6"
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
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.6 }}
              className="mb-3 text-[11px] font-medium uppercase tracking-[0.22em] text-white/55"
            >
              Today&apos;s forecast
            </motion.div>
            <div className="flex items-start">
              <AnimatedNumber
                value={celsiusTo(current.temp, tempUnit)}
                className="text-[104px] md:text-[148px] leading-none font-extralight tracking-[-0.07em] text-glow tabular-nums"
              />
              <span className="text-4xl md:text-5xl font-extralight mt-3 md:mt-5 text-white/80">
                {tempUnit === "c" ? "°C" : "°F"}
              </span>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
              className="mt-3 text-lg md:text-xl font-light tracking-wide text-white/90 text-glow"
            >
              {description}
            </motion.p>

            <motion.div
              aria-hidden="true"
              className="monsoon-float mt-5 h-2 w-2 rounded-full bg-amber-200/80 warm-pulse"
              transition={{ delay: 0.35, duration: 0.5 }}
            />

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mt-1.5 text-[15px] font-light text-white/60 text-glow"
            >
              Feels like {formatTemp(current.feelsLike, tempUnit)}
              {today && (
                <>
                  <span className="mx-2.5 text-white/25">·</span>
                  H {formatTemp(today.max, tempUnit)}
                  <span className="mx-2 text-white/25">·</span>
                  L {formatTemp(today.min, tempUnit)}
                </>
              )}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="skeleton w-56 h-28 md:w-72 md:h-36" />
        <div className="skeleton w-36 h-5" />
        <div className="skeleton w-56 h-4" />
      </div>
    </div>
  );
}
