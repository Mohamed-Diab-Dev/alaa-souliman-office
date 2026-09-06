"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function saveSettings(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const siteName = String(formData.get("site_name") ?? "").trim();
  const bookingMessage = String(formData.get("booking_closed_message") ?? "").trim();

  if (!siteName) return { error: "اسم الموقع مطلوب" };
  if (!bookingMessage) return { error: "رسالة إغلاق المواعيد مطلوبة" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("site_settings").upsert([
    { key: "site_name", value: siteName },
    { key: "booking_closed_message", value: bookingMessage },
  ]);

  if (error) return { error: "حفظ الإعدادات فشل" };

  revalidateTag("public-content", "max");
  revalidatePath("/");
  revalidatePath("/book");
  revalidatePath("/admin/settings");
  return { success: "تم حفظ الإعدادات" };
}
