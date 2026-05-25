import { type TextareaHTMLAttributes } from "react";

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`min-h-28 w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-text placeholder:text-text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className}`}
      {...props}
    />
  );
}
