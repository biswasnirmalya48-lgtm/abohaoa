import { motion } from "framer-motion";

/** Animated Abohaoa splash — the wordmark appears only here and in settings. */
export default function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #070b1c 0%, #101736 55%, #1e2a4f 100%)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
    >
      <div className="flex flex-col items-center gap-7">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-16 h-16"
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle at 40% 35%, #fff8e6, #ffd98e 55%, rgba(255,196,110,0.25) 75%, transparent)",
              boxShadow: "0 0 60px 18px rgba(255,214,150,0.25)",
            }}
          />
          <motion.div
            className="absolute -inset-5 rounded-full border border-white/15"
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1.25, opacity: [0, 0.7, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeOut" }}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="wordmark text-3xl tracking-[0.35em] font-light pl-[0.35em] select-none"
        >
          ABOHAOA
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className="w-24 h-px overflow-hidden relative"
        >
          <motion.div
            className="absolute inset-y-0 w-1/3 bg-white/60"
            animate={{ left: ["-35%", "100%"] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
