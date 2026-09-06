"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { REQUEST_CATEGORIES, REQUEST_STATUSES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import { isValidNationalId, normalizeNationalId } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

export type CitizenLookup = {
  id: string;
  name: string;
  nationalId: string;
  address: string;
  phones: string[];
};

export async function lookupCitizenByNationalId(
  nationalIdRaw: string,
): Promise<{ citizen?: CitizenLookup; error?: string }> {
  await requireAdmin();
  const nationalId = normalizeNationalId(nationalIdRaw);
  if (!isValidNationalId(nationalId)) {
    return { error: "الرقم القومي لازم يكون 14 رقم صحيح" };
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("citizens")
    .select("id, name, national_id, address, citizen_phones(phone)")
    .eq("national_id", nationalId)
    .maybeSingle();

  if (error) return { error: "البحث فشل، حاول تاني" };
  if (!data) {
    return {
      error: "مفيش مواطن مسجّل بالرقم القومي ده. سجّله من صفحة المواطنين أولاً.",
    };
  }

  return {
    citizen: {
      id: data.id,
      name: data.name,
      nationalId: data.national_id,
      address: data.address,
      phones: (data.citizen_phones ?? []).map((item: { phone: string }) => item.phone),
    },
  };
}

export async function createAdminRequest(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const citizenId = String(formData.get("citizen_id") ?? "");
  const category = String(formData.get("category") ?? "other");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!citizenId) return { error: "ابحث عن المواطن بالرقم القومي أولاً" };
  if (!REQUEST_CATEGORIES.some((item) => item.id === category)) {
    return { error: "اختار نوع الطلب" };
  }
  if (!notes) return { error: "اكتب نص الطلب" };

  const supabase = createAdminClient();
  const { data: citizen } = await supabase
    .from("citizens")
    .select("id")
    .eq("id", citizenId)
    .maybeSingle();
  if (!citizen) return { error: "المواطن غير موجود" };

  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      citizen_id: citizenId,
      category,
      notes,
      status: "new",
    })
    .select("id, request_number")
    .single();

  if (error || !request) return { error: "تسجيل الطلب فشل" };

  revalidatePath("/admin/requests");
  revalidatePath("/admin/requests/new");
  revalidatePath("/requests");
  return {
    success: `تم تسجيل الطلب رقم ${request.request_number}. المواطن هيشوفه لما يدخل بحسابه.`,
  };
}

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
  revalidatePath("/requests");
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
