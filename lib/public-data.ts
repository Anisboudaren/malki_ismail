import { prisma } from "@/lib/prisma";
import {
  teacher as fallbackTeacher,
  testimonials as fallbackTestimonials,
  type Testimonial,
} from "@/content/content";
import type { L10n } from "@/lib/i18n";

export async function getPublicTeacher() {
  const profile = await prisma.teacherProfile.findFirst({
    include: { user: true },
    orderBy: { updatedAt: "desc" },
  });
  if (!profile?.user) return fallbackTeacher;

  const credentials = Array.isArray(profile.credentials)
    ? (profile.credentials as { fr?: string; ar?: string }[])
        .filter((row) => row.fr || row.ar)
        .map((row) => ({ fr: row.fr ?? "", ar: row.ar ?? row.fr ?? "" }) satisfies L10n)
    : fallbackTeacher.credentials;

  return {
    ...fallbackTeacher,
    name: {
      fr: profile.user.name ?? fallbackTeacher.name.fr,
      ar: profile.user.name ?? fallbackTeacher.name.ar,
    } satisfies L10n,
    role: {
      fr: profile.roleFr || fallbackTeacher.role.fr,
      ar: profile.roleAr || fallbackTeacher.role.ar,
    } satisfies L10n,
    bio: {
      fr: profile.bioFr || fallbackTeacher.bio.fr,
      ar: profile.bioAr || fallbackTeacher.bio.ar,
    } satisfies L10n,
    credentials: credentials.length ? credentials : fallbackTeacher.credentials,
    portrait: profile.user.avatarUrl || fallbackTeacher.portrait,
  };
}

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const approved = await prisma.review.findMany({
    where: { approved: true, body: { not: "" } },
    include: { user: true, course: true },
    orderBy: { createdAt: "desc" },
    take: 12,
  });
  if (!approved.length) return fallbackTestimonials;

  return approved.map((review, index) => ({
    quote: { fr: review.body, ar: review.body },
    name: {
      fr: review.user.name ?? review.user.email,
      ar: review.user.name ?? review.user.email,
    },
    role: {
      fr: review.course.titleFr,
      ar: review.course.titleAr,
    },
    avatar:
      review.user.avatarUrl ??
      fallbackTestimonials[index % fallbackTestimonials.length].avatar,
  }));
}
