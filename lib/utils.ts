export function toEnglishDigits(value: string) {
  return value
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
}

export function normalizeNationalId(value: string) {
  return toEnglishDigits(value).replace(/\D/g, "").slice(0, 14);
}

export function isValidNationalId(value: string) {
  const id = normalizeNationalId(value);
  if (!/^[23]\d{13}$/.test(id)) return false;

  const century = id[0] === "2" ? 1900 : 2000;
  const year = century + Number(id.slice(1, 3));
  const month = Number(id.slice(3, 5));
  const day = Number(id.slice(5, 7));
  const date = new Date(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function normalizePhone(value: string) {
  const digits = toEnglishDigits(value).replace(/\D/g, "");
  let rest = digits;
  if (rest.startsWith("20")) rest = rest.slice(2);
  if (rest.startsWith("0")) rest = rest.slice(1);
  if (rest.length === 10 && rest.startsWith("1")) return `0${rest}`;
  return "";
}

export function isValidPhone(value: string) {
  return /^01[0125]\d{8}$/.test(normalizePhone(value));
}

/** رقم قومي شكلي لحجز الزائر — مش ينفع يدخل بيه (مش بيبدأ بـ 2 أو 3) */
export function guestNationalIdFromPhone(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized || normalized.length !== 11) return "";
  return `9000${normalized.slice(1)}`;
}

export function cairoToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
}

export function formatArabicDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(`${value}T00:00:00`) : value;
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Cairo",
  }).format(date);
}

export function formatArabicTime(value: string) {
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return new Intl.DateTimeFormat("ar-EG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Cairo",
  }).format(date);
}

export function formatArabicDateTime(value: string) {
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Cairo",
  }).format(new Date(value));
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
