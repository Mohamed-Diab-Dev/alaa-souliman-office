import { BookingsBoard } from "@/components/admin/bookings-board";
import { getAdminScheduleBoard } from "@/lib/data/admin-schedule";

export default async function AdminBookingsPage() {
  const { offices, days } = await getAdminScheduleBoard();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest">حجوزات المواطنين</h1>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          اختار المكتب، بعدين يوم التواجد، وهتشوف كل معاد ومين اللي حجزه.
          إضافة الأيام والمواعيد من صفحة جدول المواعيد.
        </p>
      </div>
      <BookingsBoard offices={offices} days={days} />
    </div>
  );
}
