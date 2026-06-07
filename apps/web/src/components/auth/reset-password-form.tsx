"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";

type Props = {
  token: string;
  email: string;
};

export function ResetPasswordForm({ token, email }: Props) {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(tErrors("INVALID_INPUT"));
      return;
    }
    if (password !== confirm) {
      setError(tErrors("PASSWORD_MISMATCH"));
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token, password }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const code = typeof data.error === "string" ? data.error : "SERVER_ERROR";
      setError(tErrors.has(code) ? tErrors(code) : tErrors("SERVER_ERROR"));
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">{t("resetPasswordHint")}</p>
        <div>
          <Label htmlFor="password">{t("newPassword")}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="confirm">{t("confirmPassword")}</Label>
          <Input
            id="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("resettingPassword")}
            </>
          ) : (
            t("resetPassword")
          )}
        </Button>
        <Link href="/login" className="text-center text-sm text-brand-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </form>
    </Card>
  );
}
