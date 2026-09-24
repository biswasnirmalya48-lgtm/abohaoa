import { useMemo } from "react";

interface Props {
  kind: "rain" | "heavy";
  reducedMotion: boolean;
  intensityMult: number;
}

/**
 * Very subtle glass-droplet layer for rain — a few droplets occasionally
 * slide down the "window", like condensation on glass.
 */
export default function GlassDroplets({ kind, reducedMotion, intensityMult }: Props) {
  const droplets = useMemo(() => {
    const count = Math.round((kind === "heavy" ? 10 : 6) * intensityMult);
    return Array.from({ length: count }, () => ({
      left: Math.random() * 96,
      size: 4 + Math.random() * 7,
      duration: 9 + Math.random() * 10,
      delay: Math.random() * 16,
      alpha: 0.08 + Math.random() * 0.14,
    }));
  }, [kind, intensityMult]);

  if (reducedMotion) return null;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {droplets.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full droplet"
          style={{
            left: `${d.left}%`,
            top: "-4%",
            width: d.size,
            height: d.size * 1.35,
            background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,${d.alpha * 2.4}), rgba(255,255,255,${d.alpha}) 60%, transparent 75%)`,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
