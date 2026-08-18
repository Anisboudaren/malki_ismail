import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, Field, inputClass } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { createCourse } from "@/app/actions/teacher";

export default async function NewCoursePage() {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div>
      <PageTitle title={t(dash.teacher.create, lang)} />
      <form action={createCourse} className="max-w-lg space-y-4">
        <Field label="Titre FR">
          <input name="titleFr" required className={inputClass} />
        </Field>
        <Field label="Titre AR">
          <input name="titleAr" className={inputClass} />
        </Field>
        <Field label="Catégorie">
          <select name="categorySlug" className={inputClass}>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.titleFr}
              </option>
            ))}
          </select>
        </Field>
        <SaveButton label={t(dash.save, lang)} pendingLabel="Création…" />
      </form>
    </div>
  );
}
