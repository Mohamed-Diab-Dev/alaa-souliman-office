"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function saveOffice(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const isActive = formData.get("is_active") === "on";

  if (!name) return { error: "اسم المكتب مطلوب" };

  const supabase = createAdminClient();
  const payload = { name, address, is_active: isActive };

  const { error } = id
    ? await supabase.from("offices").update(payload).eq("id", id)
    : await supabase.from("offices").insert(payload);

  if (error) return { error: "حفظ المكتب فشل" };
  revalidatePath("/admin/offices");
  revalidatePath("/admin/schedule");
  return { success: "تم حفظ المكتب" };
}

export async function deleteOffice(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("offices").delete().eq("id", id);
  revalidatePath("/admin/offices");
  revalidatePath("/admin/schedule");
}
