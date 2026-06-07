import { type ReactNode } from "react";

type Tone = "brand" | "gold" | "success" | "neutral";

const toneStyles: Record<Tone, string> = {
  brand: "bg-brand-50 text-brand-600",
  gold: "bg-gold-100 text-gold-700",
  success: "bg-emerald-50 text-emerald-700",
  neutral: "bg-surface-muted text-text-muted",
};

type Props = {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
};

export function StatCard({ label, value, icon, tone = "brand" }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-[var(--radius-card)] border border-border bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5">
      {icon && (
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneStyles[tone]}`}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-text">
          {value}
        </p>
      </div>
    </div>
  );
}
