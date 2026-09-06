"use client";

import { useActionState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import type { ActionResult } from "@/lib/types";

export function CitizenRegisterForm({
  action,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-sm font-bold text-forest">الاسم</span>
        <input name="name" className="field" required />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-bold text-forest">الرقم القومي</span>
        <input name="national_id" className="field" inputMode="numeric" maxLength={14} required />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-bold text-forest">العنوان</span>
        <input name="address" className="field" required />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-sm font-bold text-forest">أرقام التليفون</span>
        <textarea
          name="phones"
          className="field min-h-24"
          placeholder="رقم في كل سطر، أو بينهم فاصلة"
          required
        />
      </label>
      <div className="md:col-span-2 space-y-3">
        <Alert error={state.error} success={state.success} />
        <SubmitButton>تسجيل المواطن</SubmitButton>
      </div>
    </form>
  );
}
