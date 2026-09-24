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
      <div className="panel comic-body px-8 py-10 max-w-sm w-full flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-[var(--comic-red)] border-[3px] border-[var(--ink)] comic-shadow-sm flex items-center justify-center mb-6">
          <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
            <path d="M12 8v5M12 16.5h.01" />
            <circle cx="12" cy="12" r="9" />
          </svg>
        </div>
        <h2 className="comic-title text-[var(--ink)] text-2xl tracking-wide mb-2.5">
          OUT OF REACH!
        </h2>
        <p className="comic-body text-[var(--ink)]/55 text-[13.5px] font-bold leading-relaxed mb-8">{message}</p>
        <div className="flex flex-col gap-3 w-full">
          {retryable && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={onRetry}
              className="comic-body comic-press h-11 rounded-full bg-[var(--comic-yellow)] border-[3px] border-[var(--ink)] comic-shadow text-[var(--ink)] text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" /> Try again
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSearch}
            className="comic-body comic-press h-11 rounded-full bg-white border-[3px] border-[var(--ink)] comic-shadow-sm text-[var(--ink)]/75 text-[14px] font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <IconSearch className="w-4 h-4" /> Search another city
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
