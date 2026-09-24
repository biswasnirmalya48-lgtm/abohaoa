import { AnimatePresence, motion } from "framer-motion";
import type { Scene } from "../../lib/weatherScene";
import type { AnimationIntensity } from "../../store/useAppStore";
import Clouds from "./Clouds";
import Stars from "./Stars";
import Fog from "./Fog";
import Lightning from "./Lightning";
import PrecipCanvas from "./PrecipCanvas";
import GlassDroplets from "./GlassDroplets";

interface Props {
  scene: Scene | null;
  windDeg: number;
  windSpeed: number;
  intensity: AnimationIntensity;
  reducedMotion: boolean;
  visible: boolean;
}

const INTENSITY_MULT: Record<AnimationIntensity, number> = { low: 0.5, normal: 1, high: 1.4 };

const FALLBACK_SKY: [string, string, string] = ["#0d1330", "#1c2a52", "#38507e"];

/**
 * The full-screen weather atmosphere. Every visual layer reacts to the live
 * scene (condition, night, temperature, sun position, wind). Scene changes
 * crossfade over 1.6s — never abrupt.
 */
export default function WeatherScene({ scene, windDeg, windSpeed, intensity, reducedMotion, visible }: Props) {
  const mult = INTENSITY_MULT[intensity];

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <AnimatePresence initial={false}>
        <motion.div
          key={scene?.key ?? "fallback"}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.3 : 1.6, ease: "easeInOut" }}
        >
          {scene ? <SceneLayers scene={scene} windDeg={windDeg} windSpeed={windSpeed} mult={mult} reducedMotion={reducedMotion} visible={visible} /> : <FallbackSky />}
        </motion.div>
      </AnimatePresence>

      {/* depth vignette — constant across scenes */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 130% 100% at 50% 42%, transparent 52%, rgba(3,6,16,0.34) 100%)",
        }}
      />
    </div>
  );
}

function FallbackSky() {
  return (
    <div
      className="absolute inset-0"
      style={{ background: `linear-gradient(to bottom, ${FALLBACK_SKY.join(", ")})` }}
    />
  );
}

function SceneLayers({
  scene,
  windDeg,
  windSpeed,
  mult,
  reducedMotion,
  visible,
}: {
  scene: Scene;
  windDeg: number;
  windSpeed: number;
  mult: number;
  reducedMotion: boolean;
  visible: boolean;
}) {
  const { sky, celestial, kind, isNight } = scene;

  return (
    <>
      {/* base gradient */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${sky[0]} 0%, ${sky[1]} 52%, ${sky[2]} 100%)` }}
      />

      {/* sun / moon */}
      {celestial && (
        <div
          className="absolute"
          style={{ left: `${celestial.x}%`, top: `${celestial.y}%`, transform: "translate(-50%, -50%)" }}
        >
          {celestial.isMoon ? (
            <div className="relative">
              <div
                className="w-16 h-16 rounded-full sun-breathe"
                style={{
                  background: "radial-gradient(circle at 38% 34%, #f4f7ff, #cdd8f2 62%, #aab8dd)",
                  boxShadow: "0 0 60px 26px rgba(200,215,255,0.28), 0 0 160px 70px rgba(160,185,255,0.12)",
                }}
              />
            </div>
          ) : (
            <div className="relative">
              {/* soft warm glow */}
              <div
                className="absolute sun-breathe rounded-full"
                style={{
                  width: 460,
                  height: 460,
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                  background: `radial-gradient(circle, ${celestial.color} 0%, rgba(255,214,150,0.28) 26%, rgba(255,200,130,0.08) 52%, transparent 72%)`,
                }}
              />
              {/* gentle rays — clear days only */}
              {(kind === "clear" || kind === "partly") && !reducedMotion && (
                <div
                  className="absolute sun-rays rounded-full"
                  style={{
                    width: 720,
                    height: 720,
                    left: "50%",
                    top: "50%",
                    marginLeft: -360,
                    marginTop: -360,
                    background:
                      "conic-gradient(from 0deg, rgba(255,230,180,0.07) 0deg 8deg, transparent 8deg 34deg, rgba(255,230,180,0.05) 34deg 40deg, transparent 40deg 72deg, rgba(255,230,180,0.06) 72deg 79deg, transparent 79deg 118deg, rgba(255,230,180,0.05) 118deg 124deg, transparent 124deg 160deg, rgba(255,230,180,0.07) 160deg 168deg, transparent 168deg 208deg, rgba(255,230,180,0.05) 208deg 214deg, transparent 214deg 250deg, rgba(255,230,180,0.06) 250deg 258deg, transparent 258deg 300deg, rgba(255,230,180,0.05) 300deg 306deg, transparent 306deg 360deg)",
                    maskImage: "radial-gradient(circle, black 12%, transparent 68%)",
                    WebkitMaskImage: "radial-gradient(circle, black 12%, transparent 68%)",
                  }}
                />
              )}
              {/* sun disc */}
              <div
                className="relative w-20 h-20 rounded-full"
                style={{
                  background: "radial-gradient(circle at 42% 38%, #fff8e6, #ffe3a8 58%, rgba(255,214,140,0.55))",
                  boxShadow: "0 0 70px 30px rgba(255,220,160,0.4)",
                }}
              />
            </div>
          )}
        </div>
      )}

      {scene.stars && !reducedMotion && <Stars />}

      {scene.cloudLayers > 0 && (
        <Clouds
          layers={scene.cloudLayers}
          opacity={scene.cloudOpacity}
          kind={scene.kind}
          isNight={scene.isNight}
          windDeg={windDeg}
          windSpeed={windSpeed}
          intensityMult={mult}
          reducedMotion={reducedMotion}
        />
      )}

      {scene.fog && (
        <Fog windDeg={windDeg} windSpeed={windSpeed} isNight={scene.isNight} reducedMotion={reducedMotion} />
      )}

      {/* warm amber wash + subtle haze for hot weather */}
      {scene.haze && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 100% 60% at 50% 100%, rgba(255,176,84,0.22), transparent 65%)",
              mixBlendMode: "soft-light",
            }}
          />
          {!reducedMotion && (
            <div
              className="absolute inset-x-0 bottom-0 h-1/3 heat-haze"
              style={{
                background:
                  "linear-gradient(to top, rgba(255,200,140,0.09), transparent 85%)",
                filter: "blur(6px)",
              }}
            />
          )}
        </>
      )}

      {/* cold tint */}
      {scene.cold && scene.precip === "none" && (
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(190,215,240,0.08), transparent 55%)" }}
        />
      )}

      {scene.precip !== "none" && (
        <PrecipCanvas
          precip={scene.precip}
          windDeg={windDeg}
          windSpeed={windSpeed}
          intensity={intensityKey(mult)}
          reducedMotion={reducedMotion}
          visible={visible}
        />
      )}

      {(scene.precip === "rain" || scene.precip === "heavy") && !isNight && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(140,160,190,0.12), transparent 40%)" }}
        />
      )}

      {(scene.precip === "rain" || scene.precip === "heavy") && (
        <GlassDroplets kind={scene.precip} reducedMotion={reducedMotion} intensityMult={mult} />
      )}

      {scene.lightning && <Lightning reducedMotion={reducedMotion} visible={visible} />}
    </>
  );
}

function intensityKey(mult: number): AnimationIntensity {
  if (mult <= 0.5) return "low";
  if (mult >= 1.4) return "high";
  return "normal";
}
