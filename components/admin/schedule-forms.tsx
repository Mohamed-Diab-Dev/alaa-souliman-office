"use client";

import { useActionState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import type { ActionResult, Office } from "@/lib/types";

type DateOption = {
  id: string;
  office_id: string;
  work_date: string;
};

export function ScheduleForms({
  offices,
  dates,
  addDates,
  addSlots,
}: {
  offices: Office[];
  dates: DateOption[];
  addDates: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
  addSlots: (prev: ActionResult, formData: FormData) => Promise<ActionResult>;
}) {
  const [datesState, datesAction] = useActionState(addDates, {});
  const [slotsState, slotsAction] = useActionState(addSlots, {});

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={datesAction} className="space-y-3">
        <h2 className="text-lg font-black text-forest">إضافة أيام لمكتب</h2>
        <select name="office_id" className="field" required>
          <option value="">اختار المكتب</option>
          {offices.map((office) => (
            <option key={office.id} value={office.id}>
              {office.name}
            </option>
          ))}
        </select>
        <input name="start_date" type="date" className="field" required />
        <input name="end_date" type="date" className="field" />
        <label className="flex items-center gap-2 text-sm font-bold text-forest">
          <input type="checkbox" name="skip_weekend" defaultChecked />
          استبعد الجمعة والسبت
        </label>
        <Alert error={datesState.error} success={datesState.success} />
        <SubmitButton>حفظ الأيام</SubmitButton>
      </form>

      <form action={slotsAction} className="space-y-3">
        <h2 className="text-lg font-black text-forest">توليد مواعيد ليوم</h2>
        <p className="text-sm text-muted">
          من الساعة كذا للساعة كذا، والموقع هيولّد المواعيد كل ٣٠ دقيقة مثلاً.
        </p>
        <select name="office_date_id" className="field" required>
          <option value="">اختار اليوم</option>
          {dates.map((date) => {
            const office = offices.find((item) => item.id === date.office_id);
            return (
              <option key={date.id} value={date.id}>
                {office?.name} - {date.work_date}
              </option>
            );
          })}
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input name="start_time" type="time" className="field" required />
          <input name="end_time" type="time" className="field" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted">المدة بالدقايق</span>
            <input name="interval" type="number" min={10} defaultValue={30} className="field" />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted">عدد الناس في الميعاد</span>
            <input name="capacity" type="number" min={1} defaultValue={1} className="field" />
          </label>
        </div>
        <Alert error={slotsState.error} success={slotsState.success} />
        <SubmitButton>إضافة المواعيد</SubmitButton>
      </form>
    </div>
  );
}
