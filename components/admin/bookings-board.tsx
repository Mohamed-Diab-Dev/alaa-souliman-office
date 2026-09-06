"use client";

import { useMemo, useState } from "react";
import { updateAppointmentStatus } from "@/app/actions/admin-requests";
import { deleteOfficeDate, deleteTimeSlot } from "@/app/actions/admin-schedule";
import type { AdminOfficeDay } from "@/lib/data/admin-schedule";
import type { Office } from "@/lib/types";
import { formatArabicDate, formatArabicTime } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  confirmed: "مؤكد",
  cancelled: "ملغي",
  completed: "تم الحضور",
};

export function BookingsBoard({
  offices,
  days,
}: {
  offices: Office[];
  days: AdminOfficeDay[];
}) {
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [dayId, setDayId] = useState("");

  const officeDays = useMemo(
    () => days.filter((day) => day.office_id === officeId),
    [days, officeId],
  );
  const selectedDay = officeDays.find((day) => day.id === dayId) ?? officeDays[0];

  return (
    <section className="rounded-3xl bg-white p-6 card-shadow">
      <h2 className="text-2xl font-black text-forest">حجوزات المواطنين</h2>
      <p className="mt-2 leading-8 text-muted">
        اختار المكتب، بعدين يوم تواجد النائب، وهتشوف كل ميعاد ومين اللي حجزه.
      </p>

      <label className="mt-5 block space-y-1">
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

      {officeId ? (
        <div className="mt-5">
          <p className="mb-3 text-sm font-bold text-forest">أيام التواجد</p>
          {officeDays.length === 0 ? (
            <p className="rounded-2xl bg-amber-50 px-4 py-3 text-amber-950">
              المكتب ده مفيش عليه أيام لسه.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {officeDays.map((day) => {
                const booked = day.slots.filter((slot) =>
                  slot.bookings.some((booking) => booking.status === "confirmed"),
                ).length;
                const active = (selectedDay?.id ?? "") === day.id;
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => setDayId(day.id)}
                    className={`rounded-2xl px-4 py-3 text-right ${
                      active
                        ? "bg-forest text-cream"
                        : "bg-sand text-forest"
                    }`}
                  >
                    <span className="block font-black">
                      {formatArabicDate(day.work_date)}
                    </span>
                    <span className="text-sm opacity-80">
                      {booked} حجز من {day.slots.length} ميعاد
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

      {selectedDay ? (
        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-black text-forest">
              مواعيد {formatArabicDate(selectedDay.work_date)}
            </h3>
            <form action={deleteOfficeDate}>
              <input type="hidden" name="id" value={selectedDay.id} />
              <button className="text-sm font-bold text-rose-700">حذف اليوم</button>
            </form>
          </div>

          {selectedDay.slots.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-4 text-muted">
              اليوم ده من غير مواعيد متولّدة.
            </p>
          ) : (
            selectedDay.slots.map((slot) => {
              const active = slot.bookings.filter((item) => item.status !== "cancelled");
              const empty = active.length === 0;
              return (
                <article
                  key={slot.id}
                  className={`rounded-2xl p-4 ${empty ? "bg-sand/70" : "bg-emerald-50"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-lg font-black text-forest">
                      {formatArabicTime(slot.start_time)}
                      {slot.end_time ? ` — ${formatArabicTime(slot.end_time)}` : ""}
                    </p>
                    <form action={deleteTimeSlot}>
                      <input type="hidden" name="id" value={slot.id} />
                      <button className="text-sm font-bold text-rose-700">حذف الميعاد</button>
                    </form>
                  </div>

                  {empty ? (
                    <p className="mt-2 font-bold text-muted">فاضي — محدش حجز الميعاد ده</p>
                  ) : (
                    <ul className="mt-3 space-y-3">
                      {slot.bookings.map((booking) => (
                        <li key={booking.id} className="rounded-2xl bg-white p-3">
                          <p className="text-lg font-black text-forest">
                            {booking.citizenName}
                          </p>
                          <p className="text-sm text-muted">
                            الرقم القومي: {booking.nationalId}
                          </p>
                          {booking.phones.length > 0 ? (
                            <p className="text-sm text-muted">
                              التليفون: {booking.phones.join(" / ")}
                            </p>
                          ) : null}
                          <p className="mt-1 text-sm font-bold">
                            الحالة: {statusLabel[booking.status] ?? booking.status}
                          </p>
                          {booking.status === "confirmed" ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <form action={updateAppointmentStatus}>
                                <input type="hidden" name="id" value={booking.id} />
                                <input type="hidden" name="status" value="completed" />
                                <button className="rounded-full bg-forest px-3 py-1 text-sm font-bold text-cream">
                                  تم الحضور
                                </button>
                              </form>
                              <form action={updateAppointmentStatus}>
                                <input type="hidden" name="id" value={booking.id} />
                                <input type="hidden" name="status" value="cancelled" />
                                <button className="rounded-full border border-rose-200 px-3 py-1 text-sm font-bold text-rose-700">
                                  إلغاء الحجز
                                </button>
                              </form>
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })
          )}
        </div>
      ) : null}
    </section>
  );
}
