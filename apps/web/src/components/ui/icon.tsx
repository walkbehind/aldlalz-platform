import { type SVGProps } from "react";

/**
 * Lightweight inline icon set (no runtime dependency). Each icon inherits
 * `currentColor` and a 24×24 viewBox, sized via width/height or className.
 * Stroke-based, 1.8 weight — tuned for a premium real-estate UI.
 */

export type IconName =
  | "search"
  | "mapPin"
  | "bed"
  | "bath"
  | "ruler"
  | "car"
  | "building"
  | "key"
  | "calendar"
  | "sparkles"
  | "phone"
  | "whatsapp"
  | "share"
  | "heart"
  | "chevronLeft"
  | "chevronRight"
  | "chevronDown"
  | "arrowRight"
  | "arrowUpRight"
  | "check"
  | "checkCircle"
  | "shield"
  | "star"
  | "eye"
  | "clock"
  | "plus"
  | "filter"
  | "menu"
  | "close"
  | "trendingUp"
  | "layers"
  | "image"
  | "users"
  | "headset"
  | "pencil"
  | "verified";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
  size?: number;
};

const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  mapPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  bed: (
    <>
      <path d="M3 8v11M3 12h18a0 0 0 0 1 0 0v7M21 19v-7a4 4 0 0 0-4-4H8" />
      <path d="M7 12a2 2 0 1 1 0-.01" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12V6a2 2 0 0 1 2-2 2 2 0 0 1 2 2" />
      <path d="M3 12h18v3a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <path d="M6 19v2M18 19v2" />
    </>
  ),
  ruler: (
    <>
      <path d="M3 16.5 16.5 3l4.5 4.5L7.5 21Z" />
      <path d="M9 9l1.5 1.5M12 6l1.5 1.5M6 12l1.5 1.5" />
    </>
  ),
  car: (
    <>
      <path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13" />
      <path d="M4 13h16v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <path d="M7 16h.01M17 16h.01" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M9 7h.01M15 7h.01M9 11h.01M15 11h.01M9 15h.01M15 15h.01M10 21v-3h4v3" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="8" r="4" />
      <path d="m10.8 10.8 8 8M16 16l2-2M18.5 18.5l1.5-1.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </>
  ),
  sparkles: (
    <>
      <path d="M12 3l1.8 4.8L18.5 9.5 13.8 11.3 12 16l-1.8-4.7L5.5 9.5l4.7-1.7Z" />
      <path d="M18 14l.8 2L21 16.8l-2.1.9L18 20l-.9-2.3L15 16.8l2.1-.8Z" />
    </>
  ),
  phone: (
    <path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 5 5l1.5-2 4 1.5V18a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  ),
  whatsapp: (
    <>
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
      <path d="M8.5 8.2c.2-.5.4-.5.7-.5h.5c.2 0 .4 0 .6.5l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6a6 6 0 0 0 2.6 2.3c.3.1.4.1.6-.1l.6-.7c.2-.2.3-.2.6-.1l1.5.7c.3.2.4.3.4.5 0 .6-.4 1.4-.8 1.6-.6.4-1.4.5-3-.1a9 9 0 0 1-4.4-4.2c-.5-1-.6-1.9-.1-2.6Z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" />
    </>
  ),
  heart: (
    <path d="M12 20s-7-4.6-9-9.2C1.6 7.3 3.5 4.5 6.6 4.5c1.9 0 3.2 1.1 4 2.2.8-1.1 2.1-2.2 4-2.2 3.1 0 5 2.8 3.6 6.3-2 4.6-8.2 9.2-8.2 9.2Z" />
  ),
  chevronLeft: <path d="m14 6-6 6 6 6" />,
  chevronRight: <path d="m10 6 6 6-6 6" />,
  chevronDown: <path d="m6 10 6 6 6-6" />,
  arrowRight: <path d="M4 12h16m-6-6 6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7m-8 0h8v8" />,
  check: <path d="m5 12 5 5 9-10" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 5-5.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 7.7 7 9 4-1.3 7-4.5 7-9V6Z" />
      <path d="m9 12 2 2 4-4.5" />
    </>
  ),
  star: (
    <path d="M12 3.5 14.6 9l6 .5-4.6 4 1.4 5.9L12 16.6 6.6 19.4 8 13.5l-4.6-4 6-.5Z" />
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  filter: <path d="M3 5h18l-7 8v6l-4-2v-4Z" />,
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trendingUp: <path d="m3 16 5-5 4 4 7-8m0 0h-5m5 0v5" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5Z" />
      <path d="m3 13 9 5 9-5M3 18l9 5 9-5" opacity="0.5" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="9.5" r="1.8" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M16 6.2a3 3 0 0 1 0 5.6M20.5 19a5 5 0 0 0-3.5-4.7" />
    </>
  ),
  headset: (
    <>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0v-2a2 2 0 0 1 2-2ZM20 13a2 2 0 0 0-2 2v2a2 2 0 0 0 4 0v-2a2 2 0 0 0-2-2Z" />
      <path d="M20 17v1a3 3 0 0 1-3 3h-3" />
    </>
  ),
  pencil: <path d="M4 20h4L19 9l-4-4L4 16v4ZM14 6l4 4" />,
  verified: (
    <>
      <path d="m12 2.5 2.3 1.7 2.8-.3 1 2.7 2.4 1.5-.7 2.7.7 2.7-2.4 1.5-1 2.7-2.8-.3L12 21.5l-2.3-1.6-2.8.3-1-2.7-2.4-1.5.7-2.7-.7-2.7 2.4-1.5 1-2.7 2.8.3Z" />
      <path d="m8.8 12 2.2 2.2 4.2-4.6" />
    </>
  ),
};

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  const filled = name === "star" || name === "heart";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
