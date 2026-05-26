"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";

export function LoginForm() {
  const t = useTranslations("auth");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError(tErrors("INVALID_CREDENTIALS"));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="mx-auto max-w-md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <Alert>{error}</Alert>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("submittingLogin")}
            </>
          ) : (
            t("submitLogin")
          )}
        </Button>
        <p className="text-center text-sm text-text-muted">
          {t("noAccount")}{" "}
          <Link href="/register" className="text-brand-600 hover:underline">
            {t("registerTitle")}
          </Link>
        </p>
      </form>
    </Card>
  );
}
