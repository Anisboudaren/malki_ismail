import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { EmptyState, PageTitle, Pager, btnClass } from "@/app/components/dashboard/ui";
import { pageArgs, pageCount, parsePage } from "@/lib/pagination";

export default async function CertificatesPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const user = await requireRole(Role.STUDENT);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const { skip, take, page } = pageArgs(parsePage(searchParams.page));
  const [total, certificates] = await Promise.all([
    prisma.certificate.count({ where: { userId: user.id } }),
    prisma.certificate.findMany({
      where: { userId: user.id },
      include: { course: true },
      orderBy: { issuedAt: "desc" },
      skip,
      take,
    }),
  ]);

  return (
    <div>
      <PageTitle title={t(dash.nav.certificates, lang)} />
      {total === 0 ? (
        <EmptyState
          action={
            <Link href="/student/courses" className={btnClass}>
              {t(dash.nav.courses, lang)}
            </Link>
          }
        >
          {t(dash.empty.certificates, lang)}
        </EmptyState>
      ) : (
        <ul className="grid gap-4">
          {certificates.map((cert) => (
            <li
              key={cert.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-ink-line bg-ink-card p-5"
            >
              <div>
                <h2 className="font-display font-semibold">
                  {pick(cert.course.titleFr, cert.course.titleAr, user.locale)}
                </h2>
                <p className="mt-1 font-body text-xs text-cream-faint">
                  {cert.issuedAt.toLocaleDateString(lang === "ar" ? "ar-DZ" : "fr-DZ")}
                </p>
              </div>
              <Link href={`/student/certificates/${cert.id}`} className={btnClass}>
                PDF
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageCount={pageCount(total)} />
    </div>
  );
}
