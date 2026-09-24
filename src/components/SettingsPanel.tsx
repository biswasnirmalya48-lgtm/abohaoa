import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAppStore, type AnimationIntensity, type ThemePreference } from "../store/useAppStore";
import { hasApiKey } from "../services/weatherApi";
import BottomSheet from "./BottomSheet";
import { IconCheck } from "./Icons";
import type { TempUnit, SpeedUnit } from "../lib/units";

interface Props {
  open: boolean;
  onClose: () => void;
}

function Segment<T extends string>({
  value,
  options,
  onChange,
  idKey,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  idKey: string;
}) {
  return (
    <div className="flex rounded-full bg-white/[0.07] p-1 w-full">
      {options.map((o) => (
        <motion.button
          key={o.value}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(o.value)}
          className={`relative flex-1 py-2.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer ${
            value === o.value ? "text-slate-900" : "text-white/60 hover:text-white/85"
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${idKey}`}
              className="absolute inset-0 rounded-full bg-white/90"
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </motion.button>
      ))}
    </div>
  );
}

function Row({ label, children, index }: { label: string; children: ReactNode; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="py-4 border-b border-white/[0.07]"
    >
      <p className="text-white/45 text-[11px] tracking-[0.16em] uppercase font-semibold mb-3 px-1">{label}</p>
      {children}
    </motion.div>
  );
}

export default function SettingsPanel({ open, onClose }: Props) {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const savedCities = useAppStore((s) => s.savedCities);
  const setActive = useAppStore((s) => s.setActive);
  const demoOn = settings.demoMode || !hasApiKey;

  return (
    <BottomSheet open={open} onClose={onClose} title="Settings">
      <div className="px-5 pb-6">
        <Row label="Temperature" index={0}>
          <Segment<TempUnit>
            idKey="temp"
            value={settings.tempUnit}
            options={[
              { value: "c", label: "°C Celsius" },
              { value: "f", label: "°F Fahrenheit" },
            ]}
            onChange={(v) => setSettings({ tempUnit: v })}
          />
        </Row>

        <Row label="Wind speed" index={1}>
          <Segment<SpeedUnit>
            idKey="speed"
            value={settings.speedUnit}
            options={[
              { value: "kmh", label: "km/h" },
              { value: "mph", label: "mph" },
            ]}
            onChange={(v) => setSettings({ speedUnit: v })}
          />
        </Row>

        <Row label="Animation intensity" index={2}>
          <Segment<AnimationIntensity>
            idKey="anim"
            value={settings.animation}
            options={[
              { value: "low", label: "Calm" },
              { value: "normal", label: "Normal" },
              { value: "high", label: "Vivid" },
            ]}
            onChange={(v) => setSettings({ animation: v })}
          />
          <p className="text-white/35 text-[12px] font-light mt-2.5 px-1 leading-relaxed">
            Controls particle density and scene motion. Abohaoa always respects your system's
            reduced-motion preference.
          </p>
        </Row>

        <Row label="Appearance" index={3}>
          <Segment<ThemePreference>
            idKey="theme"
            value={settings.theme}
            options={[
              { value: "auto", label: "Auto" },
              { value: "dark", label: "Dark" },
              { value: "light", label: "Light" },
            ]}
            onChange={(v) => setSettings({ theme: v })}
          />
          <p className="text-white/35 text-[12px] font-light mt-2.5 px-1">
            Affects panels and surfaces. The sky always follows the real weather.
          </p>
        </Row>

        <Row label="Demo mode" index={4}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setSettings({ demoMode: !settings.demoMode })}
            className="w-full flex items-center justify-between px-1 cursor-pointer group"
          >
            <span className="flex flex-col text-left">
              <span className="text-white/85 text-[14px] font-medium">{demoOn ? "On" : "Off"}</span>
              <span className="text-white/35 text-[12px] font-light mt-0.5">
                {hasApiKey
                  ? "Use simulated weather data"
                  : "No API key found — demo data is active."}
              </span>
            </span>
            <span
              className={`w-12 h-[28px] rounded-full p-[3px] transition-colors duration-300 shrink-0 ${
                demoOn ? "bg-emerald-400/80" : "bg-white/15"
              }`}
            >
              <motion.span
                className="block w-[22px] h-[22px] rounded-full bg-white shadow"
                animate={{ x: demoOn ? 22 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </span>
          </motion.button>
        </Row>

        <Row label="Default location" index={5}>
          <div className="flex flex-col gap-1">
            <DefaultRow
              label="My location"
              selected={settings.defaultLocation === "current"}
              onClick={() => setSettings({ defaultLocation: "current" })}
            />
            {savedCities.map((c) => (
              <DefaultRow
                key={c.id}
                label={`${c.name}, ${c.country}`}
                selected={settings.defaultLocation === c.id}
                onClick={() => {
                  setSettings({ defaultLocation: c.id });
                  setActive({ type: "city", city: c });
                }}
              />
            ))}
            {savedCities.length === 0 && (
              <p className="text-white/35 text-[12px] font-light px-1 pt-1">
                Save cities from search to choose a default.
              </p>
            )}
          </div>
        </Row>

        <div className="pt-9 pb-3 flex flex-col items-center gap-2">
          <span className="wordmark text-[15px] tracking-[0.4em] font-light pl-[0.4em] select-none">
            ABOHAOA
          </span>
          <span className="text-white/25 text-[11px] font-light tracking-wide">
            A living weather window · v2.0
          </span>
        </div>
      </div>
    </BottomSheet>
  );
}

function DefaultRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
    >
      <span className={`text-[14px] font-light ${selected ? "text-white font-medium" : "text-white/55"}`}>{label}</span>
      {selected && <IconCheck className="w-4 h-4 text-emerald-300" />}
    </motion.button>
  );
}
