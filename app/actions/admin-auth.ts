"use server";

import { redirect } from "next/navigation";
import { adminCount } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/types";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function bootstrapAdmin(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const count = await adminCount();
  if (count > 0) return { error: "حساب الأدمن موجود بالفعل" };

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "اكتب اسم المدير" };
  if (!validEmail(email)) return { error: "البريد الإلكتروني غير صحيح" };
  if (password.length < 8) return { error: "كلمة السر لازم 8 حروف على الأقل" };

  const admin = createAdminClient();
  const created = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (created.error || !created.data.user) {
    return { error: created.error?.message ?? "فشل إنشاء الحساب" };
  }

  const inserted = await admin.from("admin_users").insert({
    auth_user_id: created.data.user.id,
    name,
  });

  if (inserted.error) {
    return { error: "الحساب اتعمل بس التسجيل في الجدول فشل" };
  }

  const supabase = await createSupabaseServerClient();
  const signed = await supabase.auth.signInWithPassword({ email, password });
  if (signed.error) return { error: "الحساب جاهز، جرّب تسجّل دخول" };

  redirect("/admin");
}

export async function loginAdmin(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!validEmail(email) || !password) {
    return { error: "اكتب البريد وكلمة السر" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) return { error: "بيانات الدخول غير صحيحة" };

  const admin = createAdminClient();
  const { data: row } = await admin
    .from("admin_users")
    .select("id")
    .eq("auth_user_id", data.user.id)
    .maybeSingle();

  if (!row) {
    await supabase.auth.signOut();
    return { error: "الحساب ده مش أدمن" };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}
