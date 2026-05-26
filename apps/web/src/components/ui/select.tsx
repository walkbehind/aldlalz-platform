import { type SelectHTMLAttributes } from "react";

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-base text-text focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 sm:text-sm min-h-[44px] ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
