"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";

export function RegisterForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, locale: document.documentElement.lang === "en" ? "en" : "ar" }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      const code = typeof data.error === "string" ? data.error : "SERVER_ERROR";
      const known = ["EMAIL_TAKEN", "INVALID_INPUT", "SERVER_ERROR"] as const;
      setError(
        known.includes(code as (typeof known)[number])
          ? tErrors(code as (typeof known)[number])
          : tErrors("SERVER_ERROR")
      );
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">{t("name")}</Label>
          <Input
            id="name"
            type="text"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">{t("email")}</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="password">{t("password")}</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("submittingRegister")}
            </>
          ) : (
            t("submitRegister")
          )}
        </Button>
        <p className="text-center text-sm text-text-muted">
          {t("hasAccount")}{" "}
          <Link href="/login" className="text-brand-600 hover:underline">
            {t("loginTitle")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
