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
            className="absolute inset-0 bg-black/50 backdrop-blur-[6px]"
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
            className="relative w-full md:max-w-lg glass rounded-t-[28px] flex flex-col overflow-hidden shadow-[0_-10px_60px_rgba(0,0,0,0.45)]"
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
              <div className="grabber" />
            </motion.div>

            {!bare && (
              <div className="shrink-0 flex items-center justify-between px-6 pt-1 pb-3">
                <div className="min-w-0">
                  {title && (
                    <h2 className="text-white text-[17px] font-semibold tracking-tight truncate">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-white/45 text-[12px] font-light mt-0.5 truncate">{subtitle}</p>
                  )}
                </div>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.88, rotate: 90 }}
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full bg-white/10 text-white/70 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
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
