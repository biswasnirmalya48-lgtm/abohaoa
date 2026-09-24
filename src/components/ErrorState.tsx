import { motion } from "framer-motion";
import { IconRefresh, IconSearch } from "./Icons";

interface Props {
  message: string;
  retryable: boolean;
  onRetry: () => void;
  onSearch: () => void;
}

export default function ErrorState({ message, retryable, onRetry, onSearch }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-40 flex items-center justify-center px-8"
    >
      <div className="glass rounded-3xl px-8 py-10 max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-white/[0.07] flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
            <path d="M12 8v5M12 16.5h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 className="text-white text-lg font-light tracking-tight mb-2.5">
          The sky is out of reach
        </h2>
        <p className="text-white/50 text-[13.5px] font-light leading-relaxed mb-8">{message}</p>
        <div className="flex flex-col gap-2.5 w-full">
          {retryable && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRetry}
              className="h-11 rounded-full bg-white/90 text-slate-900 text-[14px] font-normal flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" /> Try again
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSearch}
            className="h-11 rounded-full glass glass-text text-[14px] font-light flex items-center justify-center gap-2 cursor-pointer"
          >
            <IconSearch className="w-4 h-4" /> Search another city
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
