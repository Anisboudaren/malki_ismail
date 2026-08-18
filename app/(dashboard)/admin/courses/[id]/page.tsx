import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { pick } from "@/lib/dashboard-nav";
import { PageTitle, inputClass, btnGhost } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { LessonVideoField } from "@/app/components/dashboard/LessonVideoField";
import { CourseLandingFields } from "@/app/components/dashboard/CourseLandingFields";
import { CourseMediaFields } from "@/app/components/dashboard/CourseMediaFields";
import { MarkPaidForm } from "@/app/components/dashboard/BillingActions";
import { ConfirmSubmit } from "@/app/components/dashboard/ConfirmSubmit";
import {
  addAdminLesson,
  deleteAdminLesson,
  moveAdminLesson,
  updateAdminLesson,
} from "@/app/actions/course-editor";
import { updateAdminCourseLanding } from "@/app/actions/media";
import { setCoursePublished } from "@/app/actions/admin";
import { asFormAction } from "@/lib/form-action";

export default async function AdminCourseEditor({ params }: { params: { id: string } }) {
  const user = await requireRole(Role.ADMIN);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const [course, categories, assets, pendingOrders] = await Promise.all([
    prisma.course.findUnique({
      where: { id: params.id },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.order.findMany({
      where: { courseId: params.id, status: "PENDING" },
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);
  if (!course) notFound();

  const lessons = course.modules.flatMap((mod) =>
    mod.lessons.map((lesson) => ({ ...lesson, moduleTitle: mod.titleFr })),
  );
  const saveCourse = updateAdminCourseLanding.bind(null, course.id);
  const addLesson = addAdminLesson.bind(null, course.id);

  return (
    <div>
      <PageTitle
        title={pick(course.titleFr, course.titleAr, user.locale)}
        action={
          <div className="flex flex-wrap gap-2">
            <Link href={`/admin/courses/${course.id}/students`} className={btnGhost}>
              {t(dash.admin.viewStudents, lang)}
            </Link>
            <Link href="/admin/courses" className={btnGhost}>
              ← {t(dash.nav.courses, lang)}
            </Link>
          </div>
        }
      />

      <div className="mb-10 grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <form action={asFormAction(saveCourse)} className="space-y-3">
          <CourseLandingFields course={course} categories={categories} />
          <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 border-t border-ink-line bg-ink/95 py-3 backdrop-blur lg:bottom-4">
            <SaveButton label={t(dash.save, lang)} />
          </div>
        </form>
        <aside className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {course.published ? (
              <ConfirmSubmit
                action={setCoursePublished.bind(null, course.id, false)}
                message="Dépublier ce cours ? Il disparaîtra du catalogue public."
                label="Dépublier"
              />
            ) : (
              <form action={setCoursePublished.bind(null, course.id, true)}>
                <button type="submit" className={btnGhost}>
                  {t(dash.admin.approve, lang)}
                </button>
              </form>
            )}
          </div>
          <div className="rounded-2xl border border-ink-line bg-ink-card p-4">
            <h2 className="mb-4 font-display text-lg font-semibold">Médias</h2>
            <CourseMediaFields
              courseId={course.id}
              thumbnailUrl={course.thumbnailUrl}
              previewVideoUrl={course.previewVideoUrl}
              assets={assets}
            />
          </div>
          <div className="rounded-2xl border border-ink-line bg-ink-card p-4">
            <h2 className="mb-3 font-display text-lg font-semibold">Demandes</h2>
            {pendingOrders.length === 0 ? (
              <p className="font-body text-sm text-cream-dim">Aucune demande en attente.</p>
            ) : (
              <ul className="space-y-4">
                {pendingOrders.map((order) => (
                  <li key={order.id} className="border-t border-ink-line pt-3 first:border-0 first:pt-0">
                    <p className="font-body text-sm text-cream">{order.name}</p>
                    <p className="font-body text-xs text-cream-faint" dir="ltr">
                      {order.whatsapp}
                    </p>
                    <div className="mt-3">
                      <MarkPaidForm orderId={order.id} needsEmail={!order.userId} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      <section>
        <h2 className="mb-4 font-display text-lg font-semibold">{t(dash.student.lessons, lang)}</h2>
        {lessons.length === 0 ? (
          <p className="mb-4 font-body text-sm text-cream-dim">Aucune leçon. Ajoutez-en une ci-dessous.</p>
        ) : null}
        <ol className="space-y-4">
          {lessons.map((lesson, index) => {
            const save = updateAdminLesson.bind(null, lesson.id, course.id);
            const remove = deleteAdminLesson.bind(null, lesson.id, course.id);
            const up = moveAdminLesson.bind(null, lesson.id, course.id, -1);
            const down = moveAdminLesson.bind(null, lesson.id, course.id, 1);
            return (
              <li key={lesson.id} className="rounded-2xl border border-ink-line bg-ink-card p-4">
                <p className="mb-3 font-body text-xs uppercase tracking-wide text-cream-faint">
                  {index + 1}. {t(dash.student.lessons, lang)}
                </p>
                <form id={`lesson-${lesson.id}`} action={asFormAction(save)} className="space-y-3">
                  <input name="titleFr" required defaultValue={lesson.titleFr} className={inputClass} />
                  <input name="titleAr" defaultValue={lesson.titleAr} className={inputClass} />
                  <div className="flex flex-wrap gap-2">
                    <SaveButton label={t(dash.save, lang)} />
                    <button formAction={up} className={btnGhost}>
                      ↑
                    </button>
                    <button formAction={down} className={btnGhost}>
                      ↓
                    </button>
                  </div>
                </form>
                <div className="mt-3">
                  <ConfirmSubmit
                    action={remove}
                    message="Supprimer cette leçon ? Cette action est définitive."
                    label={t(dash.admin.deleteLesson, lang)}
                  />
                </div>
                <div className="mt-4">
                  <LessonVideoField
                    lessonId={lesson.id}
                    formId={`lesson-${lesson.id}`}
                    assets={assets}
                    currentUrl={lesson.videoUrl}
                    currentThumb={lesson.thumbnailUrl}
                    pickLabel={t(dash.teacher.pickLibrary, lang)}
                    uploadLabel={t(dash.admin.libraryUpload, lang)}
                    attachedLabel={t(dash.admin.videoAttached, lang)}
                    emptyLabel={t(dash.admin.videoEmpty, lang)}
                  />
                </div>
              </li>
            );
          })}
        </ol>

        <form action={addLesson} className="mt-6 max-w-lg space-y-3 rounded-2xl border border-dashed border-ink-line p-4">
          <p className="font-body text-sm text-cream-dim">{t(dash.teacher.addLesson, lang)}</p>
          <input name="titleFr" required minLength={2} placeholder="Titre FR" className={inputClass} />
          <input name="titleAr" placeholder="Titre AR" className={inputClass} />
          <SaveButton label={t(dash.teacher.addLesson, lang)} className={btnGhost} pendingLabel="Ajout…" />
        </form>
      </section>
    </div>
  );
}
