"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import type { UserRole } from "@aldlalz/database";
import { updateUserRoleAction, toggleUserActiveAction } from "@/lib/admin/actions";

type Props = {
  userId: string;
  currentRole: UserRole;
  isActive: boolean;
  isSuperAdmin: boolean;
};

const ROLES: UserRole[] = ["USER", "OWNER", "BROKER", "OFFICE", "ADMIN", "SUPERADMIN"];

export function AdminUserActions({
  userId,
  currentRole,
  isActive,
  isSuperAdmin,
}: Props) {
  const t = useTranslations("admin.users");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onRoleChange(role: string) {
    startTransition(async () => {
      await updateUserRoleAction(userId, role as UserRole);
      router.refresh();
    });
  }

  function onToggleActive() {
    startTransition(async () => {
      await toggleUserActiveAction(userId);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={currentRole}
        onChange={(e) => onRoleChange(e.target.value)}
        disabled={pending || (!isSuperAdmin && currentRole === "ADMIN")}
        className="min-w-[8rem]"
        aria-label={t("role")}
      >
        {ROLES.filter((r) => r !== "SUPERADMIN" || isSuperAdmin).map((role) => (
          <option key={role} value={role}>
            {t(`roles.${role}`)}
          </option>
        ))}
      </Select>
      <Button
        type="button"
        variant={isActive ? "secondary" : "primary"}
        size="sm"
        disabled={pending}
        onClick={onToggleActive}
      >
        {isActive ? t("deactivate") : t("activate")}
      </Button>
    </div>
  );
}
