import Link from "next/link";
import { RequestComposer } from "@/components/request-composer";
import { requireCitizen } from "@/lib/auth/citizen";

export default async function NewRequestPage() {
  await requireCitizen();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <Link href="/requests" className="text-sm font-bold text-forest">
        رجوع لطلباتي
      </Link>
      <h1 className="mt-4 text-3xl font-black text-forest">طلب جديد</h1>
      <p className="mt-2 leading-8 text-muted">
        اختار نوع الطلب، وبعدين احكي بصوتك. الكتابة اختيارية لو في حد بيساعدك.
      </p>
      <div className="mt-8 rounded-[2rem] bg-white p-6 card-shadow">
        <RequestComposer />
      </div>
    </main>
  );
}
