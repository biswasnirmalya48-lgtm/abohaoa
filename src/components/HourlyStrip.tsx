import { motion } from "framer-motion";
import type { WeatherData } from "../types/weather";
import type { TempUnit } from "../lib/units";
import { formatHour, formatTemp } from "../lib/units";
import WeatherIcon from "./WeatherIcon";

interface Props {
  data: WeatherData;
  tempUnit: TempUnit;
}

export default function HourlyStrip({ data, tempUnit }: Props) {
  const { hourly, timezoneOffset, current } = data;
  const hours = hourly.slice(0, 24);

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.97, rotate: -1.2 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mx-3 md:mx-auto md:max-w-3xl"
    >
      <div className="panel px-1.5 py-3">
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar snap-x-mandatory px-1">
          {hours.map((h, i) => {
            const now = i === 0;
            const showPop = h.pop >= 0.15;
            return (
              <motion.div
                key={h.dt}
                initial={{ opacity: 0, y: 12, rotate: i % 2 ? 3 : -3 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.26 + i * 0.02, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3 }}
                className={`comic-body relative flex flex-col items-center gap-1.5 min-w-[60px] py-2 rounded-xl flex-shrink-0 snap-start border-2 ${
                  now
                    ? "bg-[var(--comic-yellow)] border-[var(--ink)]"
                    : "border-transparent"
                }`}
              >
                <span
                  className={`text-[11px] font-bold tracking-wide ${
                    now ? "text-[var(--ink)]" : "text-[var(--ink)]/55"
                  }`}
                >
                  {now ? "Now" : formatHour(h.dt, timezoneOffset)}
                </span>
                <motion.span
                  animate={now ? { scale: [1, 1.12, 1] } : undefined}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <WeatherIcon icon={h.weather.icon} className="w-[24px] h-[24px] text-[var(--ink)]" />
                </motion.span>
                <span className="text-[10px] font-bold text-[var(--comic-red)] h-3.5 tabular-nums">
                  {showPop ? `${Math.round(h.pop * 100)}%` : ""}
                </span>
                <span
                  className={`text-[15px] font-bold tabular-nums ${
                    now ? "text-[var(--ink)]" : "text-[var(--ink)]/85"
                  }`}
                >
                  {formatTemp(h.temp, tempUnit)}
                </span>
              </motion.div>
            );
          })}
          <span className="sr-only">Current temperature {formatTemp(current.temp, tempUnit)}</span>
        </div>
      </div>
    </motion.div>
  );
}
