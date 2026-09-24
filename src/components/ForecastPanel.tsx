import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { WeatherData } from "../types/weather";
import type { SpeedUnit, TempUnit } from "../lib/units";
import {
  celsiusTo,
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
  expanded: boolean;
  onExpandedChange: (v: boolean) => void;
}

const COLLAPSED_VISIBLE = 62;
const SHEET_VH = 0.86;

export default function ForecastPanel({
  data,
  tempUnit,
  speedUnit,
  expanded,
  onExpandedChange,
}: Props) {
  const [sheetOffset, setSheetOffset] = useState(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const compute = () => setSheetOffset(window.innerHeight * SHEET_VH - COLLAPSED_VISIBLE);
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  const onHeaderDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y < -34 || info.velocity.y < -450) onExpandedChange(true);
    else if (info.offset.y > 34 || info.velocity.y > 450) onExpandedChange(false);
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
      className="fixed inset-x-0 bottom-0 z-30 md:flex md:justify-center"
      style={{ height: `${SHEET_VH * 100}vh` }}
      animate={{ y: expanded ? 0 : sheetOffset }}
      transition={{ type: "spring", stiffness: 300, damping: 32, mass: 0.9 }}
    >
      <div className="h-full w-full md:max-w-lg glass rounded-t-[28px] flex flex-col overflow-hidden shadow-[0_-8px_50px_rgba(0,0,0,0.35)]">
        {/* grabber + header (drag or tap to toggle) */}
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.2, bottom: 0.4 }}
          onDragEnd={onHeaderDragEnd}
          onClick={() => onExpandedChange(!expanded)}
          className="shrink-0 pt-2.5 pb-2 cursor-grab active:cursor-grabbing touch-none select-none"
        >
          <motion.div
            animate={{ width: expanded ? 40 : 34, opacity: expanded ? 0.5 : 0.35 }}
            className="h-1 rounded-full bg-white mx-auto mb-2.5"
          />
          <div className="flex items-center justify-between px-5">
            <span className="text-white/90 text-[13.5px] font-semibold tracking-wide flex items-center gap-2">
              <motion.span
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="text-white/50 flex"
              >
                <IconChevronUp className="w-4 h-4" />
              </motion.span>
              7-Day Forecast
            </span>
            <span className="text-white/50 text-[12px] font-light tabular-nums flex items-center gap-2">
              {today && (
                <>
                  <WeatherIcon icon={today.weather.icon} className="w-4 h-4 text-white/70" />
                  {formatTemp(today.min, tempUnit)} – {formatTemp(today.max, tempUnit)}
                </>
              )}
            </span>
          </div>
        </motion.div>

        {/* scrollable content */}
        <div className="flex-1 overflow-y-auto thin-scroll overscroll-contain px-4 md:px-6 pb-6 safe-bottom">
          {/* 7-day list */}
          <div className="flex flex-col mt-1">
            {days.map((d, i) => {
              const left = ((d.min - weekMin) / span) * 100;
              const width = ((d.max - d.min) / span) * 100;
              return (
                <motion.div
                  key={d.dt}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: expanded ? 0.05 + i * 0.045 : 0, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                  className="grid grid-cols-[64px_26px_40px_1fr] items-center gap-2 py-2.5 px-1 rounded-xl border-b border-white/[0.06] last:border-none"
                >
                  <span className="text-white/85 text-[13.5px] font-medium truncate">
                    {formatDayName(d.dt, timezoneOffset, current.dt)}
                  </span>
                  <WeatherIcon icon={d.weather.icon} className="w-[22px] h-[22px] text-white/90" />
                  <span className="text-[11px] font-medium text-sky-200/85 tabular-nums">
                    {d.pop >= 0.15 ? `${Math.round(d.pop * 100)}%` : ""}
                  </span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-white/45 text-[12.5px] font-light w-7 text-right tabular-nums">
                      {Math.round(celsiusTo(d.min, tempUnit))}°
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/10 relative overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 rounded-full"
                        style={{ background: "linear-gradient(90deg, #7fb2e8, #f0d9a0)" }}
                        initial={{ left: `${left}%`, width: 0 }}
                        animate={{ left: `${left}%`, width: `${Math.max(width, 5)}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: expanded ? 0.1 + i * 0.045 : 0 }}
                      />
                    </div>
                    <span className="text-white text-[12.5px] font-semibold w-7 tabular-nums">
                      {Math.round(celsiusTo(d.max, tempUnit))}°
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* metric cards */}
          <motion.div
            initial={false}
            animate={{ opacity: expanded ? 1 : 0.001 }}
            className="grid grid-cols-2 gap-2.5 mt-5"
          >
            <MetricCard
              index={0}
              icon={<IconThermometer className="w-[18px] h-[18px]" />}
              label="Feels like"
              value={formatTemp(current.feelsLike, tempUnit)}
              hint={feelsHint(current.temp, current.feelsLike)}
            />
            <MetricCard
              index={1}
              icon={<IconWind className="w-[18px] h-[18px]" />}
              label="Wind"
              value={formatSpeed(current.windSpeed, speedUnit)}
              hint={`From ${degToCompass(current.windDeg)}`}
            />
            <MetricCard
              index={2}
              icon={<IconDroplet className="w-[18px] h-[18px]" />}
              label="Humidity"
              value={`${current.humidity}%`}
              hint={dewHint(current.humidity)}
            />
            <MetricCard
              index={3}
              icon={<IconUv className="w-[18px] h-[18px]" />}
              label="UV index"
              value={String(Math.round(current.uvi))}
              hint={uviLabel(current.uvi)}
            />
            <MetricCard
              index={4}
              icon={<IconEye className="w-[18px] h-[18px]" />}
              label="Visibility"
              value={formatVisibility(current.visibility)}
            />
            <MetricCard
              index={5}
              icon={<IconCloudRain className="w-[18px] h-[18px]" />}
              label="Precipitation"
              value={
                today
                  ? `${Math.round(
                      Math.max(today.pop, current.weather.id >= 300 && current.weather.id < 700 ? 0.4 : 0) * 100,
                    )}%`
                  : "—"
              }
            />
            <MetricCard
              index={6}
              icon={<IconSunrise className="w-[18px] h-[18px]" />}
              label="Sunrise"
              value={formatTime(current.sunrise, timezoneOffset)}
              hint={today ? `Sunset ${formatTime(current.sunset, timezoneOffset)}` : undefined}
            />
            <MetricCard
              index={7}
              icon={<IconSunset className="w-[18px] h-[18px]" />}
              label="Sunset"
              value={formatTime(current.sunset, timezoneOffset)}
              hint={data.daily[1] ? `Tomorrow ${formatTime(data.daily[1].sunrise, timezoneOffset)}` : undefined}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  hint,
  index,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint?: string;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.12 + index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.97 }}
      className="glass-soft rounded-2xl px-3.5 py-3 cursor-default"
    >
      <div className="flex items-center gap-1.5 text-white/45 mb-1.5">
        {icon}
        <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase">{label}</span>
      </div>
      <div className="text-white text-[20px] font-semibold tabular-nums leading-tight">{value}</div>
      {hint && <div className="text-white/40 text-[11.5px] font-light mt-0.5 leading-snug">{hint}</div>}
    </motion.div>
  );
}

function feelsHint(temp: number, feels: number): string {
  const d = feels - temp;
  if (d > 2) return "Humidity makes it warmer";
  if (d < -2) return "Wind makes it colder";
  return "Similar to actual";
}

function dewHint(humidity: number): string {
  if (humidity >= 80) return "Quite humid";
  if (humidity <= 35) return "The air is dry";
  return "Comfortable";
}
