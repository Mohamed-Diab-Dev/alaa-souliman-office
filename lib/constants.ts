export const SITE_DEFAULT_NAME = "مكتب النائب علاء سليمان";

export const REQUEST_CATEGORIES = [
  { id: "support", label: "معاش ودعم", hint: "معاش، تكافل، مساعدة" },
  { id: "complaint", label: "شكوى", hint: "مشكلة مع جهة أو خدمة" },
  { id: "papers", label: "أوراق حكومية", hint: "مستندات واستخراجات" },
  { id: "job", label: "تعيين أو عمل", hint: "وظيفة أو تزكية" },
  { id: "other", label: "طلب تاني", hint: "أي موضوع آخر" },
] as const;

export const REQUEST_STATUSES = [
  {
    id: "new",
    label: "طلب جديد",
    meaning: "طلبك وصل المكتب، ولسه بيتراجع.",
    tone: "amber",
  },
  {
    id: "reviewing",
    label: "قيد المراجعة",
    meaning: "المكتب بيراجع الطلب دلوقتي.",
    tone: "sky",
  },
  {
    id: "in_progress",
    label: "جاري التنفيذ",
    meaning: "المكتب شغال على طلبك.",
    tone: "violet",
  },
  {
    id: "resolved",
    label: "تم الحل",
    meaning: "الطلب خلص، وتم التعامل معاه.",
    tone: "emerald",
  },
  {
    id: "rejected",
    label: "مرفوض",
    meaning: "المكتب ما قدرش ينفّذ الطلب. شوف الرد تحت.",
    tone: "rose",
  },
] as const;

export const APPOINTMENT_STATUSES = [
  { id: "confirmed", label: "مؤكد" },
  { id: "cancelled", label: "ملغي" },
  { id: "completed", label: "تم الحضور" },
] as const;

export const CITIZEN_COOKIE = "citizen_session";
export const CITIZEN_SESSION_DAYS = 14;

export type RequestCategoryId = (typeof REQUEST_CATEGORIES)[number]["id"];
export type RequestStatusId = (typeof REQUEST_STATUSES)[number]["id"];
export type AppointmentStatusId = (typeof APPOINTMENT_STATUSES)[number]["id"];

export function categoryLabel(id: string) {
  return REQUEST_CATEGORIES.find((item) => item.id === id)?.label ?? "طلب";
}

export function statusMeta(id: string) {
  return (
    REQUEST_STATUSES.find((item) => item.id === id) ?? REQUEST_STATUSES[0]
  );
}
