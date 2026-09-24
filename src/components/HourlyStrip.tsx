import { motion } from "framer-motion";
import type { WeatherData } from "../types/weather";
import type { TempUnit } from "../lib/units";
import { bengaliDigits, formatHour, formatTemp } from "../lib/units";
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
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mx-3 md:mx-auto md:max-w-3xl"
    >
      <div className="glass rounded-3xl px-2 py-3.5">
        <div className="flex gap-1 overflow-x-auto no-scrollbar px-1.5">
          {hours.map((h, i) => (
            <motion.div
              key={h.dt}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.022, duration: 0.4 }}
              className="flex flex-col items-center gap-1.5 min-w-[58px] py-1 rounded-2xl flex-shrink-0"
            >
              <span className={`text-[11px] font-light tracking-wide ${i === 0 ? "text-white" : "text-white/55"}`}>
                {i === 0 ? "Now" : formatHour(h.dt, timezoneOffset)}
              </span>
              <WeatherIcon icon={h.weather.icon} className="w-[22px] h-[22px] text-white/90" />
              <span className="text-[10px] font-light text-sky-200/90 h-3.5">
                {h.pop >= 0.15 ? `${bengaliDigits(Math.round(h.pop * 100))}%` : ""}
              </span>
              <span className="text-[13px] font-normal text-white/95 tabular-nums">
                {formatTemp(h.temp, tempUnit)}
              </span>
            </motion.div>
          ))}
          <span className="sr-only">Current temperature {formatTemp(current.temp, tempUnit)}</span>
        </div>
      </div>
    </motion.div>
  );
}
