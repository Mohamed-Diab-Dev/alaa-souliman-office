"use client";

import { useActionState } from "react";
import { loginCitizen } from "@/app/actions/citizen-auth";
import { toEnglishDigits } from "@/lib/utils";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginCitizen, {});

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <label className="block space-y-2">
        <span className="text-sm font-bold text-forest">الرقم القومي</span>
        <input
          name="national_id"
          inputMode="numeric"
          maxLength={14}
          required
          placeholder="١٤ رقم"
          onInput={(event) => {
            event.currentTarget.value = toEnglishDigits(event.currentTarget.value).replace(/\D/g, "").slice(0, 14);
          }}
          className="h-14 w-full rounded-2xl border border-forest/15 bg-white px-4 text-lg tracking-[0.2em] outline-none focus:border-gold"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-bold text-forest">رقم التليفون</span>
        <input
          name="phone"
          inputMode="tel"
          required
          placeholder="01xxxxxxxxx"
          onInput={(event) => {
            event.currentTarget.value = toEnglishDigits(event.currentTarget.value).replace(/\D/g, "").slice(0, 11);
          }}
          className="h-14 w-full rounded-2xl border border-forest/15 bg-white px-4 text-lg outline-none focus:border-gold"
        />
      </label>
      {state.error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
          {state.error}
        </p>
      ) : null}
      <button
        disabled={pending}
        className="h-14 w-full rounded-2xl bg-forest text-lg font-black text-cream disabled:opacity-60"
      >
        {pending ? "جاري الدخول..." : "دخول"}
      </button>
      <p className="text-center text-sm leading-7 text-muted">
        التسجيل بيتم من مكتب النائب فقط. لو مش مسجّل، روح أقرب مكتب ومعاك البطاقة.
      </p>
    </form>
  );
}
