import { useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";

interface Props {
  reducedMotion: boolean;
  visible: boolean;
}

/**
 * Rare, soft lightning flashes for thunderstorms. Intentionally infrequent
 * (7–18s apart) so it never feels distracting or game-like.
 */
export default function Lightning({ reducedMotion, visible }: Props) {
  const flashRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<AnimationPlaybackControls | null>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (reducedMotion) return;

    const schedule = () => {
      const delay = 7000 + Math.random() * 11000;
      timerRef.current = window.setTimeout(() => {
        if (flashRef.current && visible && !document.hidden) {
          controlsRef.current?.stop();
          controlsRef.current = animate(flashRef.current, { opacity: [0, 0.4, 0.04, 0.26, 0] }, {
            duration: 0.65,
            ease: "easeOut",
            times: [0, 0.08, 0.2, 0.3, 1],
          });
        }
        schedule();
      }, delay);
    };

    schedule();
    return () => {
      window.clearTimeout(timerRef.current);
      controlsRef.current?.stop();
    };
  }, [reducedMotion, visible]);

  if (reducedMotion) return null;

  return (
    <div
      ref={flashRef}
      className="absolute inset-0 opacity-0 pointer-events-none"
      style={{
        background:
          "radial-gradient(ellipse 120% 70% at 60% -10%, rgba(214,226,255,0.85), rgba(190,205,250,0.25) 55%, transparent 75%)",
      }}
      aria-hidden="true"
    />
  );
}
