import Link from "next/link";
import { logoutAdmin } from "@/app/actions/admin-auth";
import { Emblem } from "@/components/emblem";

const links = [
  { href: "/admin", label: "الرئيسية" },
  { href: "/admin/citizens", label: "تسجيل المواطنين" },
  { href: "/admin/requests/new", label: "تقديم طلب" },
  { href: "/admin/requests", label: "الطلبات" },
  { href: "/admin/offices", label: "المكاتب" },
  { href: "/admin/schedule", label: "جدول المواعيد" },
  { href: "/admin/bookings", label: "حجوزات المواطنين" },
  { href: "/admin/content", label: "المحتوى" },
  { href: "/admin/achievements", label: "الإنجازات" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export function AdminShell({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#f3eee2] text-ink">
      <div className="mx-auto flex min-h-full max-w-7xl flex-col md:flex-row">
        <aside className="border-b border-forest/10 bg-forest-deep p-5 text-cream md:w-64 md:border-b-0 md:border-l">
          <div className="flex items-center gap-3">
            <Emblem className="h-10 w-10" />
            <div>
              <p className="font-black">لوحة التحكم</p>
              <p className="text-xs text-gold-soft">{name}</p>
            </div>
          </div>
          <nav className="mt-6 grid gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-xl px-3 py-2 text-sm font-bold hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <form action={logoutAdmin} className="mt-6">
            <button className="text-sm font-bold text-gold-soft">خروج الأدمن</button>
          </form>
        </aside>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
