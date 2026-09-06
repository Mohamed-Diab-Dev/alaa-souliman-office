-- مكتب النائب علاء سليمان
-- نفّذ الملف ده في Supabase → SQL Editor مرة واحدة بعد إنشاء المشروع.
-- بعد ما تخلّص: اعمل أول حساب أدمن من /admin/login

create extension if not exists "pgcrypto";

create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users (id) on delete cascade,
  name text not null default 'مدير النظام',
  created_at timestamptz not null default now()
);

create table if not exists citizens (
  id uuid primary key default gen_random_uuid(),
  national_id char(14) unique not null,
  name text not null,
  address text not null,
  created_at timestamptz not null default now()
);

create index if not exists citizens_national_id_idx on citizens (national_id);
create index if not exists citizens_created_at_idx on citizens (created_at desc);

create table if not exists citizen_phones (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references citizens (id) on delete cascade,
  phone text not null,
  unique (citizen_id, phone)
);

create index if not exists citizen_phones_phone_idx on citizen_phones (phone);

create table if not exists landing_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  title text not null default '',
  subtitle text not null default '',
  focus_x int not null default 50 check (focus_x >= 0 and focus_x <= 100),
  focus_y int not null default 50 check (focus_y >= 0 and focus_y <= 100),
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists about_section (
  id int primary key default 1 check (id = 1),
  heading text not null default 'النبذة التعريفية',
  body text not null default '',
  image_url text not null default ''
);

insert into about_section (id, heading, body)
values (
  1,
  'النبذة التعريفية',
  'مكتب خدمة المواطنين للنائب علاء سليمان. نستقبل طلبات الأهالي ونتابعها حتى يتم حلها، ونفتح أبواب المكاتب للمقابلات حسب الجدول المعلن.'
)
on conflict (id) do nothing;

create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  image_url text not null default '',
  title text not null,
  body text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists achievement_images (
  id uuid primary key default gen_random_uuid(),
  achievement_id uuid not null references achievements (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists offices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists office_dates (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references offices (id) on delete cascade,
  work_date date not null,
  is_cancelled boolean not null default false,
  cancel_message text not null default '',
  unique (office_id, work_date)
);

create index if not exists office_dates_date_idx on office_dates (work_date);

create table if not exists time_slots (
  id uuid primary key default gen_random_uuid(),
  office_date_id uuid not null references office_dates (id) on delete cascade,
  start_time time not null,
  end_time time,
  capacity int not null default 1 check (capacity > 0),
  unique (office_date_id, start_time)
);

create sequence if not exists request_number_seq start 1001;

create table if not exists requests (
  id uuid primary key default gen_random_uuid(),
  request_number int unique not null default nextval('request_number_seq'),
  citizen_id uuid not null references citizens (id) on delete cascade,
  category text not null default 'other',
  voice_url text,
  notes text not null default '',
  status text not null default 'new' check (status in ('new', 'reviewing', 'in_progress', 'resolved', 'rejected')),
  admin_reply text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists requests_citizen_idx on requests (citizen_id, created_at desc);
create index if not exists requests_status_idx on requests (status);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  citizen_id uuid not null references citizens (id) on delete cascade,
  time_slot_id uuid not null references time_slots (id) on delete cascade,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  admin_note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists appointments_citizen_idx on appointments (citizen_id, created_at desc);
create index if not exists appointments_slot_idx on appointments (time_slot_id);

create table if not exists site_settings (
  key text primary key,
  value text not null default ''
);

insert into site_settings (key, value) values
  ('site_name', 'مكتب النائب علاء سليمان'),
  ('booking_closed_message', 'لا توجد مواعيد متاحة حالياً. النائب في مهمة رسمية، تابعونا قريباً لإعلان الجدول الجديد.')
on conflict (key) do nothing;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists requests_set_updated_at on requests;
create trigger requests_set_updated_at
before update on requests
for each row execute function set_updated_at();

create or replace function book_slot(p_citizen uuid, p_slot uuid)
returns uuid
language plpgsql
as $$
declare
  v_id uuid;
  v_cap int;
  v_used int;
  v_date date;
  v_today date;
begin
  v_today := (timezone('Africa/Cairo', now()))::date;

  select ts.capacity, od.work_date
    into v_cap, v_date
  from time_slots ts
  join office_dates od on od.id = ts.office_date_id
  where ts.id = p_slot
  for update of ts;

  if v_cap is null then
    raise exception 'SLOT_NOT_FOUND';
  end if;

  if v_date < v_today then
    raise exception 'SLOT_IN_PAST';
  end if;

  if exists (
    select 1
    from appointments a
    join time_slots ts on ts.id = a.time_slot_id
    join office_dates od on od.id = ts.office_date_id
    where a.citizen_id = p_citizen
      and a.status = 'confirmed'
      and od.work_date >= v_today
  ) then
    raise exception 'ALREADY_BOOKED';
  end if;

  select count(*) into v_used
  from appointments
  where time_slot_id = p_slot and status = 'confirmed';

  if v_used >= v_cap then
    raise exception 'SLOT_FULL';
  end if;

  insert into appointments (citizen_id, time_slot_id)
  values (p_citizen, p_slot)
  returning id into v_id;

  return v_id;
end;
$$;

alter table admin_users enable row level security;
alter table citizens enable row level security;
alter table citizen_phones enable row level security;
alter table landing_slides enable row level security;
alter table about_section enable row level security;
alter table achievements enable row level security;
alter table achievement_images enable row level security;
alter table offices enable row level security;
alter table office_dates enable row level security;
alter table time_slots enable row level security;
alter table requests enable row level security;
alter table appointments enable row level security;
alter table site_settings enable row level security;

create policy "public_read_slides" on landing_slides
  for select using (is_active = true);

create policy "public_read_about" on about_section
  for select using (true);

create policy "public_read_achievements" on achievements
  for select using (true);

create policy "public_read_achievement_images" on achievement_images
  for select using (true);

create policy "public_read_settings" on site_settings
  for select using (true);

create policy "public_read_offices" on offices
  for select using (is_active = true);

insert into storage.buckets (id, name, public)
values
  ('media', 'media', true),
  ('voices', 'voices', false)
on conflict (id) do nothing;

drop policy if exists "public_media_read" on storage.objects;
create policy "public_media_read"
on storage.objects
for select
using (bucket_id = 'media');
