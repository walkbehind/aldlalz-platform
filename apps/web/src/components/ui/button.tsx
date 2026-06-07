import { type ButtonHTMLAttributes } from "react";

type Variant =
  | "primary"
  | "accent"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-xs hover:bg-brand-600 active:bg-brand-700 focus-visible:ring-brand-500",
  accent:
    "bg-gold-500 text-brand-700 shadow-xs hover:bg-gold-400 active:bg-gold-600 focus-visible:ring-gold-500",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-muted hover:border-border-strong focus-visible:ring-brand-500",
  ghost: "text-text hover:bg-surface-muted focus-visible:ring-brand-500",
  outline:
    "border-2 border-brand-500 text-brand-600 hover:bg-brand-50 focus-visible:ring-brand-500",
  danger:
    "bg-danger text-white shadow-xs hover:opacity-90 focus-visible:ring-danger",
};

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm min-h-[36px] gap-1.5",
  md: "px-5 py-2.5 text-base min-h-[44px] gap-2",
  lg: "px-6 py-3 text-base min-h-[50px] gap-2",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
