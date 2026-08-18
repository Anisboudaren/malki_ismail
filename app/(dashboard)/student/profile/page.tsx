import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, Field, inputClass, btnClass } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { AvatarUpload } from "@/app/components/dashboard/AvatarUpload";
import { applyAsTeacher, updateStudentProfile } from "@/app/actions/student";
import { logoutAction } from "@/app/actions/auth";
import { asFormAction } from "@/lib/form-action";

export default async function StudentProfile() {
  const user = await requireRole(Role.STUDENT);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { sessions: true, teacherApplication: true },
  });
  const session = dbUser.sessions[0];

  return (
    <div>
      <PageTitle title={t(dash.nav.profile, lang)} />
      <form action={asFormAction(updateStudentProfile)} className="max-w-lg space-y-4">
        <Field label="Nom">
          <input name="name" defaultValue={dbUser.name ?? ""} className={inputClass} />
        </Field>
        <AvatarUpload currentUrl={dbUser.avatarUrl} />
        <Field label="Avatar URL">
          <input
            name="avatarUrl"
            defaultValue={dbUser.avatarUrl ?? ""}
            className={inputClass}
            dir="ltr"
          />
        </Field>
        <Field label="Email">
          <input value={dbUser.email} readOnly className={`${inputClass} opacity-70`} dir="ltr" />
        </Field>
        <Field label="Langue">
          <select name="locale" defaultValue={dbUser.locale} className={inputClass}>
            <option value="fr">Français</option>
            <option value="ar">العربية</option>
          </select>
        </Field>
        <label className="flex min-h-11 items-center gap-3 font-body text-sm">
          <input
            type="checkbox"
            name="notifyEmail"
            defaultChecked={dbUser.notifyEmail}
            className="h-5 w-5 accent-gold"
          />
          Notifications email
        </label>
        <SaveButton label={t(dash.save, lang)} />
      </form>

      <section className="mt-12 max-w-lg">
        <h2 className="font-display text-lg font-semibold">Sécurité</h2>
        {session ? (
          <div className="mt-4 rounded-2xl border border-ink-line bg-ink-card p-5 font-body text-sm text-cream-dim">
            <p>{session.userAgent ?? "Appareil inconnu"}</p>
            <p className="mt-1">{session.ipAddress ?? "IP inconnue"}</p>
            <p className="mt-1">
              Dernière activité :{" "}
              {session.lastActiveAt.toLocaleString(lang === "ar" ? "ar-DZ" : "fr-FR")}
            </p>
            <form action={logoutAction} className="mt-4">
              <button type="submit" className={btnClass}>
                {t(dash.nav.logout, lang)}
              </button>
            </form>
          </div>
        ) : (
          <p className="mt-3 font-body text-sm text-cream-dim">Pas de session active.</p>
        )}
      </section>

      <section className="mt-12 max-w-lg">
        <h2 className="font-display text-lg font-semibold">Devenir formateur</h2>
        {dbUser.teacherApplication ? (
          <p className="mt-3 font-body text-sm text-cream-dim">
            Candidature : {dbUser.teacherApplication.status}
          </p>
        ) : (
          <form action={applyAsTeacher} className="mt-4 space-y-3">
            <textarea
              name="message"
              required
              rows={4}
              className={inputClass}
              placeholder="Présentez-vous"
            />
            <SaveButton label="Envoyer" pendingLabel="Envoi…" />
          </form>
        )}
      </section>
    </div>
  );
}
