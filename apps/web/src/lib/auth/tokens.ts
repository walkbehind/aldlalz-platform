import { randomBytes } from "crypto";
import { prisma } from "@aldlalz/database";

const TOKEN_BYTES = 32;
const EMAIL_VERIFY_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

export type TokenPurpose = "email-verify" | "password-reset";

function identifierFor(purpose: TokenPurpose, email: string) {
  const normalized = email.toLowerCase().trim();
  return purpose === "email-verify"
    ? normalized
    : `password-reset:${normalized}`;
}

export async function createAuthToken(
  purpose: TokenPurpose,
  email: string,
  ttlMs = purpose === "email-verify" ? EMAIL_VERIFY_TTL_MS : PASSWORD_RESET_TTL_MS
) {
  const identifier = identifierFor(purpose, email);
  const token = randomBytes(TOKEN_BYTES).toString("hex");
  const expires = new Date(Date.now() + ttlMs);

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  await prisma.verificationToken.create({
    data: { identifier, token, expires },
  });

  return token;
}

export async function consumeAuthToken(
  purpose: TokenPurpose,
  email: string,
  token: string
): Promise<boolean> {
  const identifier = identifierFor(purpose, email);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier, token },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.deleteMany({ where: { identifier } });
    }
    return false;
  }

  await prisma.verificationToken.deleteMany({ where: { identifier } });
  return true;
}

export async function consumeAuthTokenByTokenOnly(token: string) {
  const record = await prisma.verificationToken.findFirst({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    if (record) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
    }
    return null;
  }

  await prisma.verificationToken.delete({ where: { token: record.token } });
  return record.identifier;
}
