"use client";

import { useActionState } from "react";
import { saveSettings } from "@/app/actions/admin-settings";
import { Alert, SubmitButton } from "@/components/admin/form-status";

export function SettingsForm({
  siteName,
  bookingMessage,
}: {
  siteName: string;
  bookingMessage: string;
}) {
  const [state, action] = useActionState(saveSettings, {});

  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-bold text-forest">اسم الموقع</span>
        <input name="site_name" defaultValue={siteName} className="field" required />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-bold text-forest">رسالة عدم وجود مواعيد</span>
        <textarea
          name="booking_closed_message"
          defaultValue={bookingMessage}
          className="field min-h-32"
          required
        />
      </label>
      <Alert error={state.error} success={state.success} />
      <SubmitButton>حفظ الإعدادات</SubmitButton>
    </form>
  );
}
