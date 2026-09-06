import Link from "next/link";
import { CalendarCheck, ShieldCheck } from "lucide-react";
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
        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href="/book"
            className="rounded-3xl bg-white p-6 card-shadow transition hover:-translate-y-0.5"
          >
            <CalendarCheck className="h-8 w-8 text-gold" />
            <h3 className="mt-4 text-xl font-black text-forest">احجز معاد</h3>
            <p className="mt-2 leading-8 text-muted">
              بالاسم ورقم التليفون من غير تسجيل دخول. اختار المكتب واليوم والساعة.
            </p>
            <span className="mt-5 inline-flex rounded-full bg-forest px-4 py-2 text-sm font-bold text-cream">
              ابدأ الحجز
            </span>
          </Link>

          <Link
            href="/login?next=/requests"
            className="rounded-3xl bg-white p-6 card-shadow transition hover:-translate-y-0.5"
          >
            <ShieldCheck className="h-8 w-8 text-gold" />
            <h3 className="mt-4 text-xl font-black text-forest">تابع الحالة</h3>
            <p className="mt-2 leading-8 text-muted">
              دخول بالرقم القومي والتليفون عشان تشوف طلباتك ومتابعة حالتها.
            </p>
            <span className="mt-5 inline-flex rounded-full border border-forest/15 px-4 py-2 text-sm font-bold text-forest">
              دخول لمتابعة الطلب
            </span>
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/book"
            className="rounded-full bg-forest px-6 py-3 font-black text-cream"
          >
            احجز معاد
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
