import { Badge } from "@/components/ui/badge";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  badge?: string;
};

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="mb-8">
      {badge && <Badge className="mb-3">{badge}</Badge>}
      <h1 className="text-3xl font-bold tracking-tight text-text">{title}</h1>
      {subtitle && (
        <p className="mt-2 max-w-2xl text-text-muted">{subtitle}</p>
      )}
    </div>
  );
}
