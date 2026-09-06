"use server";

import { revalidatePath } from "next/cache";
import { requireCitizen } from "@/lib/auth/citizen";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

function bookingError(message: string) {
  if (message.includes("SLOT_FULL")) return "الميعاد ده اتحجز، اختار ميعاد تاني";
  if (message.includes("ALREADY_BOOKED")) return "عندك معاد قائم بالفعل";
  if (message.includes("SLOT_IN_PAST")) return "الميعاد ده عدّى";
  if (message.includes("SLOT_NOT_FOUND")) return "الميعاد مش موجود";
  return "مقدرناش نحجز الميعاد دلوقتي";
}

export async function bookAppointment(formData: FormData): Promise<ActionResult> {
  const citizen = await requireCitizen();
  const slotId = String(formData.get("slot_id") ?? "");

  if (!slotId) return { error: "اختار ميعاد أولاً" };

  const supabase = createAdminClient();
  const { error } = await supabase.rpc("book_slot", {
    p_citizen: citizen.id,
    p_slot: slotId,
  });

  if (error) return { error: bookingError(error.message ?? "") };

  revalidatePath("/book");
  revalidatePath("/requests");
  return { success: "تم حجز معادك. خلّي الرسالة دي ظاهرة وأنت داخل المكتب." };
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
