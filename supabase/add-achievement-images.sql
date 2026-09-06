-- نفّذ الملف ده مرة واحدة في Supabase SQL Editor
-- لو الجدول موجود قبل كده، الأوامر دي مش هتكسر حاجة

alter table achievements alter column image_url set default '';

create table if not exists achievement_images (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table achievement_images enable row level security;

drop policy if exists "public_read_achievement_images" on achievement_images;
create policy "public_read_achievement_images" on achievement_images
  for select using (true);

insert into achievement_images (achievement_id, image_url, sort_order)
select id, image_url, 0
from achievements
where image_url <> ''
  and not exists (
    select 1 from achievement_images img where img.achievement_id = achievements.id
  );
