import { type ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { prisma } from "@aldlalz/database";
import { AppShell } from "@/components/layout/app-shell";
import { isAdminRole } from "@/lib/listings/auth";

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user?.id) {
    return redirect({ href: "/login", locale });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, isActive: true },
  });

  if (!user?.isActive || !isAdminRole(user.role)) {
    return redirect({ href: "/dashboard", locale });
  }

  return <AppShell section="admin">{children}</AppShell>;
}
