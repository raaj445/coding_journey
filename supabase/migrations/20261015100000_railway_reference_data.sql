create table if not exists public.railway_stations (
  code text primary key,
  name text not null,
  state text,
  zone text,
  address text,
  longitude double precision,
  latitude double precision,
  geometry jsonb,
  raw_properties jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.railway_trains (
  number text primary key,
  name text not null,
  from_station_code text,
  from_station_name text,
  to_station_code text,
  to_station_name text,
  departure time,
  arrival time,
  duration_h integer,
  duration_m integer,
  distance_km numeric,
  return_train text,
  zone text,
  train_type text,
  classes text,
  first_ac boolean,
  second_ac boolean,
  third_ac boolean,
  sleeper boolean,
  chair_car boolean,
  first_class boolean,
  geometry jsonb,
  raw_properties jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.railway_schedules (
  id bigint primary key,
  train_number text not null,
  train_name text,
  station_code text not null,
  station_name text not null,
  arrival text,
  departure text,
  journey_day integer,
  stop_order integer,
  raw_record jsonb not null default '{}'::jsonb
);
create index if not exists railway_stations_name_search_idx on public.railway_stations using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(code,'') || ' ' || coalesce(state,'')));
create index if not exists railway_stations_code_idx on public.railway_stations (upper(code));
create index if not exists railway_trains_name_search_idx on public.railway_trains using gin (to_tsvector('simple', coalesce(name,'') || ' ' || coalesce(number,'')));
create index if not exists railway_trains_source_destination_idx on public.railway_trains (from_station_code, to_station_code);
create index if not exists railway_schedules_train_order_idx on public.railway_schedules (train_number, journey_day, stop_order);
create index if not exists railway_schedules_station_idx on public.railway_schedules (station_code, train_number);
alter table public.railway_stations enable row level security;
alter table public.railway_trains enable row level security;
alter table public.railway_schedules enable row level security;
drop policy if exists "Railway stations are publicly readable" on public.railway_stations;
create policy "Railway stations are publicly readable" on public.railway_stations for select to anon, authenticated using (true);
drop policy if exists "Railway trains are publicly readable" on public.railway_trains;
create policy "Railway trains are publicly readable" on public.railway_trains for select to anon, authenticated using (true);
drop policy if exists "Railway schedules are publicly readable" on public.railway_schedules;
create policy "Railway schedules are publicly readable" on public.railway_schedules for select to anon, authenticated using (true);
grant select on public.railway_stations, public.railway_trains, public.railway_schedules to anon, authenticated;
