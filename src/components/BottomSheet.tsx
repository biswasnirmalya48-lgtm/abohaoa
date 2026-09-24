import type { ReactNode } from "react";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { IconClose } from "./Icons";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  /** hide the built-in header (search sheet renders its own) */
  bare?: boolean;
  /** sheet max height, defaults to 88vh */
  maxHeight?: string;
}

/**
 * Mobile-native bottom sheet: springs up, backdrop blur, and a dedicated grabber
 * you can drag down to dismiss. Drag lives on the handle only, so the content
 * scrolls and buttons tap normally. Centered + capped width on large screens.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  bare = false,
  maxHeight = "88vh",
}: BottomSheetProps) {
  const onHandleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 90 || info.velocity.y > 650) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-[var(--ink)]/55 backdrop-blur-[6px]"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            data-no-pull
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
            className="relative w-full md:max-w-lg bg-[var(--paper)] border-[3px] border-[var(--ink)] rounded-t-[28px] flex flex-col overflow-hidden comic-shadow"
            style={{ maxHeight, height: "fit-content" }}
          >
            {/* drag handle — the only draggable region */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={onHandleDragEnd}
              className="shrink-0 pt-3 pb-1 touch-none cursor-grab active:cursor-grabbing flex justify-center"
            >
              <div className="grabber !bg-[var(--ink)]/40" />
            </motion.div>

            {!bare && (
              <div className="shrink-0 flex items-center justify-between px-6 pt-1 pb-3">
                <div className="min-w-0">
                  {title && (
                    <h2 className="comic-title text-[var(--ink)] text-[20px] tracking-wide truncate">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="comic-body text-[var(--ink)]/50 text-[12px] font-bold mt-0.5 truncate">{subtitle}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.88, rotate: 90 }}
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full bg-[var(--comic-red)] border-[2.5px] border-[var(--ink)] comic-shadow-sm text-white flex items-center justify-center cursor-pointer shrink-0 comic-press"
                >
                  <IconClose className="w-[17px] h-[17px]" />
                </motion.button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto thin-scroll overscroll-contain">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
