"use client";

import { useState, useTransition, type FormEvent } from "react";

import { submitContactMessage, type ContactField } from "@/app/actions/contact";
import { contactForm } from "@/content/content";
import { useT } from "@/lib/LocaleProvider";
import { BusyLabel } from "@/app/components/ui/BusyLabel";

const empty = { name: "", contact: "", message: "" };

export function ContactForm() {
  const { t } = useT();
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = await submitContactMessage(data);
      if (result.ok) {
        setDone(true);
        setErrors({});
        form.reset();
        return;
      }
      setErrors(result.errors);
    });
  };

  if (done) {
    return (
      <p
        role="status"
        className="rounded-2xl border border-gold/40 bg-gold/10 p-5 font-body text-sm leading-relaxed text-cream"
      >
        {t(contactForm.success)}
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Field
        id="contact-name"
        name="name"
        label={t(contactForm.name)}
        error={errors.name}
        autoComplete="name"
      />
      <Field
        id="contact-info"
        name="contact"
        label={t(contactForm.contact)}
        error={errors.contact}
        autoComplete="email"
        dir="ltr"
        placeholder={t(contactForm.contactPlaceholder)}
      />
      <label className="block" htmlFor="contact-message">
        <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">
          {t(contactForm.message)}
        </span>
        <textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          rows={5}
          aria-invalid={errors.message ? true : undefined}
          className="mt-2 min-h-32 w-full rounded-2xl border border-ink-line bg-ink-card px-4 py-3 font-body text-sm text-cream outline-none transition-colors focus:border-gold-muted"
        />
        {errors.message ? (
          <span className="mt-1.5 block font-body text-xs text-red-400">{errors.message}</span>
        ) : null}
      </label>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-gold px-6 font-body text-sm font-medium text-ink transition-colors hover:bg-cream disabled:opacity-60 sm:w-auto"
      >
        {pending ? <BusyLabel>{t(contactForm.sending)}</BusyLabel> : t(contactForm.submit)}
      </button>
    </form>
  );
}

function Field({
  id,
  name,
  label,
  error,
  placeholder,
  autoComplete,
  dir,
}: {
  id: string;
  name: keyof typeof empty;
  label: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  dir?: string;
}) {
  return (
    <label className="block" htmlFor={id}>
      <span className="font-body text-xs uppercase tracking-ultrawide text-gold-muted">{label}</span>
      <input
        id={id}
        name={name}
        required
        autoComplete={autoComplete}
        dir={dir}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className="mt-2 min-h-12 w-full rounded-2xl border border-ink-line bg-ink-card px-4 font-body text-sm text-cream outline-none transition-colors focus:border-gold-muted"
      />
      {error ? <span className="mt-1.5 block font-body text-xs text-red-400">{error}</span> : null}
    </label>
  );
}
