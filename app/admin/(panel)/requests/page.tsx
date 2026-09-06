import { signVoiceUrl } from "@/app/actions/requests";
import { RequestStatusForm } from "@/components/admin/request-status-form";
import { StatusBadge } from "@/components/status-badge";
import { categoryLabel } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatArabicDateTime } from "@/lib/utils";

export default async function AdminRequestsPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("requests")
    .select(
      "id, request_number, category, voice_url, notes, status, admin_reply, created_at, citizens(name, national_id)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = await Promise.all(
    (data ?? []).map(async (row) => ({
      ...row,
      signed_voice_url: row.voice_url ? await signVoiceUrl(row.voice_url) : null,
    })),
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest">طلبات المواطنين</h1>
        <p className="mt-2 text-muted">حدّث الحالة من هنا. المواطن هيشوف الحالة على صفحته هو فقط.</p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => {
          const citizen = Array.isArray(row.citizens) ? row.citizens[0] : row.citizens;
          return (
            <article key={row.id} className="rounded-3xl bg-white p-5 card-shadow">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-forest">
                    طلب {row.request_number} · {citizen?.name}
                  </p>
                  <p className="text-sm text-muted">
                    {citizen?.national_id} · {categoryLabel(row.category)} ·{" "}
                    {formatArabicDateTime(row.created_at)}
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
