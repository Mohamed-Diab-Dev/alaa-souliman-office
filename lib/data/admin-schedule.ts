import { createAdminClient } from "@/lib/supabase/admin";

export type AdminBooking = {
  id: string;
  status: string;
  citizenName: string;
  nationalId: string;
  phones: string[];
};

export type AdminSlot = {
  id: string;
  start_time: string;
  end_time: string | null;
  capacity: number;
  bookings: AdminBooking[];
};

export type AdminOfficeDay = {
  id: string;
  office_id: string;
  work_date: string;
  slots: AdminSlot[];
};

export async function getAdminScheduleBoard() {
  const supabase = createAdminClient();
  const { data: offices } = await supabase
    .from("offices")
    .select("id, name, address, is_active")
    .order("created_at", { ascending: true });

  const officeRows = offices ?? [];
  const officeIds = officeRows.map((office) => office.id);
  if (officeIds.length === 0) {
    return { offices: officeRows, days: [] as AdminOfficeDay[] };
  }

  const { data: dates } = await supabase
    .from("office_dates")
    .select("id, office_id, work_date, time_slots(id, start_time, end_time, capacity)")
    .in("office_id", officeIds)
    .order("work_date", { ascending: true });

  const dateRows = dates ?? [];
  const slotIds = dateRows.flatMap((date) =>
    (date.time_slots ?? []).map((slot) => slot.id),
  );

  const { data: appointments } = slotIds.length
    ? await supabase
        .from("appointments")
        .select(
          "id, status, time_slot_id, citizens(name, national_id, citizen_phones(phone))",
        )
        .in("time_slot_id", slotIds)
        .order("created_at", { ascending: true })
    : { data: [] };

  const bookingsBySlot = new Map<string, AdminBooking[]>();
  for (const row of appointments ?? []) {
    const citizen = Array.isArray(row.citizens) ? row.citizens[0] : row.citizens;
    const phones = (citizen?.citizen_phones ?? []).map((item: { phone: string }) => item.phone);
    const list = bookingsBySlot.get(row.time_slot_id) ?? [];
    list.push({
      id: row.id,
      status: row.status,
      citizenName: citizen?.name ?? "مواطن",
      nationalId: citizen?.national_id ?? "",
      phones,
    });
    bookingsBySlot.set(row.time_slot_id, list);
  }

  const days: AdminOfficeDay[] = dateRows.map((date) => ({
    id: date.id,
    office_id: date.office_id,
    work_date: date.work_date,
    slots: (date.time_slots ?? [])
      .slice()
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .map((slot) => ({
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        capacity: slot.capacity,
        bookings: bookingsBySlot.get(slot.id) ?? [],
      })),
  }));

  return { offices: officeRows, days };
}
