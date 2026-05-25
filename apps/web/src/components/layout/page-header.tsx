import { type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
};

export function PageHeader({
  title,
  subtitle,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-8">
      {(badge || actions) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          {typeof badge === "string" ? <Badge>{badge}</Badge> : badge}
          {actions}
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight text-text">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
