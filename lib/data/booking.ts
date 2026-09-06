import { cairoToday } from "@/lib/utils";
import { createAdminClient } from "@/lib/supabase/admin";
import type { BookableOffice, CitizenAppointment } from "@/lib/types";

export async function getBookableOffices(): Promise<BookableOffice[]> {
  const supabase = createAdminClient();
  const today = cairoToday();

  const { data: offices, error } = await supabase
    .from("offices")
    .select("id, name, address, is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error || !offices) return [];

  const officeIds = offices.map((office) => office.id);
  if (officeIds.length === 0) return [];

  const { data: dates } = await supabase
    .from("office_dates")
    .select("id, office_id, work_date")
    .in("office_id", officeIds)
    .gte("work_date", today)
    .order("work_date", { ascending: true });

  const dateRows = dates ?? [];
  const dateIds = dateRows.map((row) => row.id);

  const { data: slots } = dateIds.length
    ? await supabase
        .from("time_slots")
        .select("id, office_date_id, start_time, end_time, capacity")
        .in("office_date_id", dateIds)
        .order("start_time", { ascending: true })
    : { data: [] };

  const slotRows = slots ?? [];
  const slotIds = slotRows.map((slot) => slot.id);

  const { data: bookings } = slotIds.length
    ? await supabase
        .from("appointments")
        .select("time_slot_id")
        .in("time_slot_id", slotIds)
        .eq("status", "confirmed")
    : { data: [] };

  const used = new Map<string, number>();
  for (const booking of bookings ?? []) {
    used.set(booking.time_slot_id, (used.get(booking.time_slot_id) ?? 0) + 1);
  }

  return offices
    .map((office) => {
      const officeDates = dateRows
        .filter((date) => date.office_id === office.id)
        .map((date) => ({
          id: date.id,
          work_date: date.work_date,
          slots: slotRows
            .filter((slot) => slot.office_date_id === date.id)
            .map((slot) => ({
              id: slot.id,
              start_time: slot.start_time,
              end_time: slot.end_time,
              remaining: slot.capacity - (used.get(slot.id) ?? 0),
            }))
            .filter((slot) => slot.remaining > 0),
        }))
        .filter((date) => date.slots.length > 0);

      return { ...office, dates: officeDates };
    })
    .filter((office) => office.dates.length > 0);
}

export async function getCitizenAppointments(citizenId: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("appointments")
    .select(
      `
      id,
      status,
      created_at,
      time_slots (
        start_time,
        end_time,
        office_dates (
          work_date,
          offices (
            name,
            address
          )
        )
      )
    `,
    )
    .eq("citizen_id", citizenId)
    .order("created_at", { ascending: false });

  if (error || !data) return [] as CitizenAppointment[];

  return data.map((row) => {
    const slot = Array.isArray(row.time_slots) ? row.time_slots[0] : row.time_slots;
    const date = slot?.office_dates
      ? Array.isArray(slot.office_dates)
        ? slot.office_dates[0]
        : slot.office_dates
      : null;
    const office = date?.offices
      ? Array.isArray(date.offices)
        ? date.offices[0]
        : date.offices
      : null;

    return {
      id: row.id,
      status: row.status,
      created_at: row.created_at,
      start_time: slot?.start_time ?? "",
      end_time: slot?.end_time ?? null,
      work_date: date?.work_date ?? "",
      office_name: office?.name ?? "مكتب",
      office_address: office?.address ?? "",
    } as CitizenAppointment;
  });
}
