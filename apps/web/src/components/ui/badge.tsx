import { type HTMLAttributes } from "react";

type BadgeVariant = "brand" | "gold" | "success" | "neutral";

const variants: Record<BadgeVariant, string> = {
  brand: "bg-brand-50 text-brand-700",
  gold: "bg-gold-500 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-surface-muted text-text-muted",
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
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
