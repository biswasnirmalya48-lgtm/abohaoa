import { useMemo } from "react";

interface Props {
  windDeg: number;
  windSpeed: number;
  isNight: boolean;
  reducedMotion: boolean;
}

/** Layered semi-transparent fog bands drifting slowly across the screen. */
export default function Fog({ windDeg, windSpeed, isNight, reducedMotion }: Props) {
  const bands = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => ({
        top: 18 + i * 20 + Math.random() * 8,
        height: 16 + Math.random() * 14,
        alpha: (isNight ? 0.1 : 0.16) + Math.random() * 0.08,
        duration: 130 + i * 60 + Math.random() * 60,
      })),
    [isNight],
  );

  const movesWest = Math.sin((windDeg * Math.PI) / 180) > 0.05;
  const speedFactor = 1 / (0.5 + Math.min(windSpeed, 18) / 14);

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {bands.map((b, i) => (
        <div
          key={i}
          className={`cloud-layer ${movesWest ? "reverse" : ""}`}
          style={{
            animationDuration: reducedMotion ? undefined : `${b.duration * speedFactor}s`,
            animationPlayState: reducedMotion ? "paused" : "running",
          }}
        >
          <div
            className="absolute w-[140vw] -left-[20vw]"
            style={{
              top: `${b.top}%`,
              height: `${b.height}vh`,
              background: `linear-gradient(90deg, transparent 0%, rgba(226,232,238,${b.alpha}) 28%, rgba(226,232,238,${b.alpha * 1.3}) 52%, rgba(226,232,238,${b.alpha}) 76%, transparent 100%)`,
              filter: "blur(38px)",
            }}
          />
        </div>
      ))}
    </div>
  );
}
