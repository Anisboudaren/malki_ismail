import type { ReactNode } from "react";
import { Field, inputClass } from "@/app/components/dashboard/ui";

function lines(value: unknown) {
  if (!Array.isArray(value)) return "";
  return value
    .map((row) => (typeof row === "string" ? row : (row as { fr?: string }).fr ?? ""))
    .filter(Boolean)
    .join("\n");
}

export function CourseLandingFields({
  course,
  categories,
  extra,
}: {
  course: {
    titleFr: string;
    titleAr: string;
    summaryFr: string;
    summaryAr: string;
    bodyFr?: string;
    bodyAr?: string;
    categorySlug: string;
    thumbnailUrl?: string | null;
    previewVideoUrl?: string | null;
    priceDzd?: number | null;
    priceStrikeDzd?: number | null;
    currency?: string | null;
    level?: string | null;
    language?: string | null;
    durationFr?: string | null;
    durationAr?: string | null;
    outcomes?: unknown;
    requirements?: unknown;
    metaTitleFr?: string | null;
    metaTitleAr?: string | null;
    metaDescriptionFr?: string | null;
    metaDescriptionAr?: string | null;
    ogImage?: string | null;
  };
  categories: { slug: string; titleFr: string }[];
  extra?: ReactNode;
}) {
  return (
    <div className="space-y-3">
      <Field label="Titre FR">
        <input name="titleFr" required defaultValue={course.titleFr} className={inputClass} />
      </Field>
      <Field label="Titre AR">
        <input name="titleAr" defaultValue={course.titleAr} className={inputClass} />
      </Field>
      <details className="rounded-2xl border border-ink-line bg-ink-card p-4" open>
        <summary className="min-h-11 cursor-pointer font-body text-sm font-medium">Présentation</summary>
        <div className="mt-4 space-y-3">
          <Field label="Résumé court FR (cartes)">
            <textarea name="summaryFr" defaultValue={course.summaryFr} rows={2} className={inputClass} />
          </Field>
          <Field label="Résumé court AR">
            <textarea name="summaryAr" defaultValue={course.summaryAr} rows={2} className={inputClass} />
          </Field>
          <Field label="Description complète FR">
            <textarea name="bodyFr" defaultValue={course.bodyFr ?? ""} rows={4} className={inputClass} />
          </Field>
          <Field label="Description complète AR">
            <textarea name="bodyAr" defaultValue={course.bodyAr ?? ""} rows={4} className={inputClass} />
          </Field>
          <Field label="Catégorie">
            <select name="categorySlug" defaultValue={course.categorySlug} className={inputClass}>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.titleFr}
                </option>
              ))}
            </select>
          </Field>
          {extra}
        </div>
      </details>
      <details className="rounded-2xl border border-ink-line bg-ink-card p-4">
        <summary className="min-h-11 cursor-pointer font-body text-sm font-medium">Prix & méta</summary>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Prix">
            <input name="priceDzd" type="number" defaultValue={course.priceDzd ?? ""} className={inputClass} />
          </Field>
          <Field label="Prix barré">
            <input name="priceStrikeDzd" type="number" defaultValue={course.priceStrikeDzd ?? ""} className={inputClass} />
          </Field>
          <Field label="Devise">
            <input name="currency" defaultValue={course.currency ?? "DZD"} className={inputClass} />
          </Field>
          <Field label="Niveau">
            <select name="level" defaultValue={course.level ?? "beginner"} className={inputClass}>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </Field>
          <Field label="Langue">
            <select name="language" defaultValue={course.language ?? "ar"} className={inputClass}>
              <option value="ar">Arabe</option>
              <option value="fr">Français</option>
            </select>
          </Field>
          <Field label="Durée FR">
            <input name="durationFr" defaultValue={course.durationFr ?? ""} className={inputClass} />
          </Field>
          <Field label="Durée AR">
            <input name="durationAr" defaultValue={course.durationAr ?? ""} className={inputClass} />
          </Field>
        </div>
      </details>
      <details className="rounded-2xl border border-ink-line bg-ink-card p-4">
        <summary className="min-h-11 cursor-pointer font-body text-sm font-medium">Programme public</summary>
        <div className="mt-4 space-y-3">
          <Field label="Ce que vous allez maîtriser (une ligne = un point)">
            <textarea name="outcomes" defaultValue={lines(course.outcomes)} rows={5} className={inputClass} />
          </Field>
          <Field label="Prérequis (une ligne = un point)">
            <textarea name="requirements" defaultValue={lines(course.requirements)} rows={4} className={inputClass} />
          </Field>
        </div>
      </details>
      <details className="rounded-2xl border border-ink-line bg-ink-card p-4">
        <summary className="min-h-11 cursor-pointer font-body text-sm font-medium">SEO du cours</summary>
        <div className="mt-4 space-y-3">
          <Field label="Meta title FR">
            <input name="metaTitleFr" defaultValue={course.metaTitleFr ?? ""} className={inputClass} />
          </Field>
          <Field label="Meta title AR">
            <input name="metaTitleAr" defaultValue={course.metaTitleAr ?? ""} className={inputClass} />
          </Field>
          <Field label="Meta description FR">
            <textarea name="metaDescriptionFr" defaultValue={course.metaDescriptionFr ?? ""} rows={2} className={inputClass} />
          </Field>
          <Field label="Meta description AR">
            <textarea name="metaDescriptionAr" defaultValue={course.metaDescriptionAr ?? ""} rows={2} className={inputClass} />
          </Field>
          <Field label="OG image URL">
            <input name="ogImage" defaultValue={course.ogImage ?? ""} className={inputClass} dir="ltr" />
          </Field>
        </div>
      </details>
    </div>
  );
}
