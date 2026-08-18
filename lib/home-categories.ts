import {
  categories as staticCategories,
  type Category,
  type CategoryStatus,
} from "@/content/content";
import { prisma } from "@/lib/prisma";

const statusLabel: Record<CategoryStatus, Category["statusLabel"]> = {
  live: { fr: "Disponible", ar: "متاح" },
  soon: { fr: "Bientôt", ar: "قريباً" },
  locked: { fr: "Verrouillé", ar: "مقفل" },
};

function asStatus(value: string | null | undefined): CategoryStatus {
  if (value === "live" || value === "soon" || value === "locked") return value;
  return "soon";
}

function toHomeCategory(row: {
  slug: string;
  titleFr: string;
  titleAr: string;
  status: string;
  image: string | null;
}): Category {
  const fallback = staticCategories.find((category) => category.id === row.slug);
  const status = asStatus(row.status || fallback?.status);
  return {
    id: row.slug,
    title: { fr: row.titleFr, ar: row.titleAr },
    description: fallback?.description ?? { fr: "", ar: "" },
    status,
    statusLabel: fallback?.statusLabel ?? statusLabel[status],
    courseCount: fallback?.courseCount ?? { fr: "", ar: "" },
    image: row.image || fallback?.image || "",
    intro: fallback?.intro ?? { fr: "", ar: "" },
  };
}

export async function getHomeCategorySection() {
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: "default" } })) ??
    (await prisma.siteSettings.create({ data: { id: "default" } }));

  if (!settings.showCategorySection) return null;

  const rows = await prisma.category.findMany({
    where: { showOnHome: true },
    orderBy: { sortOrder: "asc" },
  });

  if (rows.length === 0) {
    const any = await prisma.category.count();
    if (any === 0) return staticCategories;
    return [];
  }

  return rows.map(toHomeCategory);
}
