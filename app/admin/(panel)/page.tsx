import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomePage() {
  const supabase = createAdminClient();
  const [citizens, requests, pending, appointments] = await Promise.all([
    supabase.from("citizens").select("id", { count: "exact", head: true }),
    supabase.from("requests").select("id", { count: "exact", head: true }),
    supabase
      .from("requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("status", "confirmed"),
  ]);

  const cards = [
    { label: "المواطنون", value: citizens.count ?? 0, href: "/admin/citizens" },
    { label: "كل الطلبات", value: requests.count ?? 0, href: "/admin/requests" },
    { label: "طلبات جديدة", value: pending.count ?? 0, href: "/admin/requests" },
    { label: "مواعيد مؤكدة", value: appointments.count ?? 0, href: "/admin/bookings" },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black text-forest">لوحة المكتب</h1>
      <p className="mt-2 text-muted">إدارة التسجيل والطلبات والمواعيد ومحتوى الموقع.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-3xl bg-white p-5 card-shadow"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p className="mt-2 text-4xl font-black text-forest">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
