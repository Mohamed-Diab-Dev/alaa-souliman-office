"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { toEnglishDigits } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

function refresh() {
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/bookings");
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

function parseTimeToMinutes(value: string) {
  const cleaned = toEnglishDigits(value).trim();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

function minutesToTime(total: number) {
  const hours = String(Math.floor(total / 60)).padStart(2, "0");
  const minutes = String(total % 60).padStart(2, "0");
  return `${hours}:${minutes}`;
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

  if (!dateId) return { error: "اختار اليوم أولاً" };

  const startMinutes = parseTimeToMinutes(start);
  if (startMinutes === null) {
    return { error: "اختار وقت البداية. مثال: من 10:00" };
  }

  const slots: Array<{
    office_date_id: string;
    start_time: string;
    end_time: string | null;
    capacity: number;
  }> = [];
  const people = capacity > 0 ? capacity : 1;
  const step = interval > 0 ? interval : 30;

  if (end) {
    const endMinutes = parseTimeToMinutes(end);
    if (endMinutes === null) {
      return { error: "وقت النهاية مش مفهوم. مثال: إلى 14:00" };
    }
    if (endMinutes <= startMinutes) {
      return {
        error: "وقت النهاية لازم يكون بعد البداية. مثال: من 10:00 إلى 14:00",
      };
    }

    for (let minutes = startMinutes; minutes < endMinutes; minutes += step) {
      const next = Math.min(minutes + step, endMinutes);
      slots.push({
        office_date_id: dateId,
        start_time: minutesToTime(minutes),
        end_time: minutesToTime(next),
        capacity: people,
      });
    }
  } else {
    slots.push({
      office_date_id: dateId,
      start_time: minutesToTime(startMinutes),
      end_time: minutesToTime(startMinutes + step),
      capacity: people,
    });
  }

  if (slots.length === 0) {
    return { error: "مفيش مواعيد تتولد من الأوقات دي" };
  }

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
