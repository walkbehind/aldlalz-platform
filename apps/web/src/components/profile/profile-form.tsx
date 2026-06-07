"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, Spinner } from "@/components/ui/feedback";
import { updateProfileAction } from "@/lib/profile/actions";
import { formatKuwaitPhoneDisplay } from "@/lib/contact/phone";

type Profile = {
  email: string;
  emailVerified: Date | null;
  nameAr: string | null;
  nameEn: string | null;
  phone: string | null;
  langPreference: string;
};

type Props = {
  profile: Profile;
  labels: {
    title: string;
    subtitle: string;
    email: string;
    emailVerified: string;
    emailNotVerified: string;
    resendVerification: string;
    resendSent: string;
    nameAr: string;
    nameEn: string;
    phone: string;
    phoneHint: string;
    langPreference: string;
    langAr: string;
    langEn: string;
    save: string;
    saving: string;
    saved: string;
  };
};

export function ProfileForm({ profile, labels }: Props) {
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const [nameAr, setNameAr] = useState(profile.nameAr ?? "");
  const [nameEn, setNameEn] = useState(profile.nameEn ?? "");
  const [phone, setPhone] = useState(
    profile.phone ? formatKuwaitPhoneDisplay(profile.phone) : ""
  );
  const [langPreference, setLangPreference] = useState(
    profile.langPreference === "en" ? "en" : "ar"
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const formData = new FormData();
    formData.set("nameAr", nameAr);
    formData.set("nameEn", nameEn);
    formData.set("phone", phone);
    formData.set("langPreference", langPreference);

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (!result.ok) {
        const code = result.error;
        setError(tErrors.has(code) ? tErrors(code) : tErrors("SERVER_ERROR"));
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  async function resendVerification() {
    setResendMsg("");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setResendMsg(res.ok ? labels.resendSent : labels.resendVerification);
  }

  return (
    <Card className="mx-auto max-w-lg">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-text">{labels.title}</h1>
        <p className="mt-1 text-sm text-text-muted">{labels.subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">{labels.email}</Label>
          <Input id="email" type="email" value={profile.email} disabled />
          <p className="mt-1 text-xs text-text-muted">
            {profile.emailVerified
              ? labels.emailVerified
              : labels.emailNotVerified}
          </p>
          {!profile.emailVerified && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={resendVerification}
            >
              {labels.resendVerification}
            </Button>
          )}
          {resendMsg && (
            <p className="mt-1 text-xs text-success">{resendMsg}</p>
          )}
        </div>

        <div>
          <Label htmlFor="nameAr">{labels.nameAr}</Label>
          <Input
            id="nameAr"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="nameEn">{labels.nameEn}</Label>
          <Input
            id="nameEn"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            dir="ltr"
          />
        </div>

        <div>
          <Label htmlFor="phone">{labels.phone}</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="9XXX XXXX"
            dir="ltr"
          />
          <p className="mt-1 text-xs text-text-muted">{labels.phoneHint}</p>
        </div>

        <div>
          <Label htmlFor="langPreference">{labels.langPreference}</Label>
          <select
            id="langPreference"
            value={langPreference}
            onChange={(e) => setLangPreference(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <option value="ar">{labels.langAr}</option>
            <option value="en">{labels.langEn}</option>
          </select>
        </div>

        {error && <Alert>{error}</Alert>}
        {success && <Alert variant="success">{labels.saved}</Alert>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? (
            <>
              <Spinner size="sm" className="me-2" />
              {labels.saving}
            </>
          ) : (
            labels.save
          )}
        </Button>
      </form>
    </Card>
  );
}
