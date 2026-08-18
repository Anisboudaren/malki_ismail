import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import {
  EmptyState,
  PageTitle,
  Field,
  Pager,
  inputClass,
  btnClass,
  btnGhost,
} from "@/app/components/dashboard/ui";
import { DashCourseCard } from "@/app/components/dashboard/DashCourseCard";
import { createAdminCourse } from "@/app/actions/course-editor";
import { setCoursePublished, setShowCategorySection } from "@/app/actions/admin";
import { ConfirmSubmit } from "@/app/components/dashboard/ConfirmSubmit";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function AdminCourses({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, courses, categories, settings] = await Promise.all([
    prisma.course.count(),
    prisma.course.findMany({
      include: {
        modules: { include: { _count: { select: { lessons: true } } } },
        _count: { select: { enrollments: true } },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.siteSettings.upsert({
      where: { id: "default" },
      create: { id: "default" },
      update: {},
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.courses, lang)} />

      {courses.length === 0 ? (
        <EmptyState>{t(dash.empty.courses, lang)}</EmptyState>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
            const lessonCount = course.modules.reduce(
              (sum, mod) => sum + mod._count.lessons,
              0,
            );
            return (
              <li key={course.id}>
                <DashCourseCard
                  titleFr={course.titleFr}
                  titleAr={course.titleAr}
                  thumbnailUrl={course.thumbnailUrl}
                  locale={user.locale}
                  studentCount={course._count.enrollments}
                  lessonCount={lessonCount}
                  status={
                    course.published
                      ? t(dash.teacher.published, lang)
                      : t(dash.teacher.draft, lang)
                  }
                  editHref={`/admin/courses/${course.id}`}
                  studentsHref={`/admin/courses/${course.id}/students`}
                />
              </li>
            );
          })}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />

      <section className="mt-12 max-w-lg">
        <h2 className="mb-4 font-display text-lg font-semibold">{t(dash.teacher.create, lang)}</h2>
        <form action={createAdminCourse} className="space-y-3">
          <Field label="Titre FR">
            <input name="titleFr" required className={inputClass} />
          </Field>
          <Field label="Titre AR">
            <input name="titleAr" className={inputClass} />
          </Field>
          <Field label="Catégorie">
            <select name="categorySlug" className={inputClass}>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.titleFr}
                </option>
              ))}
            </select>
          </Field>
          <SaveButton label={t(dash.teacher.create, lang)} pendingLabel="Création…" />
        </form>
      </section>

      <section className="mt-16 rounded-2xl border border-ink-line bg-ink-card p-5">
        <h2 className="mb-3 font-display text-lg font-semibold">{t(dash.admin.homeBlock, lang)}</h2>
        <p className="mb-4 font-body text-sm text-cream-dim">{t(dash.admin.homeBlockBody, lang)}</p>
        <form action={setShowCategorySection.bind(null, !settings.showCategorySection)}>
          <button type="submit" className={settings.showCategorySection ? btnGhost : btnClass}>
            {settings.showCategorySection
              ? t(dash.admin.hideHomeBlock, lang)
              : t(dash.admin.showHomeBlock, lang)}
          </button>
        </form>
        <ul className="mt-6 space-y-2">
          {courses.map((course) => (
            <li key={`pub-${course.id}`} className="flex items-center justify-between gap-3">
              <span className="font-body text-sm text-cream-dim">{course.titleFr}</span>
              {course.published ? (
                <ConfirmSubmit
                  action={setCoursePublished.bind(null, course.id, false)}
                  message="Dépublier ce cours ? Il disparaîtra du catalogue public."
                  label="Dépublier"
                  className="min-h-11 font-body text-xs text-cream-dim"
                />
              ) : (
                <form action={setCoursePublished.bind(null, course.id, true)}>
                  <button type="submit" className="min-h-11 font-body text-xs text-gold">
                    {t(dash.admin.approve, lang)}
                  </button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
