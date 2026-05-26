import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 focus-visible:ring-brand-500",
  secondary:
    "bg-surface text-text border border-border hover:bg-surface-muted",
  ghost: "text-text hover:bg-surface-muted",
  outline:
    "border-2 border-brand-500 text-brand-600 hover:bg-brand-50",
};

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "px-3 py-2 text-sm min-h-[36px]",
  md: "px-5 py-2.5 text-base min-h-[44px]",
  lg: "px-6 py-3 text-lg min-h-[48px]",
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
      className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
