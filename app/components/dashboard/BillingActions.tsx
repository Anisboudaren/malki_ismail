"use client";

import { useState } from "react";
import { createManualOrder, grantCourseAccess, markOrderPaid, refundOrder } from "@/app/actions/orders";
import { btnClass, btnGhost, inputClass } from "@/app/components/dashboard/ui";
import { ConfirmSubmit } from "@/app/components/dashboard/ConfirmSubmit";
import { SaveButton } from "@/app/components/dashboard/SaveButton";
import { BusyLabel } from "@/app/components/ui/BusyLabel";

export function MarkPaidForm({
  orderId,
  needsEmail,
}: {
  orderId: string;
  needsEmail: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const result = await markOrderPaid(orderId, new FormData(event.currentTarget));
        setPending(false);
        if (result && !result.ok) setError(result.message);
      }}
    >
      {needsEmail ? (
        <input
          name="email"
          type="email"
          required
          placeholder="email@…"
          className={`${inputClass} sm:w-56`}
          dir="ltr"
        />
      ) : null}
      <button type="submit" disabled={pending} aria-busy={pending} className={`${btnClass} min-h-11`}>
        {pending ? <BusyLabel>Marquer payé…</BusyLabel> : "Marquer payé"}
      </button>
      {error ? <p className="font-body text-xs text-red-400">{error}</p> : null}
    </form>
  );
}

export function RefundForm({ orderId }: { orderId: string }) {
  return (
    <ConfirmSubmit
      action={refundOrder.bind(null, orderId)}
      message="Rembourser cette commande ? Cochez ci-dessous seulement si vous voulez aussi retirer l’accès au cours."
      label="Rembourser"
      extra={
        <label className="flex min-h-11 items-center gap-2 font-body text-sm text-cream-dim">
          <input type="checkbox" name="revoke" />
          Retirer aussi l’accès au cours
        </label>
      }
    />
  );
}

export function ManualOrderForm({
  courses,
  users,
}: {
  courses: { id: string; titleFr: string; priceDzd: number | null }[];
  users: { id: string; name: string | null; email: string }[];
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className={btnClass} onClick={() => setOpen(true)}>
        Saisie manuelle
      </button>
    );
  }
  return (
    <form
      action={async (data) => {
        await createManualOrder(data);
      }}
      className="mt-4 space-y-3 rounded-2xl border border-ink-line bg-ink-card p-4"
    >
      <p className="font-body text-sm text-cream">Enregistrer une transaction (vente héritée, cash, etc.).</p>
      <select name="courseId" required className={inputClass}>
        <option value="">Cours…</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.titleFr}
          </option>
        ))}
      </select>
      <select name="userId" className={inputClass}>
        <option value="">Nouvel élève / invité</option>
        {users.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name || user.email}
          </option>
        ))}
      </select>
      <input name="name" placeholder="Nom" className={inputClass} />
      <input name="email" type="email" placeholder="Email (si nouveau compte)" className={inputClass} dir="ltr" />
      <input name="whatsapp" placeholder="WhatsApp" className={inputClass} dir="ltr" />
      <input name="amountDzd" type="number" min={0} placeholder="Montant DA" className={inputClass} dir="ltr" />
      <select name="status" defaultValue="PAID" className={inputClass}>
        <option value="PAID">Payé (active l’accès)</option>
        <option value="COMP">Offert / manuel (active l’accès)</option>
        <option value="PENDING">En attente (pas d’accès)</option>
      </select>
      <div className="flex flex-wrap gap-2">
        <SaveButton label="Enregistrer" />
        <button type="button" className={btnGhost} onClick={() => setOpen(false)}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export function GrantAccessForm({
  courses,
  userId,
  defaultName = "",
}: {
  courses: { id: string; titleFr: string; priceDzd: number | null }[];
  userId?: string;
  defaultName?: string;
}) {
  return (
    <form
      action={async (data) => {
        await grantCourseAccess(data);
      }}
      className="space-y-3"
    >
      {userId ? <input type="hidden" name="userId" value={userId} /> : null}
      {!userId ? (
        <>
          <input name="name" required defaultValue={defaultName} placeholder="Nom" className={inputClass} />
          <input name="email" type="email" placeholder="Email" className={inputClass} dir="ltr" />
          <input name="whatsapp" placeholder="WhatsApp" className={inputClass} dir="ltr" />
        </>
      ) : null}
      <select name="courseId" required className={inputClass}>
        <option value="">Cours…</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.titleFr}
            {course.priceDzd != null ? ` — ${course.priceDzd} DA` : ""}
          </option>
        ))}
      </select>
      <input
        name="amountDzd"
        type="number"
        min={0}
        placeholder="Montant (0 = offert)"
        className={inputClass}
        dir="ltr"
      />
      <SaveButton label="Accorder l’accès" />
    </form>
  );
}
