import { type HTMLAttributes } from "react";

type BadgeVariant =
  | "brand"
  | "gold"
  | "success"
  | "neutral"
  | "danger"
  | "outline"
  | "dark";

const variants: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700",
  gold: "bg-gold-gradient text-brand-700 shadow-xs",
  success: "bg-success-soft text-success",
  neutral: "bg-surface-muted text-text-muted",
  danger: "bg-danger-soft text-danger",
  outline: "border border-border-strong bg-surface text-text-muted",
  dark: "bg-brand-700/90 text-white backdrop-blur",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({
  className = "",
  variant = "brand",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
