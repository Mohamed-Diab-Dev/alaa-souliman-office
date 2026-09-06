import { createAdminClient } from "@/lib/supabase/admin";

export async function uploadPublicImage(file: File, folder: string) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.size > 6 * 1024 * 1024) {
    throw new Error("الصورة كبيرة أوي (الحد 6 ميجا)");
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const supabase = createAdminClient();
  const { error } = await supabase.storage.from("media").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) throw new Error("رفع الصورة فشل");

  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

export function filesFromForm(formData: FormData, field: string) {
  return formData
    .getAll(field)
    .filter((item): item is File => item instanceof File && item.size > 0);
}
