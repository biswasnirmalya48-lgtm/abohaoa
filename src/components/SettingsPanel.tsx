import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { useAppStore, type AnimationIntensity, type ThemePreference } from "../store/useAppStore";
import { hasApiKey } from "../services/weatherApi";
import { Drawer } from "./SavedPanel";
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
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-full bg-white/[0.08] p-1 w-full">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`relative flex-1 py-2 rounded-full text-[13px] font-light transition-colors cursor-pointer ${
            value === o.value ? "text-slate-900" : "text-white/60 hover:text-white/85"
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join("")}`}
              className="absolute inset-0 rounded-full bg-white/90"
              transition={{ type: "spring", stiffness: 400, damping: 32 }}
            />
          )}
          <span className="relative z-10">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-4 border-b border-white/[0.07]">
      <p className="text-white/45 text-[11px] tracking-[0.16em] uppercase font-light mb-3 px-1">{label}</p>
      {children}
    </div>
  );
}

export default function SettingsPanel({ open, onClose }: Props) {
  const settings = useAppStore((s) => s.settings);
  const setSettings = useAppStore((s) => s.setSettings);
  const savedCities = useAppStore((s) => s.savedCities);
  const setActive = useAppStore((s) => s.setActive);

  return (
    <Drawer open={open} onClose={onClose} title="Settings">
      <div className="px-2">
        <Row label="Temperature">
          <Segment<TempUnit>
            value={settings.tempUnit}
            options={[
              { value: "c", label: "°C Celsius" },
              { value: "f", label: "°F Fahrenheit" },
            ]}
            onChange={(v) => setSettings({ tempUnit: v })}
          />
        </Row>

        <Row label="Wind speed">
          <Segment<SpeedUnit>
            value={settings.speedUnit}
            options={[
              { value: "kmh", label: "km/h" },
              { value: "mph", label: "mph" },
            ]}
            onChange={(v) => setSettings({ speedUnit: v })}
          />
        </Row>

        <Row label="Animation intensity">
          <Segment<AnimationIntensity>
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

        <Row label="Appearance">
          <Segment<ThemePreference>
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

        <Row label="Demo mode">
          <button
            onClick={() => setSettings({ demoMode: !settings.demoMode })}
            className="w-full flex items-center justify-between px-1 cursor-pointer group"
          >
            <span className="flex flex-col">
              <span className="text-white/85 text-[14px] font-light">
                {settings.demoMode || !hasApiKey ? "On" : "Off"}
              </span>
              <span className="text-white/35 text-[12px] font-light mt-0.5">
                {hasApiKey
                  ? "Use simulated weather data"
                  : "No API key found — demo data is active. Add VITE_WEATHER_API_KEY to go live."}
              </span>
            </span>
            <span
              className={`w-11 h-[26px] rounded-full p-[3px] transition-colors duration-300 ${
                settings.demoMode || !hasApiKey ? "bg-emerald-300/80" : "bg-white/15"
              }`}
            >
              <motion.span
                className="block w-5 h-5 rounded-full bg-white shadow"
                animate={{ x: settings.demoMode || !hasApiKey ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 32 }}
              />
            </span>
          </button>
        </Row>

        <Row label="Default location">
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

        <div className="pt-10 pb-4 flex flex-col items-center gap-2">
          <span className="wordmark text-[15px] tracking-[0.4em] font-light pl-[0.4em] select-none">
            ABOHAOA
          </span>
          <span className="text-white/25 text-[11px] font-light tracking-wide">
            A living weather window · v1.0
          </span>
        </div>
      </div>
    </Drawer>
  );
}

function DefaultRow({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
    >
      <span className={`text-[14px] font-light ${selected ? "text-white" : "text-white/55"}`}>{label}</span>
      {selected && <IconCheck className="w-4 h-4 text-white/80" />}
    </button>
  );
}
