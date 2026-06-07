import { z } from "zod";
import { isValidKuwaitPhone, normalizeKuwaitPhone } from "@/lib/contact/phone";

export const profileFormSchema = z.object({
  nameAr: z.string().trim().max(120).optional(),
  nameEn: z.string().trim().max(120).optional(),
  phone: z
    .string()
    .trim()
    .min(1, "phoneRequired")
    .refine((v) => isValidKuwaitPhone(v), { message: "phoneInvalid" }),
  langPreference: z.enum(["ar", "en"]).optional(),
});

export type ProfileFormInput = z.infer<typeof profileFormSchema>;

export function parseProfileForm(formData: FormData) {
  return profileFormSchema.safeParse({
    nameAr: String(formData.get("nameAr") ?? "") || undefined,
    nameEn: String(formData.get("nameEn") ?? "") || undefined,
    phone: String(formData.get("phone") ?? ""),
    langPreference:
      formData.get("langPreference") === "en" ? "en" : ("ar" as const),
  });
}

export function normalizedPhoneFromForm(phone: string) {
  return normalizeKuwaitPhone(phone);
}
