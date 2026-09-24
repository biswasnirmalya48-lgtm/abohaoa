import { useEffect, useRef } from "react";
import type { AnimationIntensity } from "../../store/useAppStore";
import { windVector } from "../../lib/weatherScene";

interface Props {
  precip: "rain" | "heavy" | "snow";
  windDeg: number;
  windSpeed: number;
  intensity: AnimationIntensity;
  reducedMotion: boolean;
  visible: boolean;
}

const INTENSITY_MULT: Record<AnimationIntensity, number> = { low: 0.4, normal: 1, high: 1.6 };

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  alpha: number;
}

interface SnowFlake {
  x: number;
  y: number;
  r: number;
  vy: number;
  phase: number;
  sway: number;
  alpha: number;
  blurLayer: boolean;
}

/**
 * Canvas particle layer for rain / heavy rain / snow. Motion follows the real
 * wind vector; count scales with the user's animation-intensity setting.
 * Pauses when the page is hidden; renders one static frame for reduced motion.
 */
export default function PrecipCanvas({ precip, windDeg, windSpeed, intensity, reducedMotion, visible }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mult = INTENSITY_MULT[intensity];
    const wind = windVector(windDeg, windSpeed);
    // screen drift: stronger wind → more slant, capped for readability
    const driftX = Math.max(-14, Math.min(14, wind.vx * 0.9));

    const isSnow = precip === "snow";
    const heavy = precip === "heavy";

    let drops: RainDrop[] = [];
    let flakes: SnowFlake[] = [];

    if (isSnow) {
      const count = Math.round(110 * mult);
      flakes = Array.from({ length: count }, () => ({
        x: Math.random() * (w + 80) - 40,
        y: Math.random() * h,
        r: 0.8 + Math.random() * 2.6,
        vy: 0.35 + Math.random() * 1.1,
        phase: Math.random() * Math.PI * 2,
        sway: 0.3 + Math.random() * 0.9,
        alpha: 0.3 + Math.random() * 0.6,
        blurLayer: Math.random() > 0.7,
      }));
    } else {
      const count = Math.round((heavy ? 260 : 130) * mult);
      drops = Array.from({ length: count }, () => ({
        x: Math.random() * (w + 120) - 60,
        y: Math.random() * h,
        len: heavy ? 14 + Math.random() * 26 : 9 + Math.random() * 16,
        speed: (heavy ? 15 : 11) + Math.random() * 8,
        alpha: 0.12 + Math.random() * 0.3,
      }));
    }

    let raf = 0;

    const drawFrame = (advance: boolean) => {
      ctx.clearRect(0, 0, w, h);

      if (isSnow) {
        for (const f of flakes) {
          if (advance) {
            f.phase += 0.016;
            f.y += f.vy * (f.blurLayer ? 0.55 : 1);
            f.x += driftX * 0.16 + Math.sin(f.phase) * f.sway * 0.35;
            if (f.y > h + 8) {
              f.y = -8;
              f.x = Math.random() * (w + 80) - 40;
            }
            if (f.x > w + 40) f.x = -40;
            if (f.x < -40) f.x = w + 40;
          }
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.blurLayer ? f.r * 1.7 : f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${f.blurLayer ? f.alpha * 0.25 : f.alpha})`;
          ctx.fill();
        }
      } else {
        ctx.lineCap = "round";
        const angleX = driftX * 0.5;
        for (const d of drops) {
          if (advance) {
            d.y += d.speed * (heavy ? 1.25 : 1);
            d.x += angleX * 0.6;
            if (d.y > h + 20) {
              d.y = -20 - Math.random() * 60;
              d.x = Math.random() * (w + 120) - 60;
            }
            if (d.x > w + 60) d.x = -60;
            if (d.x < -60) d.x = w + 60;
          }
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - angleX, d.y - d.len);
          ctx.strokeStyle = `rgba(205,222,245,${d.alpha})`;
          ctx.lineWidth = heavy ? 1.3 : 1;
          ctx.stroke();
        }
      }
    };

    if (reducedMotion) {
      drawFrame(false);
      const onResize = () => {
        resize();
        drawFrame(false);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        ctx.clearRect(0, 0, w, h);
      };
    }

    const loop = () => {
      if (visible && !document.hidden) {
        drawFrame(true);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      ctx.clearRect(0, 0, w, h);
    };
  }, [precip, windDeg, windSpeed, intensity, reducedMotion, visible]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" aria-hidden="true" />;
}
