/** Detailed health payloads are restricted in production unless HEALTHCHECK_SECRET is set. */
export function isDetailedHealthAllowed(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const secret = process.env.HEALTHCHECK_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const auth = request.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}
