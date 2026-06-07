"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@aldlalz/database";
import { AppErrorCode, validationKeyFromForm } from "@/lib/app-errors";
import { requireSessionUser } from "@/lib/listings/auth";
import { actionFail, actionOk, type ActionResult } from "@/lib/listings/action-result";
import {
  normalizedPhoneFromForm,
  parseProfileForm,
} from "./validation";

function revalidateProfilePaths() {
  revalidatePath("/ar/dashboard/profile");
  revalidatePath("/en/dashboard/profile");
  revalidatePath("/ar/dashboard");
  revalidatePath("/en/dashboard");
}

export async function updateProfileAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    const user = await requireSessionUser();
    const parsed = parseProfileForm(formData);
    if (!parsed.success) {
      return actionFail(validationKeyFromForm(parsed));
    }

    const phone = normalizedPhoneFromForm(parsed.data.phone);
    if (!phone) {
      return actionFail("phoneInvalid");
    }

    const phoneTaken = await prisma.user.findFirst({
      where: { phone, NOT: { id: user.id } },
      select: { id: true },
    });
    if (phoneTaken) {
      return actionFail("PHONE_TAKEN");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        nameAr: parsed.data.nameAr ?? null,
        nameEn: parsed.data.nameEn ?? null,
        phone,
        langPreference: parsed.data.langPreference ?? "ar",
      },
    });

    revalidateProfilePaths();
    return actionOk();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return actionFail(AppErrorCode.UNAUTHORIZED);
    }
    return actionFail(AppErrorCode.SERVER_ERROR);
  }
}
