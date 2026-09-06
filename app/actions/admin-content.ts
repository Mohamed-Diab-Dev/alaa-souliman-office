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

function clampFocus(value: FormDataEntryValue | null) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export async function addSlide(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const focusX = clampFocus(formData.get("focus_x"));
  const focusY = clampFocus(formData.get("focus_y"));
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

    const base = {
      title,
      subtitle,
      image_url: imageUrl,
      sort_order: (last?.sort_order ?? 0) + 1,
      is_active: true,
    };

    let { error } = await supabase.from("landing_slides").insert({
      ...base,
      focus_x: focusX,
      focus_y: focusY,
    });

    if (error?.message?.includes("focus_")) {
      ({ error } = await supabase.from("landing_slides").insert(base));
      if (!error) {
        refreshPublic();
        return {
          success:
            "تمت إضافة الصورة. نفّذ supabase/add-slide-focus.sql عشان تقدر تتحكم في الجزء الظاهر.",
        };
      }
    }
    if (error) return { error: "إضافة الصورة فشلت" };

    refreshPublic();
    return { success: "تمت إضافة صورة السلايدر" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حصل خطأ" };
  }
}

export async function updateSlideFocus(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const focusX = clampFocus(formData.get("focus_x"));
  const focusY = clampFocus(formData.get("focus_y"));

  if (!id) return { error: "السلايد غير موجود" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("landing_slides")
    .update({ focus_x: focusX, focus_y: focusY })
    .eq("id", id);

  if (error) {
    if (error.message.includes("focus_")) {
      return {
        error: "نفّذ ملف supabase/add-slide-focus.sql في Supabase أولاً",
      };
    }
    return { error: "حفظ موضع الصورة فشل" };
  }

  refreshPublic();
  return { success: "تم حفظ موضع الصورة" };
}

export async function deleteSlide(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("landing_slides").delete().eq("id", id);
  refreshPublic();
}

