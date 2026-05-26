/** Map server/API error codes to i18n keys under `errors.*` */
export const AppErrorCode = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION: "VALIDATION",
  NOT_FOUND: "NOT_FOUND",
  SERVER_ERROR: "SERVER_ERROR",
  STORAGE_NOT_CONFIGURED: "STORAGE_NOT_CONFIGURED",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type AppErrorCode = (typeof AppErrorCode)[keyof typeof AppErrorCode];

export function errorCodeFromUnknown(error: unknown): string {
  if (error instanceof Error) return error.message;
  return AppErrorCode.SERVER_ERROR;
}

/** Next.js redirect() throws — must rethrow in client catch blocks */
export function isNextRedirect(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const digest = (error as { digest?: string }).digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export function validationKeyFromForm(
  parsed: { success: false; error: { issues: { message: string }[] } } | { success: true }
): string {
  if (parsed.success) return AppErrorCode.VALIDATION;
  return parsed.error.issues[0]?.message ?? AppErrorCode.VALIDATION;
}
