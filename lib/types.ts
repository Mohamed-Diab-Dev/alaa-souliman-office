import type { AppointmentStatusId, RequestStatusId } from "@/lib/constants";

export type ActionResult = {
  error?: string;
  success?: string;
};

export type CitizenSession = {
  id: string;
  name: string;
  nationalId: string;
};

export type LandingSlide = {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  sort_order: number;
  is_active: boolean;
};

export type AboutSection = {
  heading: string;
  body: string;
  image_url: string;
};

export type AchievementImage = {
  id: string;
  image_url: string;
  sort_order: number;
};

export type Achievement = {
  id: string;
  image_url: string;
  title: string;
  body: string;
  sort_order: number;
  images: AchievementImage[];
};

export type Office = {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
};

export type TimeSlotView = {
  id: string;
  start_time: string;
  end_time: string | null;
  remaining: number;
};

export type OfficeDateView = {
  id: string;
  work_date: string;
  slots: TimeSlotView[];
};

export type BookableOffice = Office & {
  dates: OfficeDateView[];
};

export type CitizenRequest = {
  id: string;
  request_number: number;
  category: string;
  voice_url: string | null;
  notes: string;
  status: RequestStatusId;
  admin_reply: string;
  created_at: string;
  signed_voice_url?: string | null;
};

export type CitizenAppointment = {
  id: string;
  status: AppointmentStatusId;
  created_at: string;
  start_time: string;
  end_time: string | null;
  work_date: string;
  office_name: string;
  office_address: string;
  admin_note: string;
};
