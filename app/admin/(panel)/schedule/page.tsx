import {
  addOfficeDates,
  addTimeSlots,
  deleteOfficeDate,
  deleteTimeSlot,
} from "@/app/actions/admin-schedule";
import { ScheduleForms } from "@/components/admin/schedule-forms";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatArabicDate, formatArabicTime } from "@/lib/utils";

export default async function AdminSchedulePage() {
  const supabase = createAdminClient();
  const { data: offices } = await supabase
    .from("offices")
    .select("id, name, address, is_active")
    .order("created_at", { ascending: true });

  const officeIds = (offices ?? []).map((office) => office.id);
  const { data: dates } = officeIds.length
    ? await supabase
        .from("office_dates")
        .select("id, office_id, work_date, time_slots(id, start_time, end_time, capacity)")
        .in("office_id", officeIds)
        .order("work_date", { ascending: true })
    : { data: [] };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">جدول المواعيد</h1>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          حط أيام الأسبوع أو أسبوعين حسب نزول النائب. لو مفيش أيام، الناس هتشوف رسالة الإغلاق من الإعدادات.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 card-shadow">
        <ScheduleForms
          offices={offices ?? []}
          dates={(dates ?? []).map((date) => ({
            id: date.id,
            office_id: date.office_id,
            work_date: date.work_date,
          }))}
          addDates={addOfficeDates}
          addSlots={addTimeSlots}
        />
      </div>

      <div className="space-y-5">
        {(offices ?? []).map((office) => {
          const officeDates = (dates ?? []).filter((item) => item.office_id === office.id);
          return (
            <section key={office.id} className="rounded-3xl bg-white p-5 card-shadow">
              <h2 className="text-xl font-black text-forest">{office.name}</h2>
              {officeDates.length === 0 ? (
                <p className="mt-3 text-muted">مفيش أيام متضافة للمكتب ده.</p>
              ) : (
                <div className="mt-4 space-y-4">
                  {officeDates.map((date) => (
                    <div key={date.id} className="rounded-2xl bg-sand/60 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-black">{formatArabicDate(date.work_date)}</p>
                        <form action={deleteOfficeDate}>
                          <input type="hidden" name="id" value={date.id} />
                          <button className="text-sm font-bold text-rose-700">حذف اليوم</button>
                        </form>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(date.time_slots ?? []).map((slot) => (
                          <form key={slot.id} action={deleteTimeSlot}>
                            <input type="hidden" name="id" value={slot.id} />
                            <button className="rounded-full bg-white px-3 py-1 text-sm font-bold text-forest">
                              {formatArabicTime(slot.start_time)} ×
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
