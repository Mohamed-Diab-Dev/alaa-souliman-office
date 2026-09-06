import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { requireCitizen } from "@/lib/auth/citizen";
import { signVoiceUrl } from "@/app/actions/requests";
import { cancelAppointment } from "@/app/actions/appointments";
import { RequestStatus } from "@/components/request-status";
import { getCitizenAppointments } from "@/lib/data/booking";
import { categoryLabel } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  cairoToday,
  formatArabicDate,
  formatArabicDateTime,
  formatArabicTime,
} from "@/lib/utils";
import type { CitizenRequest } from "@/lib/types";

export default async function RequestsPage() {
  const citizen = await requireCitizen();
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("requests")
    .select(
      "id, request_number, category, voice_url, notes, status, admin_reply, created_at",
    )
    .eq("citizen_id", citizen.id)
    .order("created_at", { ascending: false });

  const requests = await Promise.all(
    ((data ?? []) as CitizenRequest[]).map(async (request) => ({
      ...request,
      signed_voice_url: request.voice_url
        ? await signVoiceUrl(request.voice_url)
        : null,
    })),
  );

  const appointments = await getCitizenAppointments(citizen.id);
  const today = cairoToday();
  const upcoming = appointments.filter(
    (item) => item.status === "confirmed" && item.work_date >= today,
  );
  const notices = appointments
    .filter(
      (item) =>
        item.admin_note && (item.status === "cancelled" || item.status === "confirmed"),
    )
    .slice(0, 8);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-black text-forest">أهلاً {citizen.name}</h1>
      <p className="mt-2 text-muted">
        هنا تتابع طلباتك ومواعيدك. تقديم الطلب بيتم من المكتب.
      </p>

      <div className="mt-8">
        <Link
          href="/book"
          className="inline-flex max-w-md flex-col rounded-[2rem] bg-gold p-6 text-forest-deep card-shadow"
        >
          <CalendarPlus className="h-10 w-10" />
          <p className="mt-4 text-2xl font-black">احجز معاد</p>
          <p className="mt-2 text-forest-deep/80">اختار المكتب وبعدين اليوم والساعة</p>
        </Link>
      </div>

      {notices.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-black text-forest">رسائل المواعيد</h2>
          {notices.map((item) => (
            <div
              key={`note-${item.id}`}
              className={`rounded-3xl p-5 card-shadow ${
                item.status === "cancelled" ? "bg-rose-50" : "bg-amber-50"
              }`}
            >
              <p className="text-lg font-black text-forest">
                {item.status === "cancelled" ? "ميعاد ملغي" : "تحديث على معادك"}
              </p>
              <p className="mt-1 text-muted">
                {item.office_name}
                {item.work_date
                  ? ` · ${formatArabicDate(item.work_date)} · ${formatArabicTime(item.start_time)}`
                  : ""}
              </p>
              <p className="mt-3 whitespace-pre-line leading-8 text-ink">{item.admin_note}</p>
            </div>
          ))}
        </section>
      ) : null}

      {upcoming.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-black text-forest">مواعيدك الجاية</h2>
          {upcoming.map((item) => (
            <div key={item.id} className="rounded-3xl bg-white p-5 card-shadow">
              <p className="text-xl font-black text-forest">{item.office_name}</p>
              <p className="mt-1 text-muted">{item.office_address}</p>
              <p className="mt-3 text-lg font-bold">
                {formatArabicDate(item.work_date)} · {formatArabicTime(item.start_time)}
              </p>
              {item.admin_note ? (
                <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 leading-8 text-amber-950">
                  {item.admin_note}
                </p>
              ) : null}
              <form action={cancelAppointment} className="mt-4">
                <input type="hidden" name="appointment_id" value={item.id} />
                <button className="rounded-full border border-rose-200 px-4 py-2 text-sm font-bold text-rose-700">
                  إلغاء الميعاد
                </button>
              </form>
            </div>
          ))}
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-2xl font-black text-forest">طلباتي</h2>
        {requests.length === 0 ? (
          <p className="mt-4 rounded-3xl bg-white p-8 text-muted card-shadow">
            لسه مفيش طلبات. المكتب هو اللي بيسجّل الطلب، وبعدها هيظهر هنا تتابع حالته.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-3xl bg-white p-5 card-shadow">
                <p className="font-black text-forest">
                  طلب رقم {request.request_number}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {categoryLabel(request.category)} · {formatArabicDateTime(request.created_at)}
                </p>
                <div className="mt-4">
                  <RequestStatus status={request.status} />
                </div>
                {request.notes ? (
                  <p className="mt-3 leading-8">{request.notes}</p>
                ) : null}
                {request.signed_voice_url ? (
                  <audio className="mt-4 w-full" controls src={request.signed_voice_url} />
                ) : null}
                {request.admin_reply ? (
                  <p className="mt-4 rounded-2xl bg-sand px-4 py-3 leading-8">
                    <span className="font-bold text-forest">رد المكتب: </span>
                    {request.admin_reply}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
