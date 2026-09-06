import { SettingsForm } from "@/components/admin/settings-form";
import { getPublicContent } from "@/lib/data/public";

export default async function AdminSettingsPage() {
  const { siteName, bookingMessage } = await getPublicContent();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest">إعدادات الموقع</h1>
        <p className="mt-2 leading-8 text-muted">
          رسالة إغلاق المواعيد تظهر لما النائب مسافر أو مفيش جدول منشور للأسبوع.
        </p>
      </div>
      <div className="rounded-3xl bg-white p-6 card-shadow">
        <SettingsForm siteName={siteName} bookingMessage={bookingMessage} />
      </div>
    </div>
  );
}
