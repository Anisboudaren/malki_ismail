import { PrismaClient, Role } from "@prisma/client";

import { categories as staticCategories, featuredCourse } from "../content/content";

const prisma = new PrismaClient();

const SEEDED_ADMIN_EMAIL = "admin@malkiacademy.com";

function parsePriceDzd(amount: string) {
  const n = Number(amount.replace(/\s/g, "").replace(/[^\d]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseDurationSeconds(value?: string) {
  if (!value) return null;
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isFinite(part))) return null;
  if (parts.length === 1) return Math.round(parts[0]);
  if (parts.length === 2) return Math.round(parts[0] * 60 + parts[1]);
  if (parts.length === 3) return Math.round(parts[0] * 3600 + parts[1] * 60 + parts[2]);
  return null;
}

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default", showCategorySection: true },
    update: {},
  });

  for (let index = 0; index < staticCategories.length; index++) {
    const category = staticCategories[index];
    await prisma.category.upsert({
      where: { slug: category.id },
      create: {
        slug: category.id,
        titleFr: category.title.fr,
        titleAr: category.title.ar,
        sortOrder: index,
        showOnHome: true,
        status: category.status,
        image: category.image,
      },
      update: {
        titleFr: category.title.fr,
        titleAr: category.title.ar,
        sortOrder: index,
        status: category.status,
        image: category.image,
      },
    });
  }

  const adminEmails = [SEEDED_ADMIN_EMAIL, process.env.AUTH_ADMIN_EMAIL?.trim().toLowerCase()].filter(
    (email): email is string => Boolean(email),
  );

  let teacherId: string | null = null;
  for (const email of adminEmails) {
    const user = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        role: Role.ADMIN,
        name: "Admin",
        emailVerified: new Date(),
      },
      update: { role: Role.ADMIN },
    });
    await prisma.teacherProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id },
      update: {},
    });
    if (email === SEEDED_ADMIN_EMAIL) teacherId = user.id;
  }

  if (!teacherId) {
    const admin = await prisma.user.findUnique({ where: { email: SEEDED_ADMIN_EMAIL } });
    teacherId = admin?.id ?? null;
  }
  if (!teacherId) throw new Error("Seeded admin is missing");

  const course = await prisma.course.upsert({
    where: { slug: featuredCourse.slug },
    create: {
      slug: featuredCourse.slug,
      titleFr: featuredCourse.title.fr,
      titleAr: featuredCourse.title.ar,
      summaryFr: featuredCourse.summary.fr,
      summaryAr: featuredCourse.summary.ar,
      categorySlug: featuredCourse.categoryId,
      teacherId,
      thumbnailUrl: featuredCourse.image,
      priceDzd: parsePriceDzd(featuredCourse.price.amount),
      published: true,
      submitted: false,
    },
    update: {
      titleFr: featuredCourse.title.fr,
      titleAr: featuredCourse.title.ar,
      summaryFr: featuredCourse.summary.fr,
      summaryAr: featuredCourse.summary.ar,
      categorySlug: featuredCourse.categoryId,
      teacherId,
      thumbnailUrl: featuredCourse.image,
      priceDzd: parsePriceDzd(featuredCourse.price.amount),
      published: true,
    },
  });

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    include: { lessons: { orderBy: { sortOrder: "asc" } } },
    orderBy: { sortOrder: "asc" },
  });

  if (modules.length === 0) {
    const created = await prisma.module.create({
      data: {
        courseId: course.id,
        titleFr: "Leçons",
        titleAr: "الدروس",
        sortOrder: 0,
      },
    });
    const lessons = [];
    let sortOrder = 0;
    for (let moduleIndex = 0; moduleIndex < featuredCourse.curriculum.length; moduleIndex++) {
      const mod = featuredCourse.curriculum[moduleIndex];
      for (let lessonIndex = 0; lessonIndex < mod.lessons.length; lessonIndex++) {
        const lesson = mod.lessons[lessonIndex];
        lessons.push({
          moduleId: created.id,
          titleFr: lesson.title.fr,
          titleAr: lesson.title.ar,
          sortOrder,
          durationSec: parseDurationSeconds(lesson.duration),
        });
        sortOrder += 1;
      }
    }
    await prisma.lesson.createMany({ data: lessons });
  } else if (modules.length > 1) {
    const primary = modules[0];
    let sortOrder = 0;
    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const mod = modules[moduleIndex];
      for (let lessonIndex = 0; lessonIndex < mod.lessons.length; lessonIndex++) {
        const lesson = mod.lessons[lessonIndex];
        await prisma.lesson.update({
          where: { id: lesson.id },
          data: { moduleId: primary.id, sortOrder },
        });
        sortOrder += 1;
      }
      if (mod.id !== primary.id) {
        await prisma.module.delete({ where: { id: mod.id } });
      }
    }
    await prisma.module.update({
      where: { id: primary.id },
      data: { titleFr: "Leçons", titleAr: "الدروس" },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
