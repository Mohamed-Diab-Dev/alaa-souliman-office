import { AchievementForms } from "@/components/admin/achievement-forms";
import { getPublicContent } from "@/lib/data/public";

export default async function AdminAchievementsPage() {
  const { achievements } = await getPublicContent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-forest">الإنجازات</h1>
        <p className="mt-2 max-w-2xl leading-8 text-muted">
          كل إنجاز عبارة عن نص وصور. رتّب الإنجازات بزرار أعلى / أسفل، والترتيب
          ده هو اللي يظهر للمواطنين في صفحة الإنجازات.
        </p>
      </div>
      <AchievementForms achievements={achievements} />
    </div>
  );
}
