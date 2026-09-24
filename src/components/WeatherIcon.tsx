interface Props {
  icon: string; // OWM icon code: 01d, 02n, 10d, ...
  className?: string;
  strokeWidth?: number;
}

/**
 * Thin, minimal line weather icons keyed by OpenWeatherMap icon codes.
 */
export default function WeatherIcon({ icon, className = "w-6 h-6", strokeWidth = 1.5 }: Props) {
  const code = icon.slice(0, 2);
  const night = icon.endsWith("n");
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  const sun = (
    <g {...common}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 3.2v1.8M12 19v1.8M3.2 12H5M19 12h1.8M5.8 5.8l1.3 1.3M16.9 16.9l1.3 1.3M5.8 18.2l1.3-1.3M16.9 7.1l1.3-1.3" />
    </g>
  );

  const moon = (
    <g {...common}>
      <path d="M19.5 14.2A7.8 7.8 0 0 1 9.8 4.5a7.9 7.9 0 1 0 9.7 9.7Z" />
    </g>
  );

  const cloud = (
    <g {...common}>
      <path d="M7 18h10.2a3.3 3.3 0 0 0 .3-6.6 5.2 5.2 0 0 0-10-1.5A3.9 3.9 0 0 0 7 18Z" />
    </g>
  );

  const smallSun = (
    <g {...common}>
      <circle cx="9" cy="8.6" r="3.1" />
      <path d="M9 2.9v1.2M3.6 8.6H2.4M14.4 8.6h1.2M5.2 4.8l.8.8M12.8 4.8l-.8.8" />
    </g>
  );

  const smallMoon = (
    <g {...common}>
      <path d="M14.6 9.6A5 5 0 0 1 9 4a5.2 5.2 0 1 0 5.6 5.6Z" />
    </g>
  );

  switch (code) {
    case "01":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          {night ? moon : sun}
        </svg>
      );
    case "02":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          {night ? smallMoon : smallSun}
          <g {...common}>
            <path d="M8.5 20.5h8.7a2.9 2.9 0 0 0 .3-5.8 4.6 4.6 0 0 0-8.8-1.3 3.5 3.5 0 0 0-.2 7.1Z" />
          </g>
        </svg>
      );
    case "03":
    case "04":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          {code === "04" ? (
            <g {...common}>
              <path d="M7.8 15.2h8.9a3 3 0 0 0 .2-6 4.8 4.8 0 0 0-9.2-1.3 3.6 3.6 0 0 0 .1 7.3Z" />
              <path d="M6 18.6h12.5" opacity="0.6" />
            </g>
          ) : (
            cloud
          )}
        </svg>
      );
    case "09":
    case "10":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          {code === "10" ? (night ? smallMoon : smallSun) : null}
          <g {...common}>
            <path d={code === "10" ? "M8.5 15.5h8.7a2.9 2.9 0 0 0 .3-5.8 4.6 4.6 0 0 0-8.8-1.3 3.5 3.5 0 0 0-.2 7.1Z" : "M7 14.5h10.2a3.3 3.3 0 0 0 .3-6.6 5.2 5.2 0 0 0-10-1.5A3.9 3.9 0 0 0 7 14.5Z"} />
            <path d="M8.6 17.8l-.8 2.4M12.2 17.8l-.8 2.4M15.8 17.8l-.8 2.4" />
          </g>
        </svg>
      );
    case "11":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <g {...common}>
            <path d="M7 14.5h10.2a3.3 3.3 0 0 0 .3-6.6 5.2 5.2 0 0 0-10-1.5A3.9 3.9 0 0 0 7 14.5Z" />
            <path d="M13 16.6l-2.6 3h2.4l-1.4 3" />
          </g>
        </svg>
      );
    case "13":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <g {...common}>
            <path d="M7 14.5h10.2a3.3 3.3 0 0 0 .3-6.6 5.2 5.2 0 0 0-10-1.5A3.9 3.9 0 0 0 7 14.5Z" />
            <path d="M9 18h.01M12 18h.01M15 18h.01M10.5 20.5h.01M13.5 20.5h.01" strokeWidth={2} />
          </g>
        </svg>
      );
    case "50":
      return (
        <svg viewBox="0 0 24 24" className={className}>
          <g {...common}>
            <path d="M4 9h16M5.5 13h13M4 17h16M7 5h10" opacity="0.85" />
          </g>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" className={className}>
          {cloud}
        </svg>
      );
  }
}
