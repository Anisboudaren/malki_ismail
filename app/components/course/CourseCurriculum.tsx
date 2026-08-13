"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

import type { Course, CourseModule } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { ChevronDown, Lock, PlayCircle } from "../ui/Icons";
import { Reveal } from "../ui/Reveal";

export default function CourseCurriculum({ course }: { course: Course }) {
  const { t } = useT();
  const { curriculum, curriculumTitle, curriculumSummary, lockedLabel } = course;
  const lessonCount = curriculum.reduce((n, module) => n + module.lessons.length, 0);

  // Only the first module starts open: the whole programme unrolled is a wall
  // of rows, and the point of the accordion is to show the shape first.
  const [open, setOpen] = useState(0);

  return (
    <div id="programme" className="scroll-mt-28">
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h2 className="heading-md">{t(curriculumTitle)}</h2>
          <p className="font-body text-sm text-cream-faint">
            <span className="bidi-ltr">{curriculum.length}</span>{" "}
            {t(curriculumSummary.modules)}
            <span className="mx-2 text-ink-line">·</span>
            <span className="bidi-ltr">{lessonCount}</span> {t(curriculumSummary.lessons)}
            <span className="mx-2 text-ink-line">·</span>
            {t(curriculumSummary.total)}
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.06}>
        <div className="mt-6 overflow-hidden rounded-2xl border border-ink-line">
          {curriculum.map((module, i) => (
            <ModuleRow
              key={module.title.fr}
              module={module}
              index={i}
              isOpen={open === i}
              onToggle={() => setOpen(open === i ? -1 : i)}
            />
          ))}
        </div>
      </Reveal>

      <p className="mt-4 flex items-center gap-2 font-body text-xs text-cream-faint">
        <Lock className="h-3.5 w-3.5 shrink-0 text-gold-muted" />
        {t(lockedLabel)}
      </p>
    </div>
  );
}

function ModuleRow({
  module,
  index,
  isOpen,
  onToggle,
}: {
  module: CourseModule;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { t, altLang, alt } = useT();
  const panelId = `module-panel-${index}`;

  return (
    <div className="border-b border-ink-line last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className={`flex w-full items-center gap-4 px-5 py-5 text-start transition-colors duration-300 ease-cinema hover:bg-ink-card focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-gold ${
          isOpen ? "bg-ink-card" : "bg-ink"
        }`}
      >
        <span className="font-latin-display text-sm font-semibold text-gold-muted">
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block font-display text-base font-semibold text-cream">
            {t(module.title)}
          </span>
          <span lang={altLang} className="mt-0.5 block font-body text-xs text-cream-faint">
            {alt(module.title)}
          </span>
        </span>

        <span className="shrink-0 font-body text-xs text-cream-faint">
          <span className="bidi-ltr">{module.lessons.length}</span>
        </span>

        <ChevronDown
          className={`h-4 w-4 shrink-0 text-cream-faint transition-transform duration-300 ease-cinema ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul className="px-5 pb-4">
              {module.lessons.map((lesson) => (
                <li
                  key={lesson.title.fr}
                  className="flex items-center gap-3 border-t border-ink-line/70 py-3"
                >
                  <PlayCircle className="h-4 w-4 shrink-0 text-gold-muted" />
                  <span className="min-w-0 flex-1 font-body text-sm leading-relaxed text-cream-dim">
                    {t(lesson.title)}
                  </span>
                  {lesson.duration && (
                    <span className="shrink-0 font-latin text-xs tabular-nums text-cream-faint">
                      <span className="bidi-ltr">{lesson.duration}</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
