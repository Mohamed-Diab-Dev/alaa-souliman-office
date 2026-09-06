-- نفّذ الملف ده مرة واحدة في Supabase SQL Editor
-- تحكم في الجزء الظاهر من صورة السلايدر

alter table landing_slides
  add column if not exists focus_x int not null default 50
  check (focus_x >= 0 and focus_x <= 100);

alter table landing_slides
  add column if not exists focus_y int not null default 50
  check (focus_y >= 0 and focus_y <= 100);
