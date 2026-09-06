import {
  addAchievement,
  addSlide,
  deleteAchievement,
  deleteSlide,
  saveAbout,
} from "@/app/actions/admin-content";
import { ContentForms } from "@/components/admin/content-forms";
import { getPublicContent } from "@/lib/data/public";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminContentPage() {
  const [{ about, slides, achievements }, supabase] = await Promise.all([
    getPublicContent(),
    Promise.resolve(createAdminClient()),
  ]);

  const { data: allSlides } = await supabase
    .from("landing_slides")
    .select("id, image_url, title, subtitle, sort_order, is_active")
    .order("sort_order", { ascending: true });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">محتوى الموقع</h1>
        <p className="mt-2 text-muted">السلايدر، النبذة التعريفية، وصفحة الإنجازات.</p>
      </div>
      <ContentForms
        about={about}
        slides={allSlides ?? slides}
        achievements={achievements}
        saveAbout={saveAbout}
        addSlide={addSlide}
        addAchievement={addAchievement}
        deleteSlide={deleteSlide}
        deleteAchievement={deleteAchievement}
      />
    </div>
  );
}
