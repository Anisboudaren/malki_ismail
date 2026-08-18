import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { Field, PageTitle, inputClass } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { saveSiteSettings } from "@/app/actions/settings";
import { asFormAction } from "@/lib/form-action";

export default async function AdminSettings() {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });

  return (
    <div>
      <PageTitle title={t(dash.nav.settings, lang)} />
      <form action={asFormAction(saveSiteSettings)} className="max-w-xl space-y-6">
        <section className="space-y-3 rounded-2xl border border-ink-line bg-ink-card p-4">
          <h2 className="font-display text-lg font-semibold">SEO</h2>
          <p className="font-body text-sm text-cream-dim">
            Titre et description par défaut. Chaque cours peut les remplacer dans sa fiche.
          </p>
          <Field label="Titre du site FR">
            <input name="siteTitleFr" defaultValue={settings.siteTitleFr} className={inputClass} />
          </Field>
          <Field label="Titre du site AR">
            <input name="siteTitleAr" defaultValue={settings.siteTitleAr} className={inputClass} />
          </Field>
          <Field label="Description FR">
            <textarea name="siteDescriptionFr" defaultValue={settings.siteDescriptionFr} rows={3} className={inputClass} />
          </Field>
          <Field label="Description AR">
            <textarea name="siteDescriptionAr" defaultValue={settings.siteDescriptionAr} rows={3} className={inputClass} />
          </Field>
          <Field label="Image Open Graph (URL)">
            <input name="ogImage" defaultValue={settings.ogImage ?? ""} className={inputClass} dir="ltr" />
          </Field>
        </section>
        <section className="space-y-3 rounded-2xl border border-ink-line bg-ink-card p-4">
          <h2 className="font-display text-lg font-semibold">Suivi</h2>
          <p className="font-body text-sm text-cream-dim">
            Laissé vide = aucun script injecté. Ne pas coller un identifiant factice.
          </p>
          <Field label="Meta Pixel ID">
            <input name="metaPixelId" defaultValue={settings.metaPixelId ?? ""} className={inputClass} dir="ltr" />
          </Field>
          <Field label="Google Analytics / GA4 ID">
            <input name="ga4Id" defaultValue={settings.ga4Id ?? ""} className={inputClass} dir="ltr" />
          </Field>
          <Field label="TikTok Pixel ID">
            <input name="tiktokPixelId" defaultValue={settings.tiktokPixelId ?? ""} className={inputClass} dir="ltr" />
          </Field>
        </section>
        <SaveButton label={t(dash.save, lang)} />
      </form>
    </div>
  );
}
