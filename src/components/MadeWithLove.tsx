import { motion, useReducedMotion } from "framer-motion";

interface Props {
  className?: string;
  delay?: number;
}

/** Tiny comic caption credit, set at the foot of every surface. */
export default function MadeWithLove({ className = "", delay = 0.4 }: Props) {
  const reduced = useReducedMotion();

  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={`comic-body flex items-center justify-center gap-1.5 -rotate-1 select-none text-[10.5px] font-bold tracking-[0.06em] text-[var(--ink)]/45 ${className}`}
    >
      made with
      <motion.span
        aria-hidden="true"
        className="inline-block leading-none text-[var(--comic-red)]"
        animate={reduced ? undefined : { scale: [1, 1.3, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
      >
        ♥
      </motion.span>
      by Nirmalya
    </motion.p>
  );
}
