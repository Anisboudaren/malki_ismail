import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { pick } from "@/lib/dashboard-nav";
import { btnClass } from "@/app/components/dashboard/ui";
import { PrintButton } from "@/app/components/dashboard/PrintButton";

export default async function CertificatePrint({
  params,
}: {
  params: { id: string };
}) {
  const user = await requireRole(Role.STUDENT);
  const cert = await prisma.certificate.findFirst({
    where: { id: params.id, userId: user.id },
    include: { course: true, user: true },
  });
  if (!cert) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 print:hidden">
        <PrintButton className={btnClass} />
      </div>
      <article className="rounded-3xl border border-gold-muted bg-ink-card p-10 text-center">
        <p className="font-latin-display text-sm uppercase tracking-[0.28em] text-gold-muted">
          Malki Academy
        </p>
        <h1 className="mt-8 font-display text-3xl font-semibold tracking-tight">
          Certificat
        </h1>
        <p className="mt-6 font-body text-cream-dim">Décerné à</p>
        <p className="mt-2 font-display text-2xl">{cert.user.name ?? cert.user.email}</p>
        <p className="mt-8 font-body text-cream-dim">pour la formation</p>
        <p className="mt-2 font-display text-xl">
          {pick(cert.course.titleFr, cert.course.titleAr, user.locale)}
        </p>
        <p className="mt-10 font-body text-sm text-cream-faint">
          {cert.issuedAt.toLocaleDateString("fr-DZ")}
        </p>
      </article>
    </div>
  );
}
