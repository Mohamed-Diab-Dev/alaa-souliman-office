import { AdminRequestComposer } from "@/components/admin/admin-request-composer";

export default function AdminNewRequestPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest">تقديم طلب</h1>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          اكتب الرقم القومي للمواطن المسجّل، راجع بياناته، وبعدين سجّل الطلب.
          المواطن هيشوف الطلب لما يدخل بحسابه.
        </p>
      </div>
      <AdminRequestComposer />
    </div>
  );
}
