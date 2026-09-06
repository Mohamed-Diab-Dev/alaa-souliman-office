"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { bookAppointment } from "@/app/actions/appointments";
import { formatArabicDate, formatArabicTime } from "@/lib/utils";
import type { BookableOffice } from "@/lib/types";

export function BookingWizard({
  offices,
  closedMessage,
  citizenName = "",
  requireContact = true,
}: {
  offices: BookableOffice[];
  closedMessage: string;
  citizenName?: string;
  requireContact?: boolean;
}) {
  const router = useRouter();
  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [dateId, setDateId] = useState("");
  const [slotId, setSlotId] = useState("");
  const [name, setName] = useState(citizenName);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const office = offices.find((item) => item.id === officeId);
  const date = office?.dates.find((item) => item.id === dateId);

  const summary = useMemo(() => {
    if (!office || !date || !slotId) return "";
    const slot = date.slots.find((item) => item.id === slotId);
    if (!slot) return "";
    return `${office.name} · ${formatArabicDate(date.work_date)} · ${formatArabicTime(slot.start_time)}`;
  }, [office, date, slotId]);

  if (offices.length === 0) {
    return (
      <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
        <p className="text-2xl font-black text-amber-950">لا توجد مواعيد الآن</p>
        <p className="mt-3 text-lg leading-9 text-amber-900">{closedMessage}</p>
      </div>
    );
  }

  async function confirm() {
    if (!slotId) return;
    if (requireContact) {
      if (name.trim().length < 3) {
        setError("اكتب الاسم الثلاثي على الأقل");
        return;
      }
      if (!phone.trim()) {
        setError("اكتب رقم التليفون");
        return;
      }
    }
    setPending(true);
    setError("");
    const data = new FormData();
    data.set("slot_id", slotId);
    if (requireContact) {
      data.set("name", name.trim());
      data.set("phone", phone.trim());
    }
    const result = await bookAppointment(data);
    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setMessage(result.success ?? "تم الحجز");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {requireContact ? (
        <section className="rounded-3xl bg-white p-5 card-shadow">
          <h2 className="mb-3 text-xl font-black text-forest">بياناتك</h2>
          <p className="mb-4 text-sm leading-7 text-muted">
            الحجز من غير تسجيل دخول. اكتب الاسم ورقم التليفون بس.
          </p>
          <div className="space-y-3">
            <label className="block space-y-1">
              <span className="text-sm font-bold text-forest">الاسم</span>
              <input
                className="field"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="الاسم الثلاثي"
                required
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-bold text-forest">رقم التليفون</span>
              <input
                className="field"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01xxxxxxxxx"
                inputMode="tel"
                required
              />
            </label>
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-3 text-xl font-black text-forest">١) اختار المكتب</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {offices.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setOfficeId(item.id);
                setDateId("");
                setSlotId("");
              }}
              className={`rounded-3xl border p-5 text-right ${
                officeId === item.id
                  ? "border-gold bg-gold-soft/30"
                  : "border-forest/10 bg-white"
              }`}
            >
              <p className="text-lg font-black text-forest">{item.name}</p>
              <p className="mt-1 text-sm text-muted">{item.address}</p>
            </button>
          ))}
        </div>
      </section>

      {office ? (
        <section>
          <h2 className="mb-3 text-xl font-black text-forest">٢) اختار اليوم</h2>
          <div className="flex flex-wrap gap-3">
            {office.dates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setDateId(item.id);
                  setSlotId("");
                }}
                className={`min-h-16 rounded-2xl px-4 py-3 font-bold ${
                  dateId === item.id
                    ? "bg-forest text-cream"
                    : "bg-white text-forest ring-1 ring-forest/10"
                }`}
              >
                {formatArabicDate(item.work_date)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {date ? (
        <section>
          <h2 className="mb-3 text-xl font-black text-forest">٣) اختار الساعة</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {date.slots.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSlotId(item.id)}
                className={`rounded-2xl px-4 py-4 text-lg font-black ${
                  slotId === item.id
                    ? "bg-gold text-forest-deep"
                    : "bg-white text-forest ring-1 ring-forest/10"
                }`}
              >
                {formatArabicTime(item.start_time)}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {summary ? (
        <div className="rounded-3xl bg-forest p-6 text-cream">
          <p className="text-sm text-gold-soft">الميعاد المختار</p>
          <p className="mt-2 text-xl font-black">{summary}</p>
          {requireContact && name.trim() ? (
            <p className="mt-2 text-cream/85">
              باسم: {name.trim()}
              {phone.trim() ? ` · ${phone.trim()}` : ""}
            </p>
          ) : null}
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="mt-5 h-14 w-full rounded-2xl bg-gold text-lg font-black text-forest-deep disabled:opacity-60"
          >
            {pending ? "جاري الحجز..." : "أكّد الحجز"}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 font-semibold text-rose-800">{error}</p>
      ) : null}
      {message ? (
        <p className="rounded-2xl bg-emerald-50 px-4 py-3 font-semibold text-emerald-900">
          {message}
        </p>
      ) : null}
    </div>
  );
}
