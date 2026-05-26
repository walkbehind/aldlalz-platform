import { type InputHTMLAttributes } from "react";

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm min-h-[44px] ${className}`}
      {...props}
    />
  );
}
