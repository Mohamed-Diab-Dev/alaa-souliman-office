import {
  addOfficeDates,
  addTimeSlots,
} from "@/app/actions/admin-schedule";
import { ScheduleForms } from "@/components/admin/schedule-forms";
import { getAdminScheduleBoard } from "@/lib/data/admin-schedule";

export default async function AdminSchedulePage() {
  const { offices, days } = await getAdminScheduleBoard();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">جدول المواعيد</h1>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          هنا بتحدد أيام تواجد النائب في كل مكتب، وتولّد المواعيد.
          حجوزات الأهالي بقت في صفحة حجوزات المواطنين.
        </p>
      </div>

      <div className="rounded-3xl bg-white p-6 card-shadow">
        <ScheduleForms
          offices={offices}
          dates={days.map((day) => ({
            id: day.id,
            office_id: day.office_id,
            work_date: day.work_date,
          }))}
          addDates={addOfficeDates}
          addSlots={addTimeSlots}
        />
      </div>
    </div>
  );
}
