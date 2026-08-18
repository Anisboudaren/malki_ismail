import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getSiteSettings = cache(async () => {
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "default" } });
  } catch {
    return null;
  }
});
