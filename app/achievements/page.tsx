import { getPublicContent } from "@/lib/data/public";

export const revalidate = 60;

export default async function AchievementsPage() {
  const { achievements, siteName } = await getPublicContent();

  return (
    <main className="pattern-grid flex-1">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-sm font-bold text-gold">سجل العمل</p>
        <h1 className="mt-2 text-4xl font-black text-forest">إنجازات {siteName}</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          الصورة بتحكي الإنجاز، والكلام للتوضيح. الصفحة دي مفتوحة للجميع.
        </p>

        {achievements.length === 0 ? (
          <div className="mt-10 rounded-3xl bg-white p-10 text-center card-shadow">
            <p className="text-xl font-bold text-forest">لسه مفيش إنجازات منشورة</p>
            <p className="mt-2 text-muted">الأدمن يقدر يضيفها من لوحة التحكم.</p>
          </div>
        ) : (
          <div className="mt-10 grid gap-5 md:grid-cols-12">
            {achievements.map((item, index) => {
              const featured = index === 0;
              const wide = index % 5 === 1 || index % 5 === 2;
              return (
                <article
                  key={item.id}
                  className={`group overflow-hidden rounded-[2rem] bg-forest-deep text-cream card-shadow ${
                    featured
                      ? "md:col-span-12 md:grid md:grid-cols-2"
                      : wide
                        ? "md:col-span-7"
                        : "md:col-span-5"
                  }`}
                >
                  <div className={featured ? "min-h-80" : "min-h-64"}>
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full min-h-64 bg-forest" />
                    )}
                  </div>
                  <div className="p-6 md:p-8">
                    <p className="text-xs font-bold tracking-[0.2em] text-gold-soft">
                      إنجاز
                    </p>
                    <h2 className="mt-2 text-2xl font-black leading-10">{item.title}</h2>
                    {item.body ? (
                      <p className="mt-3 whitespace-pre-line leading-8 text-cream/85">
                        {item.body}
                      </p>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
