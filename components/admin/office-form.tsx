"use client";

import { useActionState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import type { ActionResult, Office } from "@/lib/types";

export function OfficeForm({
  action,
  office,
}: {
  action: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  office?: Pick<Office, "id" | "name" | "address" | "is_active">;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="grid gap-3 md:grid-cols-2">
      {office ? <input type="hidden" name="id" value={office.id} /> : null}
      <input
        name="name"
        defaultValue={office?.name}
        className="field"
        placeholder="اسم المكتب"
        required
      />
      <input
        name="address"
        defaultValue={office?.address}
        className="field"
        placeholder="العنوان"
      />
      <label className="flex items-center gap-2 text-sm font-bold text-forest">
        <input type="checkbox" name="is_active" defaultChecked={office?.is_active ?? true} />
        المكتب ظاهر للحجز
      </label>
      <div className="space-y-2">
        <Alert error={state.error} success={state.success} />
        <SubmitButton>{office ? "تحديث المكتب" : "إضافة مكتب"}</SubmitButton>
      </div>
    </form>
  );
}
