import { prisma } from "@aldlalz/database";

export type UserProfile = {
  id: string;
  email: string;
  emailVerified: Date | null;
  nameAr: string | null;
  nameEn: string | null;
  phone: string | null;
  role: string;
  langPreference: string;
  image: string | null;
};

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      emailVerified: true,
      nameAr: true,
      nameEn: true,
      phone: true,
      role: true,
      langPreference: true,
      image: true,
    },
  });
}

export async function userHasPhone(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { phone: true },
  });
  return !!user?.phone;
}
