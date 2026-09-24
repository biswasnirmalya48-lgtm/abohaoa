interface Base {
  className?: string;
}

const s = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconSearch = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </svg>
);

export const IconBookmark = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M6.5 4.5h11v15l-5.5-4-5.5 4v-15Z" />
  </svg>
);

export const IconSettings = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
    <circle cx="16" cy="8" r="2" />
    <circle cx="8" cy="16" r="2" />
  </svg>
);

export const IconRefresh = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
    <path d="M17.8 3.5v3.8H14" />
  </svg>
);

export const IconClose = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const IconChevronLeft = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M14.5 5.5L8 12l6.5 6.5" />
  </svg>
);

export const IconChevronRight = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M9.5 5.5L16 12l-6.5 6.5" />
  </svg>
);

export const IconChevronUp = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M5.5 14.5L12 8l6.5 6.5" />
  </svg>
);

export const IconPin = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M12 21s-6.5-5.6-6.5-10.4a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21Z" />
    <circle cx="12" cy="10.4" r="2.3" />
  </svg>
);

export const IconTrash = ({ className = "w-4 h-4" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13" />
  </svg>
);

export const IconCheck = ({ className = "w-4 h-4" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M5 12.5l4.5 4.5L19 7" />
  </svg>
);

export const IconWind = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M4 9h11a2.5 2.5 0 1 0-2.5-2.5M4 15h8.5M15.5 15h3a2.5 2.5 0 1 1-2.5 2.5" />
  </svg>
);

export const IconDroplet = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M12 4.5s5.5 6 5.5 9.6a5.5 5.5 0 1 1-11 0C6.5 10.5 12 4.5 12 4.5Z" />
  </svg>
);

export const IconEye = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M3 12s3.5-5.5 9-5.5S21 12 21 12s-3.5 5.5-9 5.5S3 12 3 12Z" />
    <circle cx="12" cy="12" r="2.4" />
  </svg>
);

export const IconSunrise = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M12 4v4M5.5 10.5L7 12M18.5 10.5L17 12M3 17h18M6.8 17a5.2 5.2 0 0 1 10.4 0" />
  </svg>
);

export const IconSunset = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M12 8V4M5.5 10.5L7 12M18.5 10.5L17 12M3 17h18M6.8 17a5.2 5.2 0 0 1 10.4 0" />
  </svg>
);

export const IconUv = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </svg>
);

export const IconThermometer = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M10 13.6V5.5a2 2 0 1 1 4 0v8.1a4.5 4.5 0 1 1-4 0Z" />
  </svg>
);

export const IconCloudRain = ({ className = "w-5 h-5" }: Base) => (
  <svg viewBox="0 0 24 24" className={className} {...s}>
    <path d="M7 14.5h10.2a3.3 3.3 0 0 0 .3-6.6 5.2 5.2 0 0 0-10-1.5A3.9 3.9 0 0 0 7 14.5Z" />
    <path d="M9 17.8l-.7 2.2M12.4 17.8l-.7 2.2M15.8 17.8l-.7 2.2" />
  </svg>
);

export const IconStar = ({ className = "w-4 h-4", filled = false }: Base & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" className={className} {...s} fill={filled ? "currentColor" : "none"}>
    <path d="M12 4l2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z" />
  </svg>
);
