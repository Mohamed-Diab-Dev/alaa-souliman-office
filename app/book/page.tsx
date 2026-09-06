import Link from "next/link";
import { BookingWizard } from "@/components/booking-wizard";
import { getCitizenSession } from "@/lib/auth/citizen";
import { getBookableOffices } from "@/lib/data/booking";
import { getPublicContent } from "@/lib/data/public";

export default async function BookPage() {
  const session = await getCitizenSession();
  const [offices, { bookingMessage }] = await Promise.all([
    getBookableOffices(),
    getPublicContent(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Link href="/" className="text-sm font-bold text-forest">
        رجوع للرئيسية
      </Link>
      <h1 className="mt-4 text-3xl font-black text-forest">حجز معاد</h1>
      <p className="mt-2 leading-8 text-muted">
        {session
          ? "اختار المكتب واليوم والساعة المتاحة."
          : "من غير تسجيل دخول: اكتب اسمك ورقم تليفونك، بعدين اختار المكتب واليوم والساعة."}
      </p>
      <div className="mt-8">
        <BookingWizard
          offices={offices}
          closedMessage={bookingMessage}
          citizenName={session?.name ?? ""}
          requireContact={!session}
        />
      </div>
    </main>
  );
}
