type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3000";
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "console";

  if (provider === "console" || process.env.NODE_ENV === "development") {
    console.info("[email]", {
      to: input.to,
      subject: input.subject,
      preview: input.text.slice(0, 200),
    });
    return;
  }

  // Future: Resend, SendGrid, etc.
  console.warn("[email] No production provider configured — logging only", input.to);
}

export async function sendVerificationEmail(email: string, token: string, locale: string) {
  const url = `${appUrl()}/api/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}&locale=${locale}`;
  const isAr = locale === "ar";

  await sendEmail({
    to: email,
    subject: isAr ? "تأكيد بريدك — الدلالز" : "Verify your email — Aldlalz",
    text: isAr
      ? `اضغط على الرابط لتأكيد بريدك:\n${url}`
      : `Click to verify your email:\n${url}`,
    html: isAr
      ? `<p>اضغط على الرابط لتأكيد بريدك:</p><p><a href="${url}">${url}</a></p>`
      : `<p>Click to verify your email:</p><p><a href="${url}">${url}</a></p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string, locale: string) {
  const url = `${appUrl()}/${locale}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  const isAr = locale === "ar";

  await sendEmail({
    to: email,
    subject: isAr ? "إعادة تعيين كلمة المرور — الدلالز" : "Reset your password — Aldlalz",
    text: isAr
      ? `اضغط على الرابط لإعادة تعيين كلمة المرور:\n${url}`
      : `Click to reset your password:\n${url}`,
    html: isAr
      ? `<p>اضغط على الرابط لإعادة تعيين كلمة المرور:</p><p><a href="${url}">${url}</a></p>`
      : `<p>Click to reset your password:</p><p><a href="${url}">${url}</a></p>`,
  });
}
