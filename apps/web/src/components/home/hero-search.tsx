"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Icon, type IconName } from "@/components/ui/icon";

type Tab = { type: string; label: string; icon: IconName };

type Props = {
  searchPlaceholder: string;
  searchButton: string;
  tabs: Tab[];
  popularLabel: string;
  popular: { label: string; href: string }[];
};

export function HeroSearch({
  searchPlaceholder,
  searchButton,
  tabs,
  popularLabel,
  popular,
}: Props) {
  const router = useRouter();
  const [type, setType] = useState<string>(tabs[0]?.type ?? "SALE");
  const [q, setQ] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set("listingType", type);
    if (q.trim()) params.set("q", q.trim());
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="w-full">
      {/* Listing-type tabs */}
      <div className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.type === type;
          return (
            <button
              key={tab.type}
              type="button"
              onClick={() => setType(tab.type)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-t-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                active
                  ? "bg-surface text-brand-600"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <Icon name={tab.icon} size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <form
        onSubmit={submit}
        className="flex flex-col gap-2 rounded-2xl rounded-ss-none bg-surface p-2 shadow-float sm:flex-row sm:items-center"
      >
        <div className="flex flex-1 items-center gap-2 px-3">
          <Icon name="search" size={20} className="shrink-0 text-text-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full bg-transparent py-2.5 text-base text-text placeholder:text-text-subtle focus:outline-none"
            aria-label={searchPlaceholder}
          />
        </div>
        <button
          type="submit"
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 text-base font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          <Icon name="search" size={18} />
          {searchButton}
        </button>
      </form>

      {/* Popular searches */}
      {popular.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-white/70">{popularLabel}:</span>
          {popular.map((p) => (
            <button
              key={p.href}
              type="button"
              onClick={() => router.push(p.href)}
              className="rounded-full border border-white/25 bg-white/5 px-3 py-1 text-white/90 transition-colors hover:border-gold-400 hover:text-gold-400"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
