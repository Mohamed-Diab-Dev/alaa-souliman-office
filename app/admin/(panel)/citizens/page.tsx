import { registerCitizen } from "@/app/actions/admin-citizens";
import { CitizenRegisterForm } from "@/components/admin/citizen-register-form";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminCitizensPage() {
  const supabase = createAdminClient();
  const { data: citizens } = await supabase
    .from("citizens")
    .select("id, name, national_id, address, created_at, citizen_phones(phone)")
    .order("created_at", { ascending: false })
    .limit(80);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">تسجيل مواطن</h1>
        <p className="mt-2 text-muted">
          الأدمن هو اللي بيسجّل الناس. الدخول بعد كده بالرقم القومي + أي رقم تليفون متسجل.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 card-shadow">
        <CitizenRegisterForm action={registerCitizen} />
      </div>

      <div className="overflow-x-auto rounded-3xl bg-white card-shadow">
        <table className="w-full min-w-[720px] text-right">
          <thead className="bg-sand text-sm text-forest">
            <tr>
              <th className="p-3">الاسم</th>
              <th className="p-3">الرقم القومي</th>
              <th className="p-3">التليفونات</th>
              <th className="p-3">العنوان</th>
            </tr>
          </thead>
          <tbody>
            {(citizens ?? []).map((citizen) => (
              <tr key={citizen.id} className="border-t border-forest/5">
                <td className="p-3 font-bold">{citizen.name}</td>
                <td className="p-3 tracking-wider">{citizen.national_id}</td>
                <td className="p-3">
                  {(citizen.citizen_phones ?? []).map((item) => item.phone).join(" / ")}
                </td>
                <td className="p-3 text-muted">{citizen.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
