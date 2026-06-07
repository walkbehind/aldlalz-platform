type BrandLogoProps = {
  /** "full" renders the icon + wordmark; "icon" renders just the mark. */
  variant?: "full" | "icon";
  /** "default" for light surfaces, "light" for dark/navy surfaces. */
  tone?: "default" | "light";
  locale?: string;
  className?: string;
};

/**
 * Themeable Aldlalz brand lockup (navy + gold), real-estate + Kuwait motif:
 * building skyline, a Kuwait Towers spire, an upward growth arrow, and a
 * location pin. Rendered as inline SVG so it stays crisp and recolors per tone.
 * To use the official raster logo instead, drop it in /public/brand and swap.
 */
export function BrandLogo({
  variant = "full",
  tone = "default",
  locale = "ar",
  className = "",
}: BrandLogoProps) {
  const navy = tone === "light" ? "#ffffff" : "#0a2d5e";
  const gold = "#d4af57";
  const wordmark = locale === "en" ? "Aldlalz" : "الدلالز";

  const mark = (
    <svg
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      fill="none"
      aria-hidden="true"
      className="h-full w-auto"
    >
      {/* buildings */}
      <rect x="6" y="20" width="7" height="22" rx="1" fill={navy} />
      <rect x="15" y="12" width="8" height="30" rx="1" fill={navy} />
      {/* window lines */}
      <g stroke={tone === "light" ? "#0a2d5e" : "#ffffff"} strokeWidth="1" opacity="0.5">
        <line x1="17" y1="17" x2="21" y2="17" />
        <line x1="17" y1="22" x2="21" y2="22" />
        <line x1="17" y1="27" x2="21" y2="27" />
      </g>
      {/* Kuwait Towers spire */}
      <line x1="29" y1="8" x2="29" y2="42" stroke={gold} strokeWidth="2" />
      <circle cx="29" cy="14" r="3.2" fill={gold} />
      <circle cx="29" cy="22" r="2.2" fill={gold} />
      {/* growth arrow */}
      <path
        d="M33 30 L38 24 L41 27 L41 20 L34 20 L37 23 L33 27 Z"
        fill={gold}
      />
      {/* location pin */}
      <path
        d="M20 30c0-3.3 2.7-6 6-6s6 2.7 6 6c0 4.5-6 10-6 10s-6-5.5-6-10z"
        fill={navy}
        stroke={gold}
        strokeWidth="1.2"
      />
      <circle cx="26" cy="30" r="2.2" fill={gold} />
    </svg>
  );

  if (variant === "icon") {
    return (
      <span className={`inline-block ${className}`} aria-label="Aldlalz">
        {mark}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="h-9 w-9 shrink-0">{mark}</span>
      <span
        className="text-2xl font-bold tracking-tight"
        style={{ color: navy }}
      >
        {wordmark}
      </span>
    </span>
  );
}
