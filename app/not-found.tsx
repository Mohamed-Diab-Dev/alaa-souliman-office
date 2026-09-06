import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-3xl font-black text-forest">الصفحة مش موجودة</h1>
      <Link href="/" className="mt-6 rounded-full bg-forest px-6 py-3 font-bold text-cream">
        ارجع للرئيسية
      </Link>
    </main>
  );
}
