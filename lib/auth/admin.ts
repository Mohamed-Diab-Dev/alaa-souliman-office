import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getAdminUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const admin = createAdminClient();
    const { data } = await admin
      .from("admin_users")
      .select("id, name, auth_user_id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!data) return null;
    return { ...data, email: user.email ?? "" };
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminUser();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function adminCount() {
  const admin = createAdminClient();
  const { count, error } = await admin
    .from("admin_users")
    .select("id", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}
