import { auth } from "@/lib/auth";
import type { UserRole } from "@aldlalz/database";

export async function requireSessionUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user;
}

export function isAdminRole(role: UserRole) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function requireAdminUser() {
  const user = await requireSessionUser();
  if (!isAdminRole(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
