import Link from "next/link";
import { CalendarCheck, FileAudio, ShieldCheck } from "lucide-react";
import { getPublicContent } from "@/lib/data/public";
import { LandingSlider } from "@/components/landing-slider";

export const revalidate = 60;

export default async function HomePage() {
  const { siteName, slides, about } = await getPublicContent();

  return (
    <main>
      <LandingSlider slides={slides} siteName={siteName} />

      <section className="pattern-grid">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 md:grid-cols-2 md:items-center">
          <div className="order-1">
            <p className="text-sm font-bold text-gold">عن النائب</p>
            <h2 className="mt-2 text-3xl font-black text-forest md:text-4xl">
              {about.heading}
            </h2>
            <div className="gold-line my-5 h-px w-32" />
            <p className="whitespace-pre-line text-lg leading-9 text-ink/80">
              {about.body}
            </p>
          </div>
          <div className="order-2 overflow-hidden rounded-[2rem] card-shadow">
            {about.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={about.image_url}
                alt={about.heading}
                className="h-full min-h-80 w-full object-cover"
              />
            ) : (
              <div className="flex min-h-80 items-end bg-gradient-to-br from-forest to-forest-deep p-8 text-cream">
                <p className="text-2xl font-black">خدمة تليق بأهل الدائرة</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: FileAudio,
              title: "قدّم طلبك",
              text: "احكي المشكلة بصوتك من غير كتابة.",
            },
            {
              icon: ShieldCheck,
              title: "تابع الحالة",
              text: "كل مواطن يشوف طلباته هو بس.",
            },
            {
              icon: CalendarCheck,
              title: "احجز معاد",
              text: "اختار المكتب واليوم والساعة المتاحة.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 card-shadow">
              <item.icon className="h-8 w-8 text-gold" />
              <h3 className="mt-4 text-xl font-black text-forest">{item.title}</h3>
              <p className="mt-2 leading-8 text-muted">{item.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/requests"
            className="rounded-full bg-forest px-6 py-3 font-black text-cream"
          >
            ادخل على طلباتك
          </Link>
          <Link
            href="/achievements"
            className="rounded-full border border-forest/15 px-6 py-3 font-bold text-forest"
          >
            شوف الإنجازات
          </Link>
        </div>
      </section>
    </main>
  );
}
