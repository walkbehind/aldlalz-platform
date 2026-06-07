import type { AdminStatus } from "@aldlalz/database";
import { Badge } from "@/components/ui/badge";
import { ADMIN_STATUS_LABELS, labelFor } from "@/lib/listings/constants";

const styles: Record<AdminStatus, { badge: string; dot: string }> = {
  PENDING: { badge: "bg-amber-50 text-amber-800", dot: "bg-amber-500" },
  APPROVED: { badge: "bg-emerald-50 text-emerald-800", dot: "bg-emerald-500" },
  REJECTED: { badge: "bg-red-50 text-red-800", dot: "bg-red-500" },
};

function Dot({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`me-1.5 inline-block h-1.5 w-1.5 rounded-full ${className}`}
    />
  );
}

type Props = {
  status: AdminStatus;
  locale: string;
  draft?: boolean;
  draftLabel?: string;
};

export function ListingStatusBadge({
  status,
  locale,
  draft,
  draftLabel,
}: Props) {
  if (draft) {
    return (
      <Badge className="bg-slate-100 text-slate-700">
        <Dot className="bg-slate-400" />
        {draftLabel}
      </Badge>
    );
  }

  const style = styles[status];
  return (
    <Badge className={style.badge}>
      <Dot className={style.dot} />
      {labelFor(ADMIN_STATUS_LABELS, status, locale)}
    </Badge>
  );
}
