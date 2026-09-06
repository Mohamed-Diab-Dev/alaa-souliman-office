"use server";

import { redirect } from "next/navigation";
import {
  clearCitizenCookie,
  setCitizenCookie,
} from "@/lib/auth/citizen";
import {
  isValidNationalId,
  isValidPhone,
  normalizeNationalId,
  normalizePhone,
} from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function loginCitizen(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const nationalId = normalizeNationalId(String(formData.get("national_id") ?? ""));
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const next = String(formData.get("next") ?? "/requests");

  if (!isValidNationalId(nationalId)) {
    return { error: "الرقم القومي لازم يكون 14 رقم صحيح" };
  }
  if (!isValidPhone(phone)) {
    return { error: "رقم التليفون غير صحيح" };
  }

  const supabase = createAdminClient();
  const { data: citizen, error } = await supabase
    .from("citizens")
    .select("id, name, national_id")
    .eq("national_id", nationalId)
    .maybeSingle();

  if (error) return { error: "حصل خطأ أثناء الدخول، حاول تاني" };
  if (!citizen) {
    return { error: "البيانات دي مش مسجّلة. لازم المكتب يسجّلك أولاً." };
  }

  const { data: match } = await supabase
    .from("citizen_phones")
    .select("id")
    .eq("citizen_id", citizen.id)
    .eq("phone", phone)
    .maybeSingle();

  if (!match) {
    return { error: "رقم التليفون مش مطابق للرقم القومي ده" };
  }

  await setCitizenCookie({
    id: citizen.id,
    name: citizen.name,
    nationalId: citizen.national_id,
  });

  redirect(next.startsWith("/") ? next : "/requests");
}

export async function logoutCitizen() {
  await clearCitizenCookie();
  redirect("/");
}
