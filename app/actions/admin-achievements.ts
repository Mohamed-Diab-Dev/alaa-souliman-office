"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import {
  decodeAchievementImages,
  encodeAchievementImages,
  isMissingAchievementImagesTable,
} from "@/lib/achievement-images";
import { requireAdmin } from "@/lib/auth/admin";
import { filesFromForm, uploadPublicImage } from "@/lib/storage";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

function refreshPublic() {
  revalidateTag("public-content", "max");
  revalidatePath("/achievements");
  revalidatePath("/admin/achievements");
}

async function saveAchievementImageRows(
  achievementId: string,
  urls: string[],
  startOrder = 0,
) {
  const supabase = createAdminClient();
  const { error } = await supabase.from("achievement_images").insert(
    urls.map((image_url, index) => ({
      achievement_id: achievementId,
      image_url,
      sort_order: startOrder + index,
    })),
  );
  if (error && !isMissingAchievementImagesTable(error)) {
    return error.message;
  }
  return null;
}

export async function addAchievement(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const files = filesFromForm(formData, "images");

  if (!title) return { error: "عنوان الإنجاز مطلوب" };
  if (files.length === 0) return { error: "ارفع صورة واحدة على الأقل" };

  try {
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadPublicImage(file, "achievements");
      if (url) urls.push(url);
    }
    if (urls.length === 0) return { error: "رفع الصور فشل" };

    const supabase = createAdminClient();
    const { data: last } = await supabase
      .from("achievements")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: achievement, error } = await supabase
      .from("achievements")
      .insert({
        title,
        body,
        image_url: encodeAchievementImages(urls),
        sort_order: (last?.sort_order ?? 0) + 1,
      })
      .select("id")
      .single();

    if (error || !achievement) return { error: "إضافة الإنجاز فشلت" };

    const imagesError = await saveAchievementImageRows(achievement.id, urls);
    if (imagesError) return { error: imagesError };

    refreshPublic();
    return {
      success:
        urls.length === 1
          ? "تم إضافة الإنجاز بصورة واحدة"
          : `تم إضافة الإنجاز بسلايدر ${urls.length} صور`,
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حصل خطأ" };
  }
}

export async function addAchievementImages(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const files = filesFromForm(formData, "images");
  if (!id) return { error: "الإنجاز غير موجود" };
  if (files.length === 0) return { error: "اختار صور" };

  try {
    const supabase = createAdminClient();
    const { data: current, error: currentError } = await supabase
      .from("achievements")
      .select("image_url")
      .eq("id", id)
      .single();
    if (currentError || !current) return { error: "الإنجاز غير موجود" };

    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadPublicImage(file, "achievements");
      if (url) urls.push(url);
    }
    if (urls.length === 0) return { error: "رفع الصور فشل" };

    const existing = decodeAchievementImages(current.image_url);
    const next = [...existing, ...urls];
    const { error: updateError } = await supabase
      .from("achievements")
      .update({ image_url: encodeAchievementImages(next) })
      .eq("id", id);
    if (updateError) return { error: "حفظ الصور فشل" };

    const imagesError = await saveAchievementImageRows(id, urls, existing.length);
    if (imagesError) return { error: imagesError };

    refreshPublic();
    return { success: "تمت إضافة الصور" };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "حصل خطأ" };
  }
}

export async function updateAchievement(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!id) return { error: "الإنجاز غير موجود" };
  if (!title) return { error: "عنوان الإنجاز مطلوب" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("achievements")
    .update({ title, body })
    .eq("id", id);
  if (error) return { error: "تعديل الإنجاز فشل" };

  refreshPublic();
  return { success: "تم تعديل الإنجاز" };
}

export async function moveAchievement(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const direction = String(formData.get("direction") ?? "");
  if (!id || !["up", "down"].includes(direction)) return;

  const supabase = createAdminClient();
  const { data: rows } = await supabase
    .from("achievements")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  const list = rows ?? [];
  const index = list.findIndex((row) => row.id === id);
  if (index < 0) return;

  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= list.length) return;

  const next = [...list];
  const temp = next[index];
  next[index] = next[swapWith];
  next[swapWith] = temp;

  await Promise.all(
    next.map((row, order) =>
      supabase.from("achievements").update({ sort_order: order }).eq("id", row.id),
    ),
  );

  refreshPublic();
}

export async function deleteAchievement(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("achievements").delete().eq("id", id);
  refreshPublic();
}

export async function deleteAchievementImage(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const achievementId = String(formData.get("achievement_id") ?? "");
  const imageUrl = String(formData.get("image_url") ?? "");
  const supabase = createAdminClient();

  if (id && !id.includes(":")) {
    await supabase.from("achievement_images").delete().eq("id", id);
  }

  if (achievementId && imageUrl) {
    const { data: current } = await supabase
      .from("achievements")
      .select("image_url")
      .eq("id", achievementId)
      .maybeSingle();
    if (current) {
      const next = decodeAchievementImages(current.image_url).filter((url) => url !== imageUrl);
      await supabase
        .from("achievements")
        .update({ image_url: encodeAchievementImages(next) })
        .eq("id", achievementId);
    }
  }

  refreshPublic();
}
