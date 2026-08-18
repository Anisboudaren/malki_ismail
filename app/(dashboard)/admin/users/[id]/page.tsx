import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import {
  PageTitle,
  Field,
  inputClass,
  btnGhost,
} from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { resetUserAccess, syncUserCourses, updateAdminUser } from "@/app/actions/admin";
import { GrantAccessForm } from "@/app/components/dashboard/BillingActions";
import { asFormAction } from "@/lib/form-action";

const roles: Role[] = ["ADMIN", "TEACHER", "STUDENT"];

export default async function AdminUserEditor({ params }: { params: { id: string } }) {
  const admin = await requireRole(Role.ADMIN);
  const lang = (admin.locale === "ar" ? "ar" : "fr") as Locale;
  const [user, courses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      include: { enrollments: true, sessions: true },
    }),
    prisma.course.findMany({
      where: { published: true },
      orderBy: { titleFr: "asc" },
    }),
  ]);
  if (!user) notFound();

  const enrolled = new Set(user.enrollments.map((row) => row.courseId));
  const saveUser = updateAdminUser.bind(null, user.id);
  const resetAccess = resetUserAccess.bind(null, user.id);
  const saveCourses = syncUserCourses.bind(null, user.id);

  return (
    <div>
      <PageTitle
        title={user.email}
        kicker={t(dash.nav.users, lang)}
        action={
          <Link href="/admin/users" className={btnGhost}>
            ← {t(dash.nav.users, lang)}
          </Link>
        }
      />

      <form action={asFormAction(saveUser)} className="max-w-xl space-y-4">
        <Field label="Nom">
          <input name="name" defaultValue={user.name ?? ""} className={inputClass} />
        </Field>
        <Field label="WhatsApp">
          <input name="whatsapp" defaultValue={user.whatsapp ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <Field label="Avatar URL">
          <input
            name="avatarUrl"
            defaultValue={user.avatarUrl ?? ""}
            className={inputClass}
            dir="ltr"
          />
        </Field>
        <Field label="Langue">
          <select name="locale" defaultValue={user.locale} className={inputClass}>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </Field>
        <Field label="Rôle">
          <select name="role" defaultValue={user.role} className={inputClass}>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex min-h-11 items-center gap-3 font-body text-sm">
          <input type="checkbox" name="suspended" defaultChecked={user.suspended} />
          {t(dash.admin.suspend, lang)}
        </label>
        <SaveButton label={t(dash.save, lang)} />
      </form>

      <section className="mt-12 max-w-xl">
        <h2 className="font-display text-lg font-semibold">{t(dash.admin.resetAccess, lang)}</h2>
        <p className="mt-2 font-body text-sm text-cream-dim">{t(dash.admin.resetAccessBody, lang)}</p>
        <p className="mt-1 font-body text-xs text-cream-faint">
          {user.sessions.length} session{user.sessions.length === 1 ? "" : "s"}
        </p>
        <form action={resetAccess} className="mt-4">
          <SaveButton
            label={t(dash.admin.resetAccess, lang)}
            className={btnGhost}
            pendingLabel="Réinitialisation…"
          />
        </form>
      </section>

      <section className="mt-12 max-w-xl">
        <h2 className="font-display text-lg font-semibold">Accorder un accès</h2>
        <p className="mt-2 font-body text-sm text-cream-dim">
          Crée une transaction « offert » et active le cours tout de suite.
        </p>
        <div className="mt-4">
          <GrantAccessForm
            userId={user.id}
            courses={courses.map((course) => ({
              id: course.id,
              titleFr: course.titleFr,
              priceDzd: course.priceDzd,
            }))}
          />
        </div>
      </section>

      <section className="mt-12 max-w-xl">
        <h2 className="font-display text-lg font-semibold">{t(dash.nav.courses, lang)}</h2>
        <form action={asFormAction(saveCourses)} className="mt-4 space-y-3">
          {courses.length === 0 ? (
            <p className="font-body text-sm text-cream-faint">{t(dash.empty.courses, lang)}</p>
          ) : (
            <ul className="space-y-2">
              {courses.map((course) => (
                <li key={course.id}>
                  <label className="flex min-h-11 items-center gap-3 font-body text-sm">
                    <input
                      type="checkbox"
                      name="courseId"
                      value={course.id}
                      defaultChecked={enrolled.has(course.id)}
                    />
                    {course.titleFr}
                  </label>
                </li>
              ))}
            </ul>
          )}
          <SaveButton label={t(dash.save, lang)} />
        </form>
      </section>
    </div>
  );
}
