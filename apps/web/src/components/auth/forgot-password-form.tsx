"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        locale: document.documentElement.lang === "en" ? "en" : "ar",
      }),
    });

    setLoading(false);
    if (!res.ok) {
      setError(tErrors("SERVER_ERROR"));
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <Card className="mx-auto max-w-md">
        <Alert variant="success">{t("resetEmailSent")}</Alert>
        <Link href="/login" className="mt-4 block text-center text-sm text-brand-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-sm text-text-muted">{t("forgotPasswordHint")}</p>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("sendingReset")}
            </>
          ) : (
            t("sendResetLink")
          )}
        </Button>
        <Link href="/login" className="text-center text-sm text-brand-600 hover:underline">
          {t("backToLogin")}
        </Link>
      </form>
    </Card>
  );
}
