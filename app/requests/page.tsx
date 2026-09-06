import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";
import { requireCitizen } from "@/lib/auth/citizen";
import { signVoiceUrl } from "@/app/actions/requests";
import { cancelAppointment } from "@/app/actions/appointments";
import { StatusBadge } from "@/components/status-badge";
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
      <h1 className="text-3xl font-black text-forest">أهلاً {citizen.name}</h1>
      <p className="mt-2 text-muted">هنا طلباتك ومواعيدك بس. محدش غيرك شايفهم.</p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link
          href="/requests/new"
          className="rounded-[2rem] bg-forest p-6 text-cream card-shadow"
        >
          <Plus className="h-10 w-10 text-gold" />
          <p className="mt-4 text-2xl font-black">قدّم طلب جديد</p>
          <p className="mt-2 text-cream/80">احكي بصوتك أو بمساعدة حد من أهلك</p>
        </Link>
        <Link
          href="/book"
          className="rounded-[2rem] bg-gold p-6 text-forest-deep card-shadow"
        >
          <CalendarPlus className="h-10 w-10" />
          <p className="mt-4 text-2xl font-black">احجز معاد</p>
          <p className="mt-2 text-forest-deep/80">اختار المكتب وبعدين اليوم والساعة</p>
        </Link>
      </div>

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
            لسه مفيش طلبات. اضغط على الزر الأخضر الكبير وقدّم أول طلب.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {requests.map((request) => (
              <article key={request.id} className="rounded-3xl bg-white p-5 card-shadow">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-black text-forest">
                    طلب رقم {request.request_number}
                  </p>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-2 text-sm text-muted">
                  {categoryLabel(request.category)} · {formatArabicDateTime(request.created_at)}
                </p>
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
