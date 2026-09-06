import Link from "next/link";
import { signVoiceUrl } from "@/app/actions/requests";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { StatusBadge } from "@/components/status-badge";
import { categoryLabel } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatArabicDateTime,
  normalizeNationalId,
  normalizePhone,
  toEnglishDigits,
} from "@/lib/utils";

type SearchParams = Promise<{ q?: string }>;

export default async function AdminRequestsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const query = toEnglishDigits(String(params.q ?? "")).trim();
  const supabase = createAdminClient();

  let citizenIds: string[] | null = null;

  if (query) {
    const phone = normalizePhone(query);
    const nationalId = normalizeNationalId(query);

    if (phone) {
      const { data: phones } = await supabase
        .from("citizen_phones")
        .select("citizen_id")
        .eq("phone", phone);
      citizenIds = [...new Set((phones ?? []).map((row) => row.citizen_id))];
    } else if (nationalId.length >= 6) {
      const { data: citizens } = await supabase
        .from("citizens")
        .select("id")
        .ilike("national_id", `%${nationalId}%`);
      citizenIds = (citizens ?? []).map((row) => row.id);
    } else {
      const { data: byName } = await supabase
        .from("citizens")
        .select("id")
        .ilike("name", `%${query}%`);
      citizenIds = (byName ?? []).map((row) => row.id);
    }
  }

  let requestQuery = supabase
    .from("requests")
    .select(
      "id, request_number, category, voice_url, notes, status, admin_reply, created_at, citizens(name, national_id, citizen_phones(phone))",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (citizenIds) {
    if (citizenIds.length === 0) {
      requestQuery = requestQuery.in("citizen_id", ["00000000-0000-0000-0000-000000000000"]);
    } else {
      requestQuery = requestQuery.in("citizen_id", citizenIds);
    }
  }

  const { data } = await requestQuery;

  const rows = await Promise.all(
    (data ?? []).map(async (row) => ({
      ...row,
      signed_voice_url: row.voice_url ? await signVoiceUrl(row.voice_url) : null,
    })),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-forest">الطلبات</h1>
          <p className="mt-2 max-w-2xl leading-8 text-muted">
            تابع الطلبات وحدّث حالتها. تقدّر تبحث بالرقم القومي أو الاسم أو رقم
            التليفون.
          </p>
        </div>
        <Link
          href="/admin/requests/new"
          className="rounded-2xl bg-forest px-5 py-3 font-black text-cream"
        >
          تقديم طلب جديد
        </Link>
      </div>

      <form className="rounded-3xl bg-white p-5 card-shadow">
        <label className="block space-y-1">
          <span className="text-sm font-bold text-forest">بحث</span>
          <div className="flex flex-wrap gap-3">
            <input
              name="q"
              defaultValue={params.q ?? ""}
              className="field min-w-[16rem] flex-1"
              placeholder="رقم قومي أو اسم أو تليفون"
            />
            <button className="h-12 rounded-2xl bg-forest px-5 font-black text-cream">
              بحث
            </button>
            {params.q ? (
              <Link
                href="/admin/requests"
                className="flex h-12 items-center rounded-2xl border border-forest/15 px-5 font-bold text-forest"
              >
                مسح
              </Link>
            ) : null}
          </div>
        </label>
        {query ? (
          <p className="mt-3 text-sm text-muted">
            نتائج البحث عن: <strong className="text-forest">{params.q}</strong> —{" "}
            {rows.length} طلب
          </p>
        ) : null}
      </form>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <p className="rounded-3xl bg-white p-8 text-muted card-shadow">
            {query ? "مفيش طلبات مطابقة للبحث." : "لسه مفيش طلبات مسجّلة."}
          </p>
        ) : null}
        {rows.map((row) => {
          const citizen = Array.isArray(row.citizens) ? row.citizens[0] : row.citizens;
          const phones = (citizen?.citizen_phones ?? []).map(
            (item: { phone: string }) => item.phone,
          );
          return (
            <article key={row.id} className="rounded-3xl bg-white p-5 card-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-forest">
                    طلب {row.request_number} · {citizen?.name}
                  </p>
                  <p className="text-sm text-muted">
                    {citizen?.national_id}
                    {phones.length ? ` · ${phones.join(" / ")}` : ""} ·{" "}
                    {categoryLabel(row.category)} · {formatArabicDateTime(row.created_at)}
                  </p>
                </div>
                <StatusBadge status={row.status} />
              </div>
              {row.notes ? <p className="mt-3 leading-8">{row.notes}</p> : null}
              {row.signed_voice_url ? (
                <audio className="mt-4 w-full" controls src={row.signed_voice_url} />
              ) : null}
              <div className="mt-4">
                <RequestStatusForm
                  id={row.id}
                  status={row.status}
                  adminReply={row.admin_reply}
                />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
