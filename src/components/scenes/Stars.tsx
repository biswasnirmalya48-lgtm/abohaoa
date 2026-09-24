import { useMemo } from "react";

interface Props {
  count?: number;
}

/** Sparse twinkling stars for clear / partly-cloudy nights. */
export default function Stars({ count = 64 }: Props) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        top: Math.random() * 72,
        size: 1 + Math.random() * 1.8,
        duration: 2.6 + Math.random() * 4.5,
        delay: Math.random() * 6,
        min: 0.1 + Math.random() * 0.2,
        max: 0.55 + Math.random() * 0.45,
      })),
    [count],
  );

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ["--star-min" as string]: s.min,
            ["--star-max" as string]: s.max,
          }}
        />
      ))}
    </div>
  );
}
