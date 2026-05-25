import type { AdminStatus } from "@aldlalz/database";
import { Badge } from "@/components/ui/badge";
import { ADMIN_STATUS_LABELS, labelFor } from "@/lib/listings/constants";

const styles: Record<AdminStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800",
  APPROVED: "bg-emerald-50 text-emerald-800",
  REJECTED: "bg-red-50 text-red-800",
};

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
      <Badge className="bg-slate-100 text-slate-700">{draftLabel}</Badge>
    );
  }

  return (
    <Badge className={styles[status]}>
      {labelFor(ADMIN_STATUS_LABELS, status, locale)}
    </Badge>
  );
}
