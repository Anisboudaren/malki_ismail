import { prisma } from "@/lib/prisma";
import {
  courseBySlug,
  featuredCourse,
  type Course as StaticCourse,
} from "@/content/content";
import type { L10n } from "@/lib/i18n";

function asList(value: unknown): L10n[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      if (typeof row === "string") return { fr: row, ar: row } satisfies L10n;
      if (row && typeof row === "object" && "fr" in row) {
        const item = row as { fr?: string; ar?: string };
        return { fr: item.fr ?? "", ar: item.ar ?? item.fr ?? "" } satisfies L10n;
      }
      return null;
    })
    .filter((row): row is L10n => Boolean(row && row.fr));
}

export type PublicCourse = StaticCourse & {
  description?: L10n;
  requirements?: L10n[];
};

export async function getPublicCourse(slug: string): Promise<PublicCourse | null> {
  const fallback = courseBySlug(slug) ?? (slug === featuredCourse.slug ? featuredCourse : undefined);
  let db = null;
  try {
    db = await prisma.course.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
  } catch {
    db = null;
  }
  if (!db && !fallback) return null;
  if (!db) return fallback ?? null;

  const outcomes = asList(db.outcomes);
  const requirements = asList(db.requirements);
  const currency = { fr: db.currency || "DA", ar: db.currency === "DZD" ? "دج" : db.currency };
  const levelLabel =
    db.level === "advanced"
      ? { fr: "Avancé", ar: "متقدم" }
      : db.level === "intermediate"
        ? { fr: "Intermédiaire", ar: "متوسط" }
        : { fr: "Débutant", ar: "مبتدئ" };
  const langLabel =
    db.language === "fr" ? { fr: "Français", ar: "الفرنسية" } : { fr: "Arabe", ar: "العربية" };
  const lessonCount = db.modules.reduce((n, mod) => n + mod.lessons.length, 0);

  const base = fallback ?? featuredCourse;
  const priceAmount = db.priceDzd ? db.priceDzd.toLocaleString("fr-FR") : base.price.amount;
  const strike = db.priceStrikeDzd ? db.priceStrikeDzd.toLocaleString("fr-FR") : base.price.strikeAmount;

  return {
    ...base,
    slug: db.slug,
    categoryId: db.categorySlug,
    title: { fr: db.titleFr, ar: db.titleAr },
    summary: {
      fr: db.summaryFr || base.summary.fr,
      ar: db.summaryAr || base.summary.ar,
    },
    description: {
      fr: db.bodyFr || db.summaryFr || base.summary.fr,
      ar: db.bodyAr || db.summaryAr || base.summary.ar,
    },
    requirements: requirements.length ? requirements : [],
    image: db.thumbnailUrl || base.image,
    previewVideo: db.previewVideoUrl || base.previewVideo,
    price: {
      ...base.price,
      amount: priceAmount,
      strikeAmount: strike,
      currency,
    },
    learn: outcomes.length ? outcomes : base.learn,
    curriculum:
      db.modules.length > 0
        ? db.modules.map((mod) => ({
            title: { fr: mod.titleFr, ar: mod.titleAr },
            lessons: mod.lessons.map((lesson) => ({
              title: { fr: lesson.titleFr, ar: lesson.titleAr },
              duration: lesson.durationSec
                ? `${Math.floor(lesson.durationSec / 60)}:${String(lesson.durationSec % 60).padStart(2, "0")}`
                : undefined,
            })),
          }))
        : base.curriculum,
    meta: [
      { label: { fr: "Niveau", ar: "المستوى" }, value: levelLabel },
      {
        label: { fr: "Leçons", ar: "المحاضرات" },
        value: { fr: `${lessonCount} vidéos`, ar: `${lessonCount} فيديو` },
      },
      {
        label: { fr: "Durée", ar: "المدة" },
        value: {
          fr: db.durationFr || base.meta[2]?.value.fr || "",
          ar: db.durationAr || base.meta[2]?.value.ar || "",
        },
      },
      { label: { fr: "Langue", ar: "اللغة" }, value: langLabel },
    ],
  };
}

export async function getPublicCourseRecord(slug: string) {
  try {
    return await prisma.course.findUnique({
      where: { slug },
      select: {
        id: true,
        published: true,
        metaTitleFr: true,
        metaTitleAr: true,
        metaDescriptionFr: true,
        metaDescriptionAr: true,
        ogImage: true,
        thumbnailUrl: true,
        summaryFr: true,
        summaryAr: true,
        titleFr: true,
        titleAr: true,
      },
    });
  } catch {
    return null;
  }
}
