import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager } from "@/app/components/dashboard/ui";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function TeacherReviews({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const where = { course: { teacherId: user.id } };
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, reviews] = await Promise.all([
    prisma.review.count({ where }),
    prisma.review.findMany({
      where,
      include: { user: true, course: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.reviews, lang)} />
      {reviews.length === 0 ? (
        <EmptyState>{t(dash.empty.reviews, lang)}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-ink-line bg-ink-card p-5">
              <p className="font-body text-sm font-semibold">
                {review.user.name ?? review.user.email} · {review.rating}/5
              </p>
              <p className="mt-1 font-body text-xs text-cream-faint">{review.course.titleFr}</p>
              <p className="mt-3 font-body text-sm text-cream-dim">{review.body}</p>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
