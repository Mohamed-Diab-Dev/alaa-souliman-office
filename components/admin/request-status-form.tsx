"use client";

import { useActionState } from "react";
import { updateRequestStatus } from "@/app/actions/admin-requests";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import { REQUEST_STATUSES } from "@/lib/constants";

export function RequestStatusForm({
  id,
  status,
  adminReply,
}: {
  id: string;
  status: string;
  adminReply: string;
}) {
  const [state, action] = useActionState(updateRequestStatus, {});

  return (
    <form action={action} className="grid gap-3 md:grid-cols-[200px_1fr_auto]">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} className="field">
        {REQUEST_STATUSES.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
      <input
        name="admin_reply"
        defaultValue={adminReply}
        className="field"
        placeholder="رد مختصر يظهر للمواطن"
      />
      <SubmitButton>تحديث</SubmitButton>
      <div className="md:col-span-3">
        <Alert error={state.error} success={state.success} />
      </div>
    </form>
  );
}
