"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { REQUEST_STATUSES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function updateRequestStatus(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const adminReply = String(formData.get("admin_reply") ?? "").trim();

  if (!REQUEST_STATUSES.some((item) => item.id === status)) {
    return { error: "حالة غير صحيحة" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("requests")
    .update({ status, admin_reply: adminReply })
    .eq("id", id);

  if (error) return { error: "تحديث الطلب فشل" };
  revalidatePath("/admin/requests");
  return { success: "تم تحديث حالة الطلب" };
}

export async function updateAppointmentStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["confirmed", "cancelled", "completed"].includes(status)) return;

  const supabase = createAdminClient();
  await supabase.from("appointments").update({ status }).eq("id", id);
  revalidatePath("/admin");
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/bookings");
}
