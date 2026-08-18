"use client";

import { useEffect, useState, useTransition } from "react";

import {
  markLessonComplete,
  recordLessonView,
  saveLessonNote,
} from "@/app/actions/student";
import { pick } from "@/lib/dashboard-nav";
import { dash } from "@/content/dashboard";
import { t, type Locale } from "@/lib/i18n";
import { btnClass, btnGhost } from "./ui";
import { LessonPlayer } from "./LessonPlayer";

type LessonRow = {
  id: string;
  titleFr: string;
  titleAr: string;
  videoUrl: string | null;
  publitioId?: string | null;
  completed: boolean;
  note: string;
  moduleTitle: string;
};

export function CoursePlayer({
  courseId,
  courseTitle,
  lessons,
  initialLessonId,
  locale,
}: {
  courseId: string;
  courseTitle: string;
  lessons: LessonRow[];
  initialLessonId?: string;
  locale: string;
}) {
  const lang = (locale === "ar" ? "ar" : "fr") as Locale;
  const [open, setOpen] = useState(false);
  const [currentId, setCurrentId] = useState(initialLessonId ?? lessons[0]?.id);
  const [done, setDone] = useState(() => new Set(lessons.filter((l) => l.completed).map((l) => l.id)));
  const current = lessons.find((lesson) => lesson.id === currentId) ?? lessons[0];
  const [note, setNote] = useState(current?.note ?? "");
  const [pending, startTransition] = useTransition();
  const isDone = current ? done.has(current.id) : false;

  useEffect(() => {
    setNote(current?.note ?? "");
    if (current) void recordLessonView(current.id, courseId);
  }, [current?.id, courseId, current]);

  if (!current) {
    return <p className="font-body text-sm text-cream-dim">{t(dash.empty.courses, lang)}</p>;
  }

  const list = (
    <ol className="space-y-1">
      {lessons.map((lesson) => (
        <li key={lesson.id}>
          <button
            type="button"
            onClick={() => {
              setCurrentId(lesson.id);
              setOpen(false);
            }}
            className={`flex min-h-11 w-full items-center justify-between gap-2 rounded-xl px-3 text-start font-body text-sm ${
              lesson.id === current.id ? "bg-ink-card text-cream" : "text-cream-dim"
            }`}
          >
            <span>{pick(lesson.titleFr, lesson.titleAr, locale)}</span>
            {done.has(lesson.id) ? <span className="text-gold">✓</span> : null}
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-8">
      <div>
        <h1 className="font-display text-xl font-semibold tracking-tight">{courseTitle}</h1>
        <p className="mt-1 font-body text-sm text-cream-dim">
          {pick(current.titleFr, current.titleAr, locale)}
        </p>
        <div
          className="relative mt-4 aspect-video w-full overflow-hidden rounded-2xl border border-ink-line bg-black"
          dir="ltr"
        >
          {current.videoUrl ? (
            <LessonPlayer
              key={current.id}
              src={current.videoUrl}
              publitioId={current.publitioId}
              title={pick(current.titleFr, current.titleAr, locale)}
              fill
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center px-6 text-center font-body text-sm text-cream-dim">
              Vidéo pas encore liée. Choisissez un fichier dans la bibliothèque ou téléversez-en un.
            </div>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending || isDone}
            className={btnClass}
            onClick={() =>
              startTransition(async () => {
                await markLessonComplete(current.id, courseId);
                setDone((prev) => new Set(prev).add(current.id));
              })
            }
          >
            {isDone ? t(dash.student.done, lang) : t(dash.student.markDone, lang)}
          </button>
          <button type="button" className={`${btnGhost} lg:hidden`} onClick={() => setOpen(true)}>
            {t(dash.student.lessons, lang)}
          </button>
        </div>
        <label className="mt-6 block">
          <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
            {t(dash.student.notes, lang)}
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            onBlur={() => void saveLessonNote(current.id, note)}
            rows={5}
            className="mt-2 w-full rounded-xl border border-ink-line bg-ink-card p-4 font-body text-sm text-cream outline-none focus:border-gold-muted"
          />
        </label>
      </div>

      <aside className="hidden lg:block">
        <p className="mb-3 font-body text-xs uppercase tracking-ultrawide text-gold-muted">
          {t(dash.student.lessons, lang)}
        </p>
        {list}
      </aside>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink/70"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-3xl border-t border-ink-line bg-ink-soft p-4 pb-8">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-line" />
            {list}
          </div>
        </div>
      ) : null}
    </div>
  );
}
