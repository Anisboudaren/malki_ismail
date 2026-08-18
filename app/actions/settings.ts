"use server";

import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import { requireRole } from "@/lib/require-user";
import { prisma } from "@/lib/prisma";
import { flash } from "@/lib/save-result";

export async function saveSiteSettings(formData: FormData) {
  await requireRole(Role.ADMIN);
  const str = (key: string) => String(formData.get(key) ?? "").trim() || null;
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      siteTitleFr: String(formData.get("siteTitleFr") ?? "Malki Academy"),
      siteTitleAr: String(formData.get("siteTitleAr") ?? "Malki Academy"),
      siteDescriptionFr: String(formData.get("siteDescriptionFr") ?? ""),
      siteDescriptionAr: String(formData.get("siteDescriptionAr") ?? ""),
      ogImage: str("ogImage"),
      metaPixelId: str("metaPixelId"),
      ga4Id: str("ga4Id"),
      tiktokPixelId: str("tiktokPixelId"),
    },
    update: {
      siteTitleFr: String(formData.get("siteTitleFr") ?? "Malki Academy"),
      siteTitleAr: String(formData.get("siteTitleAr") ?? "Malki Academy"),
      siteDescriptionFr: String(formData.get("siteDescriptionFr") ?? ""),
      siteDescriptionAr: String(formData.get("siteDescriptionAr") ?? ""),
      ogImage: str("ogImage"),
      metaPixelId: str("metaPixelId"),
      ga4Id: str("ga4Id"),
      tiktokPixelId: str("tiktokPixelId"),
    },
  });
  revalidatePath("/admin/settings");
  revalidatePath("/fr");
  revalidatePath("/ar");
  return flash({ ok: true, message: "Enregistré." });
}
