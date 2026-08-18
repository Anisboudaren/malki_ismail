import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, Field, inputClass } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { AvatarUpload } from "@/app/components/dashboard/AvatarUpload";
import { updateTeacherProfile } from "@/app/actions/teacher";
import { asFormAction } from "@/lib/form-action";

export default async function TeacherProfilePage() {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const dbUser = await prisma.user.findUniqueOrThrow({
    where: { id: user.id },
    include: { teacherProfile: true },
  });
  const profile = dbUser.teacherProfile;
  const credentials = Array.isArray(profile?.credentials)
    ? (profile.credentials as { fr?: string }[]).map((row) => row.fr).filter(Boolean).join("\n")
    : "";

  return (
    <div>
      <PageTitle title={t(dash.nav.profile, lang)} />
      <p className="mb-6 max-w-lg font-body text-sm text-cream-dim">
        Ce profil alimente le bloc formateur du site public.
      </p>
      <form action={asFormAction(updateTeacherProfile)} className="max-w-lg space-y-4">
        <Field label="Nom">
          <input name="name" defaultValue={dbUser.name ?? ""} className={inputClass} />
        </Field>
        <AvatarUpload currentUrl={dbUser.avatarUrl} />
        <Field label="Avatar URL">
          <input name="avatarUrl" defaultValue={dbUser.avatarUrl ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <Field label="Rôle FR">
          <input name="roleFr" defaultValue={profile?.roleFr ?? ""} className={inputClass} />
        </Field>
        <Field label="Rôle AR">
          <input name="roleAr" defaultValue={profile?.roleAr ?? ""} className={inputClass} />
        </Field>
        <Field label="Bio FR">
          <textarea name="bioFr" defaultValue={profile?.bioFr ?? ""} rows={4} className={inputClass} />
        </Field>
        <Field label="Bio AR">
          <textarea name="bioAr" defaultValue={profile?.bioAr ?? ""} rows={4} className={inputClass} />
        </Field>
        <Field label="Credentials (une ligne = une puce)">
          <textarea name="credentials" defaultValue={credentials} rows={4} className={inputClass} />
        </Field>
        <Field label="Instagram">
          <input name="instagram" defaultValue={profile?.instagram ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <Field label="Facebook">
          <input name="facebook" defaultValue={profile?.facebook ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <Field label="TikTok">
          <input name="tiktok" defaultValue={profile?.tiktok ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <Field label="YouTube">
          <input name="youtube" defaultValue={profile?.youtube ?? ""} className={inputClass} dir="ltr" />
        </Field>
        <SaveButton label={t(dash.save, lang)} />
      </form>
    </div>
  );
}
