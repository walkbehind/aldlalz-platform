import { type ReactNode } from "react";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function Spinner({ className = "", size = "md" }: Props) {
  const dim = size === "sm" ? "h-4 w-4 border-2" : "h-6 w-6 border-2";
  return (
    <span
      role="status"
      aria-hidden
      className={`inline-block animate-spin rounded-full border-brand-600 border-t-transparent ${dim} ${className}`}
    />
  );
}

export function LoadingRow({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-2 rounded-xl bg-surface-muted px-4 py-8 text-sm text-text-muted"
      aria-live="polite"
    >
      <Spinner size="sm" />
      <span>{label}</span>
    </div>
  );
}

type EmptyProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
      <p className="font-medium text-text">{title}</p>
      {description && (
        <p className="mt-2 max-w-md text-sm text-text-muted">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

type AlertProps = {
  variant?: "error" | "warning" | "success";
  title?: string;
  children: ReactNode;
};

export function Alert({ variant = "error", title, children }: AlertProps) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-900",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    success: "border-green-200 bg-green-50 text-green-900",
  }[variant];

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${styles}`}
      role="alert"
    >
      {title && <p className="font-medium">{title}</p>}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}
