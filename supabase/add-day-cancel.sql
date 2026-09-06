-- نفّذ الملف ده مرة واحدة في Supabase SQL Editor
-- إلغاء يوم تواجد + رسالة للمواطن على الحجوزات

alter table office_dates
  add column if not exists is_cancelled boolean not null default false;

alter table office_dates
  add column if not exists cancel_message text not null default '';

alter table appointments
  add column if not exists admin_note text not null default '';
