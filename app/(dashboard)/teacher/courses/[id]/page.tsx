import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/require-user";
import { Role } from "@prisma/client";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { PageTitle, inputClass, btnGhost } from "@/app/components/dashboard/ui";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { LessonVideoField } from "@/app/components/dashboard/LessonVideoField";
import { CourseLandingFields } from "@/app/components/dashboard/CourseLandingFields";
import { CourseMediaFields } from "@/app/components/dashboard/CourseMediaFields";
import {
  addLesson,
  addModule,
  moveLesson,
  submitCourse,
  updateLesson,
} from "@/app/actions/teacher";
import { asFormAction } from "@/lib/form-action";
import { updateTeacherCourseLanding } from "@/app/actions/media";

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const user = await requireRole(Role.TEACHER);
  const lang = (user.locale === "ar" ? "ar" : "fr") as Locale;
  const [course, categories, assets] = await Promise.all([
    prisma.course.findFirst({
      where: { id: params.id, teacherId: user.id },
      include: {
        modules: {
          orderBy: { sortOrder: "asc" },
          include: { lessons: { orderBy: { sortOrder: "asc" } } },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  if (!course) notFound();

  const saveCourse = updateTeacherCourseLanding.bind(null, course.id);
  const submit = submitCourse.bind(null, course.id);

  return (
    <div>
      <PageTitle
        title={course.titleFr}
        action={
          <Link href={`/teacher/courses/${course.id}/students`} className={btnGhost}>
            {t(dash.admin.viewStudents, lang)}
          </Link>
        }
      />
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
      <form action={asFormAction(saveCourse)} className="space-y-4">
        <CourseLandingFields course={course} categories={categories} />
        <div className="sticky bottom-20 z-20 flex flex-wrap gap-2 border-t border-ink-line bg-ink/95 py-3 backdrop-blur lg:bottom-4">
          <SaveButton label={t(dash.save, lang)} />
          <SaveButton
            label={t(dash.teacher.submit, lang)}
            className={btnGhost}
            pendingLabel="Envoi…"
            formAction={submit}
          />
        </div>
      </form>
      <div className="rounded-2xl border border-ink-line bg-ink-card p-4">
        <h2 className="mb-4 font-display text-lg font-semibold">Médias</h2>
        <CourseMediaFields
          courseId={course.id}
          thumbnailUrl={course.thumbnailUrl}
          previewVideoUrl={course.previewVideoUrl}
          assets={assets}
        />
      </div>
      </div>

      <section className="mt-12 space-y-8">
        {course.modules.length === 0 ? (
          <p className="font-body text-sm text-cream-dim">Ajoutez un module pour y ranger les leçons.</p>
        ) : null}
        {course.modules.map((mod) => {
          const add = addLesson.bind(null, mod.id, course.id);
          return (
            <div key={mod.id} className="rounded-2xl border border-ink-line p-4">
              <h2 className="font-display font-semibold">{mod.titleFr}</h2>
              <ul className="mt-3 space-y-4">
                {mod.lessons.map((lesson) => {
                  const save = updateLesson.bind(null, lesson.id, course.id);
                  const up = moveLesson.bind(null, lesson.id, course.id, -1);
                  const down = moveLesson.bind(null, lesson.id, course.id, 1);
                  return (
                    <li key={lesson.id} className="rounded-xl bg-ink-card p-4">
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
              </ul>
              <form action={add} className="mt-4 space-y-2">
                <input name="titleFr" required minLength={2} placeholder="Nouvelle leçon FR" className={inputClass} />
                <SaveButton
                  label={t(dash.teacher.addLesson, lang)}
                  className={btnGhost}
                  pendingLabel="Ajout…"
                />
              </form>
            </div>
          );
        })}
        <form action={addModule.bind(null, course.id)} className="max-w-lg space-y-2">
          <input name="titleFr" required minLength={2} placeholder="Nouveau module" className={inputClass} />
          <SaveButton
            label={t(dash.teacher.addModule, lang)}
            className={btnGhost}
            pendingLabel="Ajout…"
          />
        </form>
      </section>
    </div>
  );
}
