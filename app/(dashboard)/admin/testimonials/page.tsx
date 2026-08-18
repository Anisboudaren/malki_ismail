import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnClass, btnGhost } from "@/app/components/dashboard/ui";
import { setReviewApproved } from "@/app/actions/admin";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function AdminTestimonials({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, reviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.findMany({
      include: { user: true, course: true },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.testimonials, lang)} />
      {reviews.length === 0 ? (
        <EmptyState>{t(dash.empty.reviews, lang)}</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => (
            <li key={review.id} className="rounded-2xl border border-ink-line bg-ink-card p-5">
              <p className="font-body text-sm">
                {review.user.email} · {review.rating}/5 · {review.course.titleFr}
              </p>
              <p className="mt-2 font-body text-sm text-cream-dim">{review.body}</p>
              <form
                action={setReviewApproved.bind(null, review.id, !review.approved)}
                className="mt-4"
              >
                <button type="submit" className={review.approved ? btnGhost : btnClass}>
                  {review.approved ? "Retirer du site" : t(dash.admin.approve, lang)}
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
