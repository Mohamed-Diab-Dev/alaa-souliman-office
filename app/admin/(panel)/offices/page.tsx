import { deleteOffice, saveOffice } from "@/app/actions/admin-offices";
import { OfficeForm } from "@/components/admin/office-form";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminOfficesPage() {
  const supabase = createAdminClient();
  const { data: offices } = await supabase
    .from("offices")
    .select("id, name, address, is_active")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">مكاتب النائب</h1>
        <p className="mt-2 text-muted">
          أضف المقرات. الأيام من جدول المواعيد، والحجوزات من صفحة حجوزات المواطنين.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 card-shadow">
        <OfficeForm action={saveOffice} />
      </div>

      <div className="space-y-4">
        {(offices ?? []).map((office) => (
          <div key={office.id} className="rounded-3xl bg-white p-5 card-shadow">
            <OfficeForm action={saveOffice} office={office} />
            <form action={deleteOffice} className="mt-3">
              <input type="hidden" name="id" value={office.id} />
              <button className="text-sm font-bold text-rose-700">حذف المكتب</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
