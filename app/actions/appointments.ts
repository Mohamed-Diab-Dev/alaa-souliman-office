"use server";

import { revalidatePath } from "next/cache";
import { getCitizenSession, requireCitizen } from "@/lib/auth/citizen";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  guestNationalIdFromPhone,
  isValidPhone,
  normalizePhone,
} from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

function bookingError(message: string) {
  if (message.includes("SLOT_FULL")) return "الميعاد ده اتحجز، اختار ميعاد تاني";
  if (message.includes("ALREADY_BOOKED")) return "عندك معاد قائم بالفعل";
  if (message.includes("SLOT_IN_PAST")) return "الميعاد ده عدّى";
  if (message.includes("SLOT_NOT_FOUND")) return "الميعاد مش موجود";
  return "مقدرناش نحجز الميعاد دلوقتي";
}

async function resolveGuestCitizen(name: string, phone: string) {
  const supabase = createAdminClient();
  const { data: phoneRow } = await supabase
    .from("citizen_phones")
    .select("citizen_id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle();

  if (phoneRow?.citizen_id) {
    await supabase.from("citizens").update({ name }).eq("id", phoneRow.citizen_id);
    return phoneRow.citizen_id as string;
  }

  const nationalId = guestNationalIdFromPhone(phone);
  if (!nationalId) throw new Error("PHONE_INVALID");

  const { data: existingGuest } = await supabase
    .from("citizens")
    .select("id")
    .eq("national_id", nationalId)
    .maybeSingle();

  if (existingGuest) {
    await supabase.from("citizens").update({ name }).eq("id", existingGuest.id);
    await supabase.from("citizen_phones").upsert(
      { citizen_id: existingGuest.id, phone },
      { onConflict: "citizen_id,phone", ignoreDuplicates: true },
    );
    return existingGuest.id as string;
  }

  const { data: created, error } = await supabase
    .from("citizens")
    .insert({
      name,
      national_id: nationalId,
      address: "حجز من الموقع بدون تسجيل",
    })
    .select("id")
    .single();

  if (error || !created) throw new Error("CITIZEN_CREATE_FAILED");

  const { error: phoneError } = await supabase.from("citizen_phones").insert({
    citizen_id: created.id,
    phone,
  });
  if (phoneError) throw new Error("PHONE_CREATE_FAILED");

  return created.id as string;
}

export async function bookAppointment(formData: FormData): Promise<ActionResult> {
  const slotId = String(formData.get("slot_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phoneRaw = String(formData.get("phone") ?? "");
  const phone = normalizePhone(phoneRaw);

  if (!slotId) return { error: "اختار ميعاد أولاً" };

  const session = await getCitizenSession();
  let citizenId = session?.id ?? "";

  if (!citizenId) {
    if (name.length < 3) return { error: "اكتب الاسم الثلاثي على الأقل" };
    if (!isValidPhone(phoneRaw)) return { error: "رقم التليفون غير صحيح" };
    try {
      citizenId = await resolveGuestCitizen(name, phone);
    } catch {
      return { error: "مقدرناش نسجّل بيانات الحجز، حاول تاني" };
    }
  }

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("book_slot", {
    p_citizen: citizenId,
    p_slot: slotId,
  });

  if (error) return { error: bookingError(error.message ?? "") };

  revalidatePath("/book");
  revalidatePath("/requests");
  revalidatePath("/admin/bookings");
  return {
    success: session
      ? "تم حجز معادك. خلّي الرسالة دي ظاهرة وأنت داخل المكتب."
      : "تم حجز معادك بالاسم والتليفون. احتفظ برقم التليفون ده لو احتجت تراجع مع المكتب.",
  };
}

export async function cancelAppointment(formData: FormData) {
  const citizen = await requireCitizen();
  const appointmentId = String(formData.get("appointment_id") ?? "");
  if (!appointmentId) return;

  const supabase = createAdminClient();
  await supabase
    .from("appointments")
    .update({ status: "cancelled" })
    .eq("id", appointmentId)
    .eq("citizen_id", citizen.id)
    .eq("status", "confirmed");

  revalidatePath("/book");
  revalidatePath("/requests");
}
