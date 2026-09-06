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

type TableRow = {
  key: string;
  slotId: string;
  time: string;
  citizenName: string;
  nationalId: string;
  phones: string;
  status: string;
  bookingId: string | null;
};

function escapeCsv(value: string) {
  const text = value.replace(/"/g, '""');
  return `"${text}"`;
}

export function BookingsBoard({
  offices,
  days,
}: {
  offices: Office[];
  days: AdminOfficeDay[];
}) {
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [dayId, setDayId] = useState("");

  const office = offices.find((item) => item.id === officeId);
  const officeDays = useMemo(
    () => days.filter((day) => day.office_id === officeId && !day.is_cancelled),
    [days, officeId],
  );
  const selectedDay = officeDays.find((day) => day.id === dayId) ?? officeDays[0];

  const rows = useMemo(() => {
    if (!selectedDay) return [] as TableRow[];
    const list: TableRow[] = [];
    for (const slot of selectedDay.slots) {
      const time = `${formatArabicTime(slot.start_time)}${
        slot.end_time ? ` — ${formatArabicTime(slot.end_time)}` : ""
      }`;
      const bookings = slot.bookings.length
        ? slot.bookings
        : [
            {
              id: "",
              status: "",
              citizenName: "",
              nationalId: "",
              phones: [] as string[],
            },
          ];

      for (const booking of bookings) {
        list.push({
          key: `${slot.id}-${booking.id || "empty"}`,
          slotId: slot.id,
          time,
          citizenName: booking.citizenName || "—",
          nationalId: booking.nationalId || "—",
          phones: booking.phones.length ? booking.phones.join(" / ") : "—",
          status: booking.status ? statusLabel[booking.status] ?? booking.status : "فاضي",
          bookingId: booking.id || null,
        });
      }
    }
    return list;
  }, [selectedDay]);

  function exportSheet() {
    if (!selectedDay || !office) return;

    const header = [
      "المكتب",
      "التاريخ",
      "الميعاد",
      "الاسم",
      "الرقم القومي",
      "التليفون",
      "الحالة",
    ];

    const lines = [
      header.map(escapeCsv).join(","),
      ...rows.map((row) =>
        [
          office.name,
          formatArabicDate(selectedDay.work_date),
          row.time,
          row.citizenName,
          row.nationalId,
          row.phones,
          row.status,
        ]
          .map(escapeCsv)
          .join(","),
      ),
    ];

    const csv = `\uFEFF${lines.join("\n")}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const stamp = selectedDay.work_date.replaceAll("-", "");
    link.href = url;
    link.download = `حجوزات-${stamp}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <section className="rounded-3xl bg-white p-6 card-shadow">
      <h2 className="text-2xl font-black text-forest">حجوزات المواطنين</h2>
      <p className="mt-2 leading-8 text-muted">
        اختار المكتب، بعدين يوم تواجد النائب، وهتشوف المواعيد في جدول. تقدر تصدّر
        الجدول لشيت يفتح في Excel أو Google Sheets.
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
          {offices.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
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
                      active ? "bg-forest text-cream" : "bg-sand text-forest"
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
        <div className="mt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-xl font-black text-forest">
              مواعيد {formatArabicDate(selectedDay.work_date)}
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={exportSheet}
                disabled={selectedDay.slots.length === 0}
                className="rounded-2xl bg-forest px-4 py-2 text-sm font-black text-cream disabled:opacity-50"
              >
                تصدير شيت
              </button>
              <form action={deleteOfficeDate}>
                <input type="hidden" name="id" value={selectedDay.id} />
                <button className="text-sm font-bold text-rose-700">حذف اليوم</button>
              </form>
            </div>
          </div>

          {selectedDay.slots.length === 0 ? (
            <p className="rounded-2xl bg-sand px-4 py-4 text-muted">
              اليوم ده من غير مواعيد متولّدة.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-forest/10">
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-forest text-cream">
                  <tr>
                    <th className="px-3 py-3 text-right font-black">الميعاد</th>
                    <th className="px-3 py-3 text-right font-black">الاسم</th>
                    <th className="px-3 py-3 text-right font-black">الرقم القومي</th>
                    <th className="px-3 py-3 text-right font-black">التليفون</th>
                    <th className="px-3 py-3 text-right font-black">الحالة</th>
                    <th className="px-3 py-3 text-right font-black">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr
                      key={row.key}
                      className={index % 2 === 0 ? "bg-white" : "bg-sand/40"}
                    >
                      <td className="whitespace-nowrap px-3 py-3 font-bold text-forest">
                        {row.time}
                      </td>
                      <td className="px-3 py-3 font-bold text-forest">{row.citizenName}</td>
                      <td className="whitespace-nowrap px-3 py-3 tracking-wide text-muted">
                        {row.nationalId}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-muted">{row.phones}</td>
                      <td className="whitespace-nowrap px-3 py-3 font-bold">{row.status}</td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {row.bookingId && row.status === "مؤكد" ? (
                            <>
                              <form action={updateAppointmentStatus}>
                                <input type="hidden" name="id" value={row.bookingId} />
                                <input type="hidden" name="status" value="completed" />
                                <button className="rounded-full bg-forest px-3 py-1 text-xs font-bold text-cream">
                                  تم الحضور
                                </button>
                              </form>
                              <form action={updateAppointmentStatus}>
                                <input type="hidden" name="id" value={row.bookingId} />
                                <input type="hidden" name="status" value="cancelled" />
                                <button className="rounded-full border border-rose-200 px-3 py-1 text-xs font-bold text-rose-700">
                                  إلغاء
                                </button>
                              </form>
                            </>
                          ) : null}
                          <form action={deleteTimeSlot}>
                            <input type="hidden" name="id" value={row.slotId} />
                            <button className="text-xs font-bold text-rose-700">
                              حذف الميعاد
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}
