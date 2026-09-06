"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActionResult } from "@/lib/types";

function refresh() {
  revalidatePath("/admin/schedule");
  revalidatePath("/book");
}

function ymd(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function eachDate(start: string, end: string) {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);
  while (cursor <= last) {
    dates.push(ymd(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export async function addOfficeDates(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const officeId = String(formData.get("office_id") ?? "");
  const start = String(formData.get("start_date") ?? "");
  const end = String(formData.get("end_date") ?? start);
  const skipWeekend = formData.get("skip_weekend") === "on";

  if (!officeId || !start) return { error: "اختار المكتب وتاريخ البداية" };

  const dates = eachDate(start, end || start).filter((value) => {
    if (!skipWeekend) return true;
    const day = new Date(`${value}T00:00:00`).getDay();
    return day !== 5 && day !== 6;
  });

  if (dates.length === 0) return { error: "مفيش أيام تنفع في المدة دي" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("office_dates").upsert(
    dates.map((work_date) => ({ office_id: officeId, work_date })),
    { onConflict: "office_id,work_date", ignoreDuplicates: true },
  );

  if (error) return { error: "إضافة الأيام فشلت" };
  refresh();
  return { success: `تم إضافة ${dates.length} يوم` };
}

export async function deleteOfficeDate(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("office_dates").delete().eq("id", id);
  refresh();
}

export async function addTimeSlots(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const dateId = String(formData.get("office_date_id") ?? "");
  const start = String(formData.get("start_time") ?? "");
  const end = String(formData.get("end_time") ?? "");
  const interval = Number(formData.get("interval") ?? 30);
  const capacity = Number(formData.get("capacity") ?? 1);

  if (!dateId || !start) return { error: "اختار اليوم ووقت البداية" };

  const slots: Array<{ office_date_id: string; start_time: string; end_time: string | null; capacity: number }> = [];

  if (end && interval > 0) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let minutes = sh * 60 + sm;
    const last = eh * 60 + em;
    while (minutes < last) {
      const next = minutes + interval;
      const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mm = String(minutes % 60).padStart(2, "0");
      const nh = String(Math.floor(Math.min(next, last) / 60)).padStart(2, "0");
      const nm = String(Math.min(next, last) % 60).padStart(2, "0");
      slots.push({
        office_date_id: dateId,
        start_time: `${hh}:${mm}`,
        end_time: `${nh}:${nm}`,
        capacity: capacity > 0 ? capacity : 1,
      });
      minutes = next;
    }
  } else {
    slots.push({
      office_date_id: dateId,
      start_time: start,
      end_time: end || null,
      capacity: capacity > 0 ? capacity : 1,
    });
  }

  if (slots.length === 0) return { error: "مفيش مواعيد تتولد من الأوقات دي" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("time_slots").upsert(slots, {
    onConflict: "office_date_id,start_time",
    ignoreDuplicates: true,
  });
  if (error) return { error: "إضافة المواعيد فشلت" };

  refresh();
  return { success: `تم إضافة ${slots.length} ميعاد` };
}

export async function deleteTimeSlot(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  await supabase.from("time_slots").delete().eq("id", id);
  refresh();
}
