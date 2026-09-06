"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { toEnglishDigits, formatArabicDate } from "@/lib/utils";
import type { ActionResult } from "@/lib/types";

function refresh() {
  revalidatePath("/admin/schedule");
  revalidatePath("/admin/bookings");
  revalidatePath("/book");
  revalidatePath("/requests");
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

function normalizeTime(value: string) {
  return String(value).slice(0, 5);
}

export async function cancelOfficeDay(
  _prev: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  await requireAdmin();
  const dayId = String(formData.get("office_date_id") ?? "");
  const bookingAction = String(formData.get("booking_action") ?? "cancel");
  const targetDayId = String(formData.get("target_office_date_id") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!dayId) return { error: "اختار اليوم اللي هيتلغى" };
  if (!message) return { error: "اكتب رسالة للمواطنين" };
  if (!["cancel", "move"].includes(bookingAction)) {
    return { error: "اختار إيه يحصل للحجوزات" };
  }
  if (bookingAction === "move" && !targetDayId) {
    return { error: "اختار اليوم الجديد لترحيل الحجوزات" };
  }
  if (bookingAction === "move" && targetDayId === dayId) {
    return { error: "يوم الترحيل لازم يكون يوم تاني" };
  }

  const supabase = createAdminClient();
  const { data: sourceDay, error: sourceError } = await supabase
    .from("office_dates")
    .select("id, office_id, work_date, is_cancelled")
    .eq("id", dayId)
    .maybeSingle();

  if (sourceError) {
    return {
      error:
        "عمود إلغاء اليوم مش موجود. نفّذ ملف supabase/add-day-cancel.sql في Supabase أولاً.",
    };
  }
  if (!sourceDay) return { error: "اليوم مش موجود" };
  if (sourceDay.is_cancelled) return { error: "اليوم ده متلغي قبل كده" };

  const { data: sourceSlots } = await supabase
    .from("time_slots")
    .select("id, start_time, capacity")
    .eq("office_date_id", dayId);

  const slots = sourceSlots ?? [];
  const slotIds = slots.map((slot) => slot.id);

  const { data: appointments } = slotIds.length
    ? await supabase
        .from("appointments")
        .select("id, time_slot_id, status")
        .in("time_slot_id", slotIds)
        .eq("status", "confirmed")
    : { data: [] };

  const confirmed = appointments ?? [];
  let cancelledCount = 0;
  let movedCount = 0;
  let failedMove = 0;

  if (bookingAction === "cancel") {
    if (confirmed.length > 0) {
      const { error } = await supabase
        .from("appointments")
        .update({ status: "cancelled", admin_note: message })
        .in(
          "id",
          confirmed.map((item) => item.id),
        );
      if (error) {
        return {
          error:
            "إلغاء الحجوزات فشل. تأكد إنك نفّذت ملف supabase/add-day-cancel.sql",
        };
      }
      cancelledCount = confirmed.length;
    }
  } else {
    const { data: targetDay } = await supabase
      .from("office_dates")
      .select("id, office_id, work_date, is_cancelled")
      .eq("id", targetDayId)
      .maybeSingle();

    if (!targetDay || targetDay.is_cancelled) {
      return { error: "يوم الترحيل مش متاح" };
    }
    if (targetDay.office_id !== sourceDay.office_id) {
      return { error: "الترحيل لازم يكون لنفس المكتب" };
    }

    const { data: targetSlots } = await supabase
      .from("time_slots")
      .select("id, start_time, capacity")
      .eq("office_date_id", targetDayId);

    if (!targetSlots || targetSlots.length === 0) {
      return {
        error:
          "اليوم الجديد مفيهوش مواعيد خالص. ولّد مواعيد عليه الأول أو اختار يوم تاني.",
      };
    }

    const targetByTime = new Map(
      targetSlots.map((slot) => [normalizeTime(slot.start_time), slot]),
    );
    const sourceById = new Map(slots.map((slot) => [slot.id, slot]));

    const targetSlotIds = targetSlots.map((slot) => slot.id);
    const { data: targetBookings } = targetSlotIds.length
      ? await supabase
          .from("appointments")
          .select("time_slot_id")
          .in("time_slot_id", targetSlotIds)
          .eq("status", "confirmed")
      : { data: [] };

    const used = new Map<string, number>();
    for (const booking of targetBookings ?? []) {
      used.set(booking.time_slot_id, (used.get(booking.time_slot_id) ?? 0) + 1);
    }

    for (const appointment of confirmed) {
      const sourceSlot = sourceById.get(appointment.time_slot_id);
      const targetSlot = sourceSlot
        ? targetByTime.get(normalizeTime(sourceSlot.start_time))
        : undefined;
      const remaining = targetSlot
        ? targetSlot.capacity - (used.get(targetSlot.id) ?? 0)
        : 0;

      if (targetSlot && remaining > 0) {
        const note = `${message}\nتم ترحيل معادك لنفس الساعة يوم ${formatArabicDate(targetDay.work_date)}.`;
        const { error } = await supabase
          .from("appointments")
          .update({ time_slot_id: targetSlot.id, admin_note: note })
          .eq("id", appointment.id);
        if (error) {
          failedMove += 1;
          continue;
        }
        used.set(targetSlot.id, (used.get(targetSlot.id) ?? 0) + 1);
        movedCount += 1;
      } else {
        const note = `${message}\nمقدرناش نرحّل معادك لنفس الساعة، فالميعاد اتلغى. تواصل مع المكتب أو احجز من جديد.`;
        const { error } = await supabase
          .from("appointments")
          .update({ status: "cancelled", admin_note: note })
          .eq("id", appointment.id);
        if (!error) cancelledCount += 1;
        else failedMove += 1;
      }
    }
  }

  const { error: dayError } = await supabase
    .from("office_dates")
    .update({ is_cancelled: true, cancel_message: message })
    .eq("id", dayId);

  if (dayError) {
    return {
      error:
        "الحجوزات اتعدلت بس تعليم اليوم كملغي فشل. نفّذ supabase/add-day-cancel.sql",
    };
  }

  refresh();

  if (bookingAction === "cancel") {
    return {
      success:
        confirmed.length === 0
          ? "تم إلغاء اليوم. مكانش فيه حجوزات مؤكدة."
          : `تم إلغاء اليوم وإلغاء ${cancelledCount} حجز، والرسالة وصلت للمواطنين.`,
    };
  }

  return {
    success: `تم إلغاء اليوم. اترحّل ${movedCount} حجز، واتلغى ${cancelledCount}${
      failedMove ? `، وفشل ${failedMove}` : ""
    }.`,
  };
}

