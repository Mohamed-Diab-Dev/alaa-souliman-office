"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import {
  isValidNationalId,
  isValidPhone,
  normalizeNationalId,
  normalizePhone,
} from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function registerCitizen(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const nationalId = normalizeNationalId(String(formData.get("national_id") ?? ""));
  const address = String(formData.get("address") ?? "").trim();
  const rawPhones = String(formData.get("phones") ?? "")
    .split(/[\n,]+/)
    .map((item) => normalizePhone(item))
    .filter(Boolean);
  const phones = [...new Set(rawPhones)];

  if (!name) return { error: "الاسم مطلوب" };
  if (!isValidNationalId(nationalId)) {
    return { error: "الرقم القومي لازم 14 رقم صحيح" };
  }
  if (!address) return { error: "العنوان مطلوب" };
  if (phones.length === 0) return { error: "أدخل رقم تليفون واحد على الأقل" };
  if (phones.some((phone) => !isValidPhone(phone))) {
    return { error: "في رقم تليفون مكتوب غلط" };
  }

  const supabase = createAdminClient();
  const { data: citizen, error } = await supabase
    .from("citizens")
    .insert({
      name,
      national_id: nationalId,
      address,
    })
    .select("id")
    .single();

  if (error || !citizen) {
    if (error?.code === "23505") {
      return { error: "الرقم القومي مسجّل قبل كده" };
    }
    return { error: "فشل تسجيل المواطن" };
  }

  const { error: phoneError } = await supabase.from("citizen_phones").insert(
    phones.map((phone) => ({
      citizen_id: citizen.id,
      phone,
    })),
  );

  if (phoneError) {
    return { error: "المواطن اتسجل بس الأرقام فيها مشكلة" };
  }

  revalidatePath("/admin/citizens");
  return { success: "تم تسجيل المواطن بنجاح" };
}
