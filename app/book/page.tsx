import Link from "next/link";
import { BookingWizard } from "@/components/booking-wizard";
import { requireCitizen } from "@/lib/auth/citizen";
import { getBookableOffices } from "@/lib/data/booking";
import { getPublicContent } from "@/lib/data/public";

export default async function BookPage() {
  await requireCitizen();
  const [offices, { bookingMessage }] = await Promise.all([
    getBookableOffices(),
    getPublicContent(),
  ]);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
      <Link href="/requests" className="text-sm font-bold text-forest">
        رجوع لطلباتي
      </Link>
      <h1 className="mt-4 text-3xl font-black text-forest">حجز معاد</h1>
      <p className="mt-2 leading-8 text-muted">
        اختار المكتب الأول. الأيام والمواعيد بيحددها المكتب حسب تواجد النائب.
      </p>
      <div className="mt-8">
        <BookingWizard offices={offices} closedMessage={bookingMessage} />
      </div>
    </main>
  );
}
