import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { bengaliDigits } from "../lib/units";

interface Props {
  value: number;
  className?: string;
  duration?: number;
}

/** Smoothly interpolates between temperature values. */
export default function AnimatedNumber({ value, className, duration = 0.9 }: Props) {
  const mv = useMotionValue(value);
  const text = useTransform(mv, (v) => bengaliDigits(Math.round(v)));

  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [value, duration, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
