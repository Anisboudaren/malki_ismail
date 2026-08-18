"use client";

import { useState } from "react";
import { activateOrderAccess, convertOrderToUser } from "@/app/actions/orders";
import { btnClass, inputClass } from "@/app/components/dashboard/ui";
import { BusyLabel } from "@/app/components/ui/BusyLabel";

export function ConvertOrderForm({
  orderId,
  name,
  hasUser,
}: {
  orderId: string;
  name: string;
  hasUser?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (hasUser) {
    return (
      <form
        className="mt-3"
        action={async () => {
          setPending(true);
          const result = await activateOrderAccess(orderId);
          setPending(false);
          if (result && "ok" in result && !result.ok) setError("message" in result ? result.message : "Erreur");
        }}
      >
        {error ? <p className="mb-2 font-body text-xs text-red-400">{error}</p> : null}
        <button type="submit" disabled={pending} aria-busy={pending} className={btnClass}>
          {pending ? <BusyLabel>Activation…</BusyLabel> : "Activer l’accès"}
        </button>
      </form>
    );
  }

  return (
    <form
      className="mt-3 space-y-2"
      onSubmit={async (event) => {
        event.preventDefault();
        setPending(true);
        setError(null);
        const data = new FormData(event.currentTarget);
        const result = await convertOrderToUser(orderId, data);
        setPending(false);
        if (result && "ok" in result && !result.ok) setError("message" in result ? result.message : "Erreur");
      }}
    >
      <p className="font-body text-xs text-cream-faint">Créer un compte élève pour {name}</p>
      <input
        name="email"
        type="email"
        required
        placeholder="email@…"
        className={inputClass}
        dir="ltr"
      />
      {error ? <p className="font-body text-xs text-red-400">{error}</p> : null}
      <button type="submit" disabled={pending} aria-busy={pending} className={btnClass}>
        {pending ? <BusyLabel>Conversion…</BusyLabel> : "Convertir en compte"}
      </button>
    </form>
  );
}
