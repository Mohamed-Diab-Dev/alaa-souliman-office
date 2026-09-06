import {
  addSlide,
  deleteSlide,
  saveAbout,
  updateSlideFocus,
} from "@/app/actions/admin-content";
import { ContentForms } from "@/components/admin/content-forms";
import { getPublicContent } from "@/lib/data/public";
import { createAdminClient } from "@/lib/supabase/admin";
import type { LandingSlide } from "@/lib/types";

function normalizeSlides(
  rows: Array<Record<string, unknown>> | null | undefined,
  fallback: LandingSlide[],
): LandingSlide[] {
  if (!rows?.length) return fallback;
  return rows.map((row) => ({
    id: String(row.id),
    image_url: String(row.image_url ?? ""),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    focus_x: typeof row.focus_x === "number" ? row.focus_x : 50,
    focus_y: typeof row.focus_y === "number" ? row.focus_y : 50,
    sort_order: typeof row.sort_order === "number" ? row.sort_order : 0,
    is_active: Boolean(row.is_active),
  }));
}

export default async function AdminContentPage() {
  const [{ about, slides }, supabase] = await Promise.all([
    getPublicContent(),
    Promise.resolve(createAdminClient()),
  ]);

  let { data: allSlides, error } = await supabase
    .from("landing_slides")
    .select("id, image_url, title, subtitle, focus_x, focus_y, sort_order, is_active")
    .order("sort_order", { ascending: true });

  if (error) {
    const fallback = await supabase
      .from("landing_slides")
      .select("id, image_url, title, subtitle, sort_order, is_active")
      .order("sort_order", { ascending: true });
    allSlides = fallback.data;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-forest">محتوى الموقع</h1>
        <p className="mt-2 text-muted">سلايدر الصفحة الرئيسية والنبذة التعريفية.</p>
      </div>
      <ContentForms
        about={about}
        slides={normalizeSlides(allSlides, slides)}
        saveAbout={saveAbout}
        addSlide={addSlide}
        updateSlideFocus={updateSlideFocus}
        deleteSlide={deleteSlide}
      />
    </div>
  );
}
