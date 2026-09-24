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
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mx-3 md:mx-auto md:max-w-3xl"
    >
      <div className="glass rounded-[26px] px-1.5 py-3">
        <div className="flex gap-0.5 overflow-x-auto no-scrollbar snap-x-mandatory px-1">
          {hours.map((h, i) => {
            const now = i === 0;
            const showPop = h.pop >= 0.15;
            return (
              <motion.div
                key={h.dt}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 + i * 0.02, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3 }}
                className={`relative flex flex-col items-center gap-1.5 min-w-[60px] py-2 rounded-2xl flex-shrink-0 snap-start ${
                  now ? "bg-white/[0.1]" : ""
                }`}
              >
                <span
                  className={`text-[11px] font-medium tracking-wide ${
                    now ? "text-white" : "text-white/50"
                  }`}
                >
                  {now ? "Now" : formatHour(h.dt, timezoneOffset)}
                </span>
                <motion.span
                  animate={now ? { scale: [1, 1.12, 1] } : undefined}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <WeatherIcon icon={h.weather.icon} className="w-[24px] h-[24px] text-white/90" />
                </motion.span>
                <span className="text-[10px] font-medium text-sky-200 h-3.5 tabular-nums">
                  {showPop ? `${Math.round(h.pop * 100)}%` : ""}
                </span>
                <span
                  className={`text-[14px] font-semibold tabular-nums ${
                    now ? "text-white" : "text-white/90"
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
