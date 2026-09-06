import { redirect } from "next/navigation";
import { AdminLoginForms } from "@/components/admin/admin-login-forms";
import { adminCount, getAdminUser } from "@/lib/auth/admin";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const existing = await getAdminUser();
  if (existing) redirect("/admin");

  let needsBootstrap = false;
  try {
    needsBootstrap = (await adminCount()) === 0;
  } catch {
    needsBootstrap = true;
  }

  return (
    <main className="fixed inset-0 z-50 overflow-auto pattern-grid">
      <div className="mx-auto flex min-h-full max-w-md items-center px-4 py-16">
        <div className="w-full rounded-[2rem] bg-white p-8 card-shadow">
          <h1 className="text-3xl font-black text-forest">دخول الإدارة</h1>
          <p className="mt-2 leading-8 text-muted">
            الصفحة دي للمكتب فقط. المواطنين يدخلوا من صفحة الدخول العادية.
          </p>
          <div className="mt-8">
            <AdminLoginForms needsBootstrap={needsBootstrap} />
          </div>
        </div>
      </div>
    </main>
  );
}
