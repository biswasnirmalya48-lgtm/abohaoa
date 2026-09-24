import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { WeatherData } from "../types/weather";
import type { SpeedUnit, TempUnit } from "../lib/units";
import {
  celsiusTo,
  bengaliDigits,
  degToCompass,
  formatDayName,
  formatTime,
  formatTemp,
  formatSpeed,
  formatVisibility,
  uviLabel,
} from "../lib/units";
import WeatherIcon from "./WeatherIcon";
import {
  IconChevronUp,
  IconCloudRain,
  IconDroplet,
  IconEye,
  IconSunrise,
  IconSunset,
  IconThermometer,
  IconUv,
  IconWind,
} from "./Icons";

interface Props {
  data: WeatherData;
  tempUnit: TempUnit;
  speedUnit: SpeedUnit;
}

const COLLAPSED_VISIBLE = 58;

export default function ForecastPanel({ data, tempUnit, speedUnit }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [sheetOffset, setSheetOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const SHEET_VH = 0.84;

  useEffect(() => {
    const compute = () =>
      setSheetOffset(window.innerHeight * SHEET_VH - COLLAPSED_VISIBLE);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const onHeaderDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -36 || info.velocity.y < -500) setExpanded(true);
    else if (info.offset.y > 36 || info.velocity.y > 500) setExpanded(false);
  };

  const { daily, current, timezoneOffset } = data;
  const days = daily.slice(0, 7);
  const weekMin = Math.min(...days.map((d) => d.min));
  const weekMax = Math.max(...days.map((d) => d.max));
  const span = Math.max(weekMax - weekMin, 1);
  const today = days[0];

  return (
    <motion.div
      ref={sheetRef}
      data-no-pull
      className="fixed inset-x-0 bottom-0 z-30"
      style={{ height: `${SHEET_VH * 100}vh` }}
      animate={{ y: expanded ? 0 : sheetOffset }}
      transition={{ type: "spring", stiffness: 320, damping: 34, mass: 0.9 }}
      drag={false}
    >
      <div className="h-full glass rounded-t-[28px] flex flex-col overflow-hidden shadow-[0_-8px_40px_rgba(0,0,0,0.25)]">
        {/* drag handle / header */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.25, bottom: 0.4 }}
          onDragEnd={onHeaderDragEnd}
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <div className="w-10 h-1 rounded-full bg-white/30 mx-auto mb-2" />
          <div className="flex items-center justify-between px-6 md:px-10 max-w-3xl md:mx-auto w-full">
            <span className="text-white/85 text-[13px] font-normal tracking-wide flex items-center gap-2">
              <IconChevronUp
                className={`w-4 h-4 text-white/50 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
              7-Day Forecast
            </span>
            <span className="text-white/45 text-[12px] font-light tabular-nums">
              {today ? `${formatTemp(today.min, tempUnit)} – ${formatTemp(today.max, tempUnit)}` : ""}
            </span>
          </div>
        </motion.div>

        {/* scrollable content */}
        <div className="flex-1 overflow-y-auto thin-scroll overscroll-contain px-6 md:px-10 pb-8 safe-bottom">
          <div className="max-w-3xl mx-auto">
            {/* 7-day list */}
            <div className="flex flex-col">
              {days.map((d, i) => {
                const left = ((d.min - weekMin) / span) * 100;
                const width = ((d.max - d.min) / span) * 100;
                return (
                  <motion.div
                    key={d.dt}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: expanded ? i * 0.04 : 0, duration: 0.35 }}
                    className="grid grid-cols-[76px_28px_44px_1fr] md:grid-cols-[90px_32px_52px_1fr_90px] items-center gap-2 md:gap-3 py-3 border-b border-white/[0.07] last:border-none"
                  >
                    <span className="text-white/85 text-[14px] font-light">
                      {formatDayName(d.dt, timezoneOffset, current.dt)}
                    </span>
                    <WeatherIcon icon={d.weather.icon} className="w-[22px] h-[22px] text-white/90" />
                    <span className="text-[11px] font-light text-sky-200/85 tabular-nums">
                      {d.pop >= 0.15 ? `${bengaliDigits(Math.round(d.pop * 100))}%` : ""}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-white/45 text-[13px] font-light w-8 text-right tabular-nums">
                        {bengaliDigits(Math.round(celsiusTo(d.min, tempUnit)))}°
                      </span>
                      <div className="flex-1 h-[3px] rounded-full bg-white/12 relative overflow-hidden">
                        <motion.div
                          className="absolute inset-y-0 rounded-full"
                          style={{
                            background: "linear-gradient(90deg, #7fb2e8, #e8d59a)",
                          }}
                          initial={{ left: `${left}%`, width: 0 }}
                          animate={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
                        />
                      </div>
                      <span className="text-white/95 text-[13px] font-normal w-8 tabular-nums">
                        {bengaliDigits(Math.round(celsiusTo(d.max, tempUnit)))}°
                      </span>
                    </div>
                    <span className="text-white/40 text-[11px] font-light text-right truncate hidden md:block">
                      {d.weather.description}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            {/* metrics */}
            <div className="grid grid-cols-2 gap-x-8 md:gap-x-14 mt-6">
              <Metric
                icon={<IconThermometer className="w-[18px] h-[18px]" />}
                label="Feels like"
                value={formatTemp(current.feelsLike, tempUnit)}
                hint={feelsHint(current.temp, current.feelsLike)}
              />
              <Metric
                icon={<IconWind className="w-[18px] h-[18px]" />}
                label="Wind"
                value={formatSpeed(current.windSpeed, speedUnit)}
                hint={`From ${degToCompass(current.windDeg)}`}
              />
              <Metric
                icon={<IconDroplet className="w-[18px] h-[18px]" />}
                label="Humidity"
                value={`${bengaliDigits(current.humidity)}%`}
                hint={dewHint(current.humidity)}
              />
              <Metric
                icon={<IconUv className="w-[18px] h-[18px]" />}
                label="UV index"
                value={bengaliDigits(Math.round(current.uvi))}
                hint={uviLabel(current.uvi)}
              />
              <Metric
                icon={<IconEye className="w-[18px] h-[18px]" />}
                label="Visibility"
                value={formatVisibility(current.visibility)}
              />
              <Metric
                icon={<IconCloudRain className="w-[18px] h-[18px]" />}
                label="Precip. chance"
                value={today ? `${bengaliDigits(Math.round(Math.max(today.pop, current.weather.id >= 300 && current.weather.id < 700 ? 0.4 : 0) * 100))}%` : "—"}
              />
              <Metric
                icon={<IconSunrise className="w-[18px] h-[18px]" />}
                label="Sunrise"
                value={formatTime(current.sunrise, timezoneOffset)}
                hint={today ? `Sunset ${formatTime(current.sunset, timezoneOffset)}` : undefined}
              />
              <Metric
                icon={<IconSunset className="w-[18px] h-[18px]" />}
                label="Sunset"
                value={formatTime(current.sunset, timezoneOffset)}
                hint={data.daily[1] ? `Tomorrow ${formatTime(data.daily[1].sunrise, timezoneOffset)}` : undefined}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Metric({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
  return (
    <div className="py-4 border-b border-white/[0.07]">
      <div className="flex items-center gap-2 text-white/45 mb-1.5">
        {icon}
        <span className="text-[11px] font-light tracking-[0.12em] uppercase">{label}</span>
      </div>
      <div className="text-white text-[19px] font-light tabular-nums">{value}</div>
      {hint && <div className="text-white/40 text-[12px] font-light mt-0.5">{hint}</div>}
    </div>
  );
}

function feelsHint(temp: number, feels: number): string {
  const d = feels - temp;
  if (d > 2) return "Humidity is making it feel warmer";
  if (d < -2) return "Wind is making it feel colder";
  return "Similar to the actual temperature";
}

function dewHint(humidity: number): string {
  if (humidity >= 80) return "Quite humid";
  if (humidity <= 35) return "The air is dry";
  return "Comfortable";
}
