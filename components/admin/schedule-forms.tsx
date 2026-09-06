"use client";

import { useActionState, useMemo, useState } from "react";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import { formatArabicDate, formatArabicTime } from "@/lib/utils";
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
  const [slotOfficeId, setSlotOfficeId] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("14:00");
  const [interval, setInterval] = useState(30);

  const officeDays = dates.filter((date) => date.office_id === slotOfficeId);

  const preview = useMemo(() => {
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (Number.isNaN(sh) || Number.isNaN(eh)) return [];
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (end <= start || interval <= 0) return [];
    const items: string[] = [];
    for (let minutes = start; minutes < end; minutes += interval) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mm = String(minutes % 60).padStart(2, "0");
      items.push(`${hh}:${mm}`);
    }
    return items;
  }, [startTime, endTime, interval]);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={datesAction} className="space-y-3">
        <h2 className="text-lg font-black text-forest">إضافة أيام لمكتب</h2>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">المكتب</span>
          <select name="office_id" className="field" required>
            <option value="">اختار المكتب</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">من يوم</span>
          <input name="start_date" type="date" className="field" required />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">إلى يوم</span>
          <input name="end_date" type="date" className="field" />
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-forest">
          <input type="checkbox" name="skip_weekend" defaultChecked />
          استبعد الجمعة والسبت
        </label>
        <Alert error={datesState.error} success={datesState.success} />
        <SubmitButton>حفظ الأيام</SubmitButton>
      </form>

      <form action={slotsAction} className="space-y-3">
        <h2 className="text-lg font-black text-forest">توليد مواعيد ليوم</h2>
        <p className="text-sm leading-7 text-muted">
          حدّد تواجد النائب: من الساعة كام إلى الساعة كام. الموقع هيقطع اليوم
          لمواعيد، كل ميعاد مدته اللي تحت.
        </p>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">المكتب</span>
          <select
            className="field"
            value={slotOfficeId}
            onChange={(event) => setSlotOfficeId(event.target.value)}
            required
          >
            <option value="">اختار المكتب</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">اليوم</span>
          <select
            name="office_date_id"
            className="field"
            required
            disabled={!slotOfficeId}
            key={slotOfficeId}
          >
            <option value="">
              {slotOfficeId ? "اختار اليوم" : "اختار المكتب الأول"}
            </option>
            {officeDays.map((date) => (
              <option key={date.id} value={date.id}>
                {formatArabicDate(date.work_date)}
              </option>
            ))}
          </select>
        </label>
        {slotOfficeId && officeDays.length === 0 ? (
          <p className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-950">
            المكتب ده لسه من غير أيام. ضيف الأيام من الفورم التاني الأول.
          </p>
        ) : null}
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">من الساعة</span>
          <input
            name="start_time"
            type="time"
            className="field"
            required
            value={startTime}
            onChange={(event) => setStartTime(event.target.value)}
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">إلى الساعة</span>
          <input
            name="end_time"
            type="time"
            className="field"
            required
            value={endTime}
            onChange={(event) => setEndTime(event.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted">مدة الميعاد بالدقايق</span>
            <input
              name="interval"
              type="number"
              min={10}
              value={interval}
              onChange={(event) => setInterval(Number(event.target.value) || 30)}
              className="field"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-bold text-muted">عدد الناس في الميعاد</span>
            <input name="capacity" type="number" min={1} defaultValue={1} className="field" />
          </label>
        </div>
        {preview.length > 0 ? (
          <p className="rounded-2xl bg-sand px-4 py-3 text-sm leading-7 text-forest">
            هيتولد <strong>{preview.length}</strong> ميعاد:{" "}
            {preview.slice(0, 6).map(formatArabicTime).join("، ")}
            {preview.length > 6 ? "…" : ""}
          </p>
        ) : (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">
            وقت النهاية لازم يكون بعد البداية. مثال: من 10:00 إلى 14:00
          </p>
        )}
        <Alert error={slotsState.error} success={slotsState.success} />
        <SubmitButton>إضافة المواعيد</SubmitButton>
      </form>
    </div>
  );
}
