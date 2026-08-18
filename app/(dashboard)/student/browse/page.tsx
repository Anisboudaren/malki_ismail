import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, btnClass, btnGhost } from "@/app/components/dashboard/ui";

export default async function BrowsePage() {
  const user = await requireRole(Role.STUDENT);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { courses: { where: { published: true }, include: { enrollments: { where: { userId: user.id } } } } },
  });

  return (
    <div>
      <PageTitle title={t(dash.nav.browse, lang)} />
      <div className="space-y-10">
        {categories.map((category) => (
          <section key={category.slug}>
            <h2 className="font-display text-lg font-semibold">
              {pick(category.titleFr, category.titleAr, user.locale)}
            </h2>
            {category.courses.length === 0 ? (
              <div className="mt-3">
                <EmptyState>{t(dash.empty.courses, lang)}</EmptyState>
              </div>
            ) : (
              <ul className="mt-3 grid gap-4 sm:grid-cols-2">
                {category.courses.map((course) => {
                  const enrolled = course.enrollments.length > 0;
                  return (
                    <li
                      key={course.id}
                      className="rounded-2xl border border-ink-line bg-ink-card p-5"
                    >
                      <h3 className="font-display text-base font-semibold">
                        {pick(course.titleFr, course.titleAr, user.locale)}
                      </h3>
                      <p className="mt-2 font-body text-sm text-cream-dim">
                        {pick(course.summaryFr, course.summaryAr, user.locale)}
                      </p>
                      <div className="mt-4">
                        {enrolled ? (
                          <Link href={`/student/courses/${course.slug}`} className={btnGhost}>
                            {t(dash.student.open, lang)}
                          </Link>
                        ) : (
                          <Link href={`/${lang}/courses/${course.slug}`} className={btnClass}>
                            {t(dash.student.enrollWp, lang)}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
