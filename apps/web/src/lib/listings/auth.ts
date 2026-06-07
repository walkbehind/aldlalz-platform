import { auth } from "@/lib/auth";
import { prisma, type UserRole } from "@aldlalz/database";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: UserRole;
};

async function loadActiveUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      nameEn: true,
      nameAr: true,
      image: true,
      role: true,
      isActive: true,
    },
  });

  if (!user?.isActive) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.nameEn ?? user.nameAr ?? user.email,
    image: user.image,
    role: user.role,
  };
}

export async function requireSessionUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await loadActiveUser(session.user.id);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }

  return user;
}

export function isAdminRole(role: UserRole) {
  return role === "ADMIN" || role === "SUPERADMIN";
}

export async function requireAdminUser(): Promise<SessionUser> {
  const user = await requireSessionUser();
  if (!isAdminRole(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
