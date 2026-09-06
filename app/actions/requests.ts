"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

export async function createRequest(_formData: FormData): Promise<ActionResult> {
  return {
    error: "تقديم الطلب بقى من المكتب فقط. ادخل عشان تتابع حالة طلبك.",
  };
}

export async function signVoiceUrl(path: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase.storage
    .from("voices")
    .createSignedUrl(path, 60 * 30);
  if (error) return null;
  return data.signedUrl;
}
