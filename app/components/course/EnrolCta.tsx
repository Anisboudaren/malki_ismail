"use client";

import { useState } from "react";
import { requestCourseAccess, submitGuestOrder } from "@/app/actions/orders";
import { btnClass, inputClass } from "@/app/components/dashboard/ui";
import { BusyLabel } from "@/app/components/ui/BusyLabel";

export function EnrolCta({
  courseId,
  loggedIn,
  enrolLabel,
  wpHref,
  locale = "fr",
  defaultName = "",
  defaultWhatsapp = "",
  enrolled = false,
  pending = false,
  playerHref,
}: {
  courseId: string | null;
  loggedIn: boolean;
  enrolLabel: string;
  wpHref?: string;
  locale?: string;
  defaultName?: string;
  defaultWhatsapp?: string;
  enrolled?: boolean;
  pending?: boolean;
  playerHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(pending);
  const [pendingSend, setPendingSend] = useState(false);
  const ar = locale === "ar";

  const confirmation = ar
    ? "تم إرسال الطلب. سنتواصل معك على واتساب لإتمام الدفع ثم نفتح الوصول."
    : "Demande envoyée. Nous vous contactons sur WhatsApp pour finaliser le paiement — l’accès s’ouvrira ensuite.";

  if (!courseId) {
    return wpHref ? (
      <a href={wpHref} className={`${btnClass} mt-6 w-full`}>
        {enrolLabel}
      </a>
    ) : null;
  }

  if (enrolled && playerHref) {
    return (
      <a href={playerHref} className={`${btnClass} mt-6 flex min-h-12 w-full items-center justify-center`}>
        {ar ? "فتح الدورة" : "Accéder au cours"}
      </a>
    );
  }

  if (done) {
    return (
      <p className="mt-6 rounded-2xl border border-gold/40 bg-gold/10 p-4 font-body text-sm leading-relaxed text-cream">
        {confirmation}
      </p>
    );
  }

  if (!open) {
    return (
      <button type="button" className={`${btnClass} mt-6 min-h-12 w-full`} onClick={() => setOpen(true)}>
        {loggedIn ? (ar ? "طلب الوصول" : "Demander l’accès") : enrolLabel}
      </button>
    );
  }

  return (
    <form
      className="mt-6 space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        setPendingSend(true);
        setError(null);
        const data = new FormData(event.currentTarget);
        const result = loggedIn
          ? await requestCourseAccess(courseId, data)
          : await submitGuestOrder(courseId, data);
        setPendingSend(false);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDone(true);
      }}
    >
      <label className="block">
        <span className="font-body text-xs uppercase tracking-wide text-cream-faint">
          {ar ? "الاسم" : "Nom"}
        </span>
        <input
          name="name"
          required
          minLength={2}
          defaultValue={defaultName}
          className={`${inputClass} mt-2`}
        />
      </label>
      <label className="block">
        <span className="font-body text-xs uppercase tracking-wide text-cream-faint">
          WhatsApp
        </span>
        <input
          name="whatsapp"
          required
          minLength={8}
          inputMode="tel"
          placeholder="+213…"
          defaultValue={defaultWhatsapp}
          className={`${inputClass} mt-2`}
          dir="ltr"
        />
      </label>
      <p className="font-body text-xs leading-relaxed text-cream-faint">
        {ar
          ? "بعد الإرسال نتواصل معك على واتساب لإتمام الدفع. لن يُفتح الوصول قبل التأكيد."
          : "Après envoi, nous vous écrivons sur WhatsApp pour le paiement. Pas d’accès avant confirmation."}
      </p>
      {error ? <p className="font-body text-xs text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={pendingSend}
        aria-busy={pendingSend}
        className={`${btnClass} min-h-12 w-full`}
      >
        {pendingSend ? (
          <BusyLabel>{ar ? "جاري الإرسال…" : "Envoi…"}</BusyLabel>
        ) : ar ? (
          "إرسال الطلب"
        ) : (
          "Envoyer la demande"
        )}
      </button>
    </form>
  );
}
