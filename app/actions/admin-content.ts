"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { uploadPublicImage } from "@/lib/storage";
import type { ActionResult } from "@/lib/types";

function refreshPublic() {
  revalidateTag("public-content", "max");
  revalidatePath("/");
  revalidatePath("/achievements");
}

export async function saveAbout(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const heading = String(formData.get("heading") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const image = formData.get("image");

  try {
    const imageUrl =
      image instanceof File && image.size > 0
        ? await uploadPublicImage(image, "about")
        : null;

    const supabase = createAdminClient();
    const payload: Record<string, string> = { heading, body };
    if (imageUrl) payload.image_url = imageUrl;

    const { error } = await supabase
      .from("about_section")
      .upsert({ id: 1, ...payload });
    if (error) return { error: "حفظ النبذة فشل" };

    refreshPublic();
    return { success: "تم حفظ النبذة التعريفية" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حصل خطأ" };
  }
}

export async function addSlide(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const image = formData.get("image");

  if (!(image instanceof File) || image.size === 0) {
    return { error: "اختار صورة للسلايدر" };
  }

  try {
    const imageUrl = await uploadPublicImage(image, "slides");
    const supabase = createAdminClient();
    const { data: last } = await supabase
      .from("landing_slides")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("landing_slides").insert({
      title,
      subtitle,
      image_url: imageUrl,
      sort_order: (last?.sort_order ?? 0) + 1,
      is_active: true,
    });
    if (error) return { error: "إضافة الصورة فشلت" };

    refreshPublic();
    return { success: "تمت إضافة صورة السلايدر" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حصل خطأ" };
  }
}

export async function deleteSlide(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("landing_slides").delete().eq("id", id);
  refreshPublic();
}

