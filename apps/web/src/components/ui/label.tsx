import { type LabelHTMLAttributes, type ReactNode } from "react";

export function Label({
  className = "",
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { children: ReactNode }) {
  return (
    <label
      className={`mb-1.5 block text-sm font-medium text-text ${className}`}
      {...props}
    >
      {children}
    </label>
  );
}
