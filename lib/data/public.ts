import { unstable_cache } from "next/cache";
import { SITE_DEFAULT_NAME } from "@/lib/constants";
import { createAdminClient, hasSupabaseEnv } from "@/lib/supabase/admin";
import type { AboutSection, Achievement, LandingSlide } from "@/lib/types";

const fallbackAbout: AboutSection = {
  heading: "النبذة التعريفية",
  body: "مكتب خدمة المواطنين للنائب علاء سليمان. نستقبل طلبات الأهالي ونتابعها حتى يتم حلها، ونفتح أبواب المكاتب للمقابلات حسب الجدول المعلن.",
  image_url: "",
};

async function loadPublicContent() {
  if (!hasSupabaseEnv() || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      siteName: SITE_DEFAULT_NAME,
      bookingMessage:
        "لا توجد مواعيد متاحة حالياً. النائب في مهمة رسمية، تابعونا قريباً لإعلان الجدول الجديد.",
      slides: [] as LandingSlide[],
      about: fallbackAbout,
      achievements: [] as Achievement[],
    };
  }

  const supabase = createAdminClient();

  const [settingsRes, slidesRes, aboutRes, achievementsRes] = await Promise.all([
    supabase.from("site_settings").select("key, value"),
    supabase
      .from("landing_slides")
      .select("id, image_url, title, subtitle, sort_order, is_active")
      .eq("is_active", true)
      .order("sort_order", { ascending: true }),
    supabase
      .from("about_section")
      .select("heading, body, image_url")
      .eq("id", 1)
      .maybeSingle(),
    supabase
      .from("achievements")
      .select("id, image_url, title, body, sort_order")
      .order("sort_order", { ascending: true }),
  ]);

  const settings = new Map(
    (settingsRes.data ?? []).map((row) => [row.key, row.value]),
  );

  return {
    siteName: settings.get("site_name") || SITE_DEFAULT_NAME,
    bookingMessage:
      settings.get("booking_closed_message") ||
      "لا توجد مواعيد متاحة حالياً.",
    slides: (slidesRes.data ?? []) as LandingSlide[],
    about: (aboutRes.data as AboutSection | null) ?? fallbackAbout,
    achievements: (achievementsRes.data ?? []) as Achievement[],
  };
}

export const getPublicContent = unstable_cache(loadPublicContent, ["public-content"], {
  revalidate: 60,
  tags: ["public-content"],
});
