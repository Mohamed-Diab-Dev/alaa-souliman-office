import { AchievementMedia } from "@/components/achievement-media";
import { Emblem } from "@/components/emblem";
import { getPublicContent } from "@/lib/data/public";

export const revalidate = 60;

function galleryNumber(value: number) {
  return String(value)
    .padStart(2, "0")
    .replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
}

export default async function AchievementsPage() {
  const { achievements } = await getPublicContent();

  return (
    <main className="achievement-stage flex-1">
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
          <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-forest/20 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 md:pt-14">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-white/50 px-3 py-1 text-sm font-bold text-forest backdrop-blur-md">
                <Emblem className="h-6 w-6" />
                سجل العمل الميداني
              </div>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.25] text-forest md:text-6xl">
                إنجازات تتشاف
                <span className="block text-gold">قبل ما تتقال</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-9 text-muted">
                الصورة كارت، والقصة على الصفحة. كل إنجاز بيتبادل يمين وشمال.
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-gold/25 bg-forest-deep px-6 py-5 text-cream shadow-[0_20px_50px_-28px_rgba(8,36,28,0.8)]">
              <p className="text-sm font-bold text-gold-soft">عدد الإنجازات</p>
              <p
                className="mt-1 font-black leading-none tracking-tight text-cream"
                style={{ fontSize: "3.4rem" }}
              >
                {galleryNumber(achievements.length)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16">
        {achievements.length === 0 ? (
          <div className="rounded-[2rem] border border-gold/20 bg-white/70 p-12 text-center backdrop-blur-md card-shadow">
            <p className="text-2xl font-black text-forest">لسه مفيش إنجازات منشورة</p>
            <p className="mt-2 text-lg text-muted">
              أول ما المكتب يضيف إنجاز، هيظهر هنا بصورة كبيرة وقصة واضحة.
            </p>
          </div>
        ) : (
          achievements.map((item, index) => (
            <AchievementMedia
              key={item.id}
              title={item.title}
              body={item.body}
              images={item.images}
              variant={index === 0 ? "hero" : "tile"}
              number={galleryNumber(index + 1)}
              flip={index % 2 === 1}
            />
          ))
        )}
      </div>
    </main>
  );
}
