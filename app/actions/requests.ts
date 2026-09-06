"use server";

import { revalidatePath } from "next/cache";
import { requireCitizen } from "@/lib/auth/citizen";
import { REQUEST_CATEGORIES } from "@/lib/constants";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function createRequest(formData: FormData): Promise<ActionResult> {
  const citizen = await requireCitizen();
  const category = String(formData.get("category") ?? "other");
  const notes = String(formData.get("notes") ?? "").trim();
  const voice = formData.get("voice");

  if (!REQUEST_CATEGORIES.some((item) => item.id === category)) {
    return { error: "اختار نوع الطلب" };
  }

  const supabase = createAdminClient();
  const { data: request, error } = await supabase
    .from("requests")
    .insert({
      citizen_id: citizen.id,
      category,
      notes,
    })
    .select("id")
    .single();

  if (error || !request) {
    return { error: "مقدرناش نسجّل الطلب دلوقتي" };
  }

  if (voice instanceof File && voice.size > 0) {
    if (voice.size > 8 * 1024 * 1024) {
      return { error: "التسجيل الصوتي كبير أوي" };
    }

    const ext = voice.name.endsWith(".m4a") ? "m4a" : "webm";
    const path = `${citizen.id}/${request.id}.${ext}`;
    const upload = await supabase.storage.from("voices").upload(path, voice, {
      contentType: voice.type || "audio/webm",
      upsert: true,
    });

    if (upload.error) {
      return { error: "الطلب اتسجّل بس رفع الصوت فشل. كلم المكتب لو حابب تضيفه." };
    }

    await supabase
      .from("requests")
      .update({ voice_url: path })
      .eq("id", request.id);
  } else if (!notes) {
    await supabase.from("requests").delete().eq("id", request.id);
    return { error: "احكي طلبك بصوتك أو اكتب كلمة بمساعدة حد" };
  }

  revalidatePath("/requests");
  return { success: "تم تسجيل طلبك، وهيتابع معاك المكتب" };
}

export async function signVoiceUrl(path: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("voices")
    .createSignedUrl(path, 60 * 30);
  if (error) return null;
  return data.signedUrl;
}
