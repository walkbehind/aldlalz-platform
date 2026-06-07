import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/icon";

type Props = {
  title: string;
  description: string;
  actionLabel: string;
  href: string;
};

export function ContactCompletionBanner({
  title,
  description,
  actionLabel,
  href,
}: Props) {
  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning-soft p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
          <Icon name="phone" size={20} />
        </span>
        <div>
          <p className="font-semibold text-text">{title}</p>
          <p className="mt-0.5 text-sm text-text-muted">{description}</p>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white hover:bg-brand-600"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
