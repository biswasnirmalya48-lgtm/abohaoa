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
    <div className="flex rounded-full bg-white border-[2.5px] border-[var(--ink)] comic-shadow-sm p-1 w-full">
      {options.map((o) => (
        <motion.button
          key={o.value}
          whileTap={{ scale: 0.96 }}
          onClick={() => onChange(o.value)}
          className={`comic-body relative flex-1 py-2.5 rounded-full text-[13px] font-bold transition-colors cursor-pointer ${
            value === o.value ? "text-[var(--ink)]" : "text-[var(--ink)]/45 hover:text-[var(--ink)]/75"
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${idKey}`}
              className="absolute inset-0 rounded-full bg-[var(--comic-yellow)] border-[2px] border-[var(--ink)]"
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
      className="py-4 border-b-2 border-dashed border-[var(--ink)]/15"
    >
      <p className="comic-title text-[var(--ink)]/70 text-[14px] tracking-[0.1em] uppercase mb-3 px-1">{label}</p>
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
          <p className="comic-body text-[var(--ink)]/45 text-[12px] font-bold mt-2.5 px-1 leading-relaxed">
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
          <p className="comic-body text-[var(--ink)]/45 text-[12px] font-bold mt-2.5 px-1">
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
              <span className="comic-body text-[var(--ink)] text-[14px] font-bold">{demoOn ? "On" : "Off"}</span>
              <span className="comic-body text-[var(--ink)]/45 text-[12px] font-bold mt-0.5">
                {hasApiKey
                  ? "Use simulated weather data"
                  : "No API key found — demo data is active."}
              </span>
            </span>
            <span
              className={`w-12 h-[28px] rounded-full p-[3px] border-[2.5px] border-[var(--ink)] transition-colors duration-300 shrink-0 ${
                demoOn ? "bg-[var(--comic-blue)]" : "bg-[var(--ink)]/15"
              }`}
            >
              <motion.span
                className="block w-[22px] h-[22px] rounded-full bg-white border-2 border-[var(--ink)]"
                animate={{ x: demoOn ? 20 : 0 }}
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
              <p className="comic-body text-[var(--ink)]/45 text-[12px] font-bold px-1 pt-1">
                Save cities from search to choose a default.
              </p>
            )}
          </div>
        </Row>

        <div className="pt-9 pb-3 flex flex-col items-center gap-2">
          <span className="comic-title text-[var(--ink)] text-[22px] tracking-[0.12em] select-none">
            ABOHAOA
          </span>
          <span className="comic-body text-[var(--ink)]/45 text-[11px] font-bold tracking-wide">
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
      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--ink)]/[0.05] transition-colors text-left cursor-pointer"
    >
      <span className={`comic-body text-[14px] font-bold ${selected ? "text-[var(--ink)]" : "text-[var(--ink)]/55"}`}>{label}</span>
      {selected && <IconCheck className="w-4 h-4 text-[var(--comic-red)]" />}
    </motion.button>
  );
}
