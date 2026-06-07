"use client";

import { useState, useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { setUserPasswordAction } from "@/lib/admin/actions";

type Props = {
  userId: string;
  disabled?: boolean;
};

export function AdminSetPasswordForm({ userId, disabled }: Props) {
  const t = useTranslations("admin.users");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(
    null
  );

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await setUserPasswordAction(userId, password, confirmPassword);
      if (result.ok) {
        setPassword("");
        setConfirmPassword("");
        setMessage({ type: "ok", text: t("passwordUpdated") });
        router.refresh();
        return;
      }

      const key = result.error;
      setMessage({
        type: "error",
        text: tErrors.has(key as never) ? tErrors(key as never) : tErrors("SERVER_ERROR"),
      });
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[10rem] flex-1">
          <label htmlFor={`password-${userId}`} className="sr-only">
            {t("newPassword")}
          </label>
          <input
            id={`password-${userId}`}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("newPassword")}
            minLength={8}
            required
            disabled={pending || disabled}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div className="min-w-[10rem] flex-1">
          <label htmlFor={`confirm-password-${userId}`} className="sr-only">
            {t("confirmPassword")}
          </label>
          <input
            id={`confirm-password-${userId}`}
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t("confirmPassword")}
            minLength={8}
            required
            disabled={pending || disabled}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <Button
          type="submit"
          size="sm"
          disabled={pending || disabled || !password || !confirmPassword}
        >
          {t("setPassword")}
        </Button>
      </div>
      <p className="text-xs text-text-muted">{t("passwordHint")}</p>
      {message && (
        <p
          className={`text-xs ${message.type === "ok" ? "text-success" : "text-danger"}`}
          role="status"
        >
          {message.text}
        </p>
      )}
    </form>
  );
}
