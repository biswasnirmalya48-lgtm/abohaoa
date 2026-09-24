import { useMemo } from "react";
import type { SceneKind } from "../../lib/weatherScene";

interface Props {
  layers: number;
  opacity: number;
  kind: SceneKind;
  isNight: boolean;
  windDeg: number;
  windSpeed: number;
  intensityMult: number;
  reducedMotion: boolean;
}

const STORMY: SceneKind[] = ["rain", "heavy-rain", "thunder", "overcast"];

interface Blob {
  left: string;
  top: string;
  width: string;
  height: string;
}

/**
 * Parallax cloud layers. Each layer drifts at a different speed for natural
 * depth; drift direction follows the real wind direction and speed.
 */
export default function Clouds({ layers, opacity, kind, isNight, windDeg, windSpeed, intensityMult, reducedMotion }: Props) {
  const stormy = STORMY.includes(kind);

  const blobs = useMemo<Blob[][]>(() => {
    // seeded-ish but stable per mount
    const rnd = (min: number, max: number) => min + Math.random() * (max - min);
    return Array.from({ length: 3 }, (_, layer) =>
      Array.from({ length: layer === 0 ? 2 : 3 }, () => ({
        left: `${rnd(-10, 70)}%`,
        top: `${layer * 14 + rnd(-4, 12)}%`,
        width: `${rnd(38, 66 - layer * 6)}vw`,
        height: `${rnd(14, 24 - layer * 2)}vh`,
      })),
    );
  }, []);

  // wind blows toward (windDeg + 180); screen-x component:
  const movesWest = Math.sin((windDeg * Math.PI) / 180) > 0.05;
  const windFactor = Math.min(windSpeed, 22) / 22;

  const baseColor = isNight
    ? stormy
      ? "26,32,46"
      : "120,136,172"
    : stormy
      ? "128,140,156"
      : "255,255,255";

  const layerAlpha = [0.5, 0.36, 0.24];
  const blur = [46, 64, 84];
  // base durations (seconds) per layer — parallax: far layers slower
  const baseDuration = [95, 150, 220];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {Array.from({ length: layers }).map((_, i) => {
        const duration = reducedMotion
          ? 0
          : (baseDuration[i] / (0.35 + windFactor * 1.5)) / intensityMult;
        return (
          <div
            key={i}
            className={`cloud-layer ${movesWest ? "reverse" : ""}`}
            style={{
              animationDuration: duration ? `${duration}s` : undefined,
              animationPlayState: reducedMotion ? "paused" : "running",
            }}
          >
            {blobs[i].map((b, j) => (
              <div
                key={j}
                className="absolute rounded-full"
                style={{
                  left: b.left,
                  top: b.top,
                  width: b.width,
                  height: b.height,
                  background: `radial-gradient(ellipse at center, rgba(${baseColor},${layerAlpha[i] * opacity}) 0%, rgba(${baseColor},${layerAlpha[i] * opacity * 0.4}) 45%, transparent 72%)`,
                  filter: `blur(${blur[i]}px)`,
                }}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
