"use client";

import { useActionState, useMemo, useState } from "react";
import { cancelOfficeDay } from "@/app/actions/admin-schedule";
import { Alert, SubmitButton } from "@/components/admin/form-status";
import type { AdminOfficeDay } from "@/lib/data/admin-schedule";
import type { Office } from "@/lib/types";
import { formatArabicDate } from "@/lib/utils";

export function DayCancelPanel({
  offices,
  days,
}: {
  offices: Office[];
  days: AdminOfficeDay[];
}) {
  const [state, action] = useActionState(cancelOfficeDay, {});
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [dayId, setDayId] = useState("");
  const [bookingAction, setBookingAction] = useState<"cancel" | "move">("cancel");

  const officeDays = useMemo(
    () =>
      days
        .filter((day) => day.office_id === officeId)
        .slice()
        .sort((a, b) => a.work_date.localeCompare(b.work_date)),
    [days, officeId],
  );

  const activeDays = officeDays.filter((day) => !day.is_cancelled);
  const selectedDay = activeDays.find((day) => day.id === dayId) ?? activeDays[0];
  const selectedDayId = selectedDay?.id ?? "";

  const moveTargets = useMemo(() => {
    const targets = activeDays.filter((day) => day.id !== selectedDayId);
    const withSlots = targets
      .filter((day) => day.slots.length > 0)
      .sort((a, b) => a.work_date.localeCompare(b.work_date));
    const withoutSlots = targets
      .filter((day) => day.slots.length === 0)
      .sort((a, b) => a.work_date.localeCompare(b.work_date));
    return { withSlots, withoutSlots };
  }, [activeDays, selectedDayId]);

  const confirmedCount = selectedDay
    ? selectedDay.slots.reduce(
        (sum, slot) =>
          sum + slot.bookings.filter((booking) => booking.status === "confirmed").length,
        0,
      )
    : 0;

  return (
    <section className="rounded-3xl bg-white p-6 card-shadow">
      <h2 className="text-xl font-black text-forest">إلغاء يوم تواجد</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
        لو النائب سافر أو حصل ظرف، الغي اليوم واكتب رسالة للمواطنين. بعدين اختار:
        تلغي الحجوزات، أو ترحّلها ليوم تاني في نفس المكتب.
      </p>

      <form action={action} className="mt-5 space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">المكتب</span>
          <select
            className="field"
            value={officeId}
            onChange={(event) => {
              setOfficeId(event.target.value);
              setDayId("");
            }}
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
          <span className="text-sm font-bold text-forest">اليوم اللي هيتلغى</span>
          <select
            name="office_date_id"
            className="field"
            required
            disabled={!officeId}
            value={selectedDayId}
            onChange={(event) => setDayId(event.target.value)}
          >
            <option value="">
              {officeId ? "اختار اليوم" : "اختار المكتب الأول"}
            </option>
            {activeDays.map((day) => {
              const booked = day.slots.reduce(
                (sum, slot) =>
                  sum +
                  slot.bookings.filter((booking) => booking.status === "confirmed").length,
                0,
              );
              return (
                <option key={day.id} value={day.id}>
                  {formatArabicDate(day.work_date)} — {booked} حجز مؤكد
                </option>
              );
            })}
          </select>
        </label>

        {selectedDay ? (
          <p className="rounded-2xl bg-sand px-4 py-3 text-sm leading-7 text-forest">
            اليوم ده عليه <strong>{confirmedCount}</strong> حجز مؤكد.
          </p>
        ) : null}

        <fieldset className="space-y-2 rounded-2xl bg-sand/60 p-4">
          <legend className="px-1 text-sm font-black text-forest">إيه يحصل للحجوزات؟</legend>
          <label className="flex items-start gap-3 text-sm leading-7 text-forest">
            <input
              type="radio"
              name="booking_action"
              value="cancel"
              checked={bookingAction === "cancel"}
              onChange={() => setBookingAction("cancel")}
              className="mt-1"
            />
            <span>
              <strong>إلغاء الحجوزات</strong>
              <br />
              المعاد يتلغى، والمواطن يشوف رسالة الأدمن في طلباته.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-7 text-forest">
            <input
              type="radio"
              name="booking_action"
              value="move"
              checked={bookingAction === "move"}
              onChange={() => setBookingAction("move")}
              className="mt-1"
            />
            <span>
              <strong>ترحيل الحجوزات ليوم تاني</strong>
              <br />
              نحاول ننقل كل حجز لنفس الساعة في اليوم الجديد. لو الساعة مش متاحة،
              الحجز يتلغى برسالة.
            </span>
          </label>
        </fieldset>

        {bookingAction === "move" ? (
          <div className="space-y-2">
            <label className="block space-y-1">
              <span className="text-sm font-bold text-forest">اليوم الجديد (بالتاريخ)</span>
              <select name="target_office_date_id" className="field" required>
                <option value="">اختار يوم الترحيل</option>
                {moveTargets.withSlots.length > 0 ? (
                  <optgroup label="أيام فيها مواعيد — ينفع الترحيل">
                    {moveTargets.withSlots.map((day) => {
                      const booked = day.slots.reduce(
                        (sum, slot) =>
                          sum +
                          slot.bookings.filter((booking) => booking.status === "confirmed")
                            .length,
                        0,
                      );
                      const free = day.slots.reduce(
                        (sum, slot) =>
                          sum +
                          Math.max(
                            0,
                            slot.capacity -
                              slot.bookings.filter((booking) => booking.status === "confirmed")
                                .length,
                          ),
                        0,
                      );
                      return (
                        <option key={day.id} value={day.id}>
                          {formatArabicDate(day.work_date)} — {day.slots.length} ميعاد ·{" "}
                          {booked} محجوز · فاضي {free}
                        </option>
                      );
                    })}
                  </optgroup>
                ) : null}
                {moveTargets.withoutSlots.length > 0 ? (
                  <optgroup label="أيام من غير مواعيد — مش ينفع ترحيل">
                    {moveTargets.withoutSlots.map((day) => (
                      <option key={day.id} value={day.id} disabled>
                        {formatArabicDate(day.work_date)} — مفيش مواعيد خالص
                      </option>
                    ))}
                  </optgroup>
                ) : null}
              </select>
            </label>
            {moveTargets.withSlots.length === 0 ? (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-800">
                مفيش يوم تاني عليه مواعيد في المكتب ده. ولّد مواعيد على يوم جديد الأول، أو
                اختار إلغاء الحجوزات.
              </p>
            ) : (
              <p className="rounded-2xl bg-sand px-4 py-3 text-sm leading-7 text-muted">
                اختار يوم فيه مواعيد عشان الترحيل ينجح لنفس الساعة. الأيام الفاضية ظاهرة
                للتوضيح بس ومش ينفع اختيارها.
              </p>
            )}
          </div>
        ) : null}

        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">رسالة للمواطنين</span>
          <textarea
            name="message"
            className="field min-h-28"
            required
            placeholder="مثال: النائب في مهمة رسمية واليوم اتلغى. تقدر تحجز يوم تاني من الموقع."
          />
        </label>

        <Alert error={state.error} success={state.success} />
        <SubmitButton className="h-12 rounded-2xl bg-rose-700 px-5 font-black text-white disabled:opacity-60">
          تأكيد إلغاء اليوم
        </SubmitButton>
      </form>

      {officeDays.some((day) => day.is_cancelled) ? (
        <div className="mt-6 space-y-2">
          <h3 className="text-sm font-black text-muted">أيام ملغاة</h3>
          {officeDays
            .filter((day) => day.is_cancelled)
            .map((day) => (
              <div key={day.id} className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-950">
                <p className="font-bold">{formatArabicDate(day.work_date)}</p>
                {day.cancel_message ? (
                  <p className="mt-1 leading-7">{day.cancel_message}</p>
                ) : null}
              </div>
            ))}
        </div>
      ) : null}
    </section>
  );
}
