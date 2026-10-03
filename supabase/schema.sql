-- ARTRIKO gallery database (already applied to the Supabase project "ArtRikoGallery").
-- Kept here for reference and for setting up a fresh project. Contains no secrets.
-- After running it: insert your admin email into public.admins, and a random
-- value into public.private_config (key 'visit_secret') matching VISIT_SECRET in Vercel.

create table public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email','')));
$$;

create table public.works (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  height_cm numeric,
  materials text,
  status text not null default 'show' check (status in ('sale','show')),
  summary text,
  character text,
  category text,
  scale text,
  tech text,
  media jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.works enable row level security;
create policy "works are public" on public.works for select to anon, authenticated using (true);
create policy "admins insert works" on public.works for insert to authenticated with check ((select public.is_admin()));
create policy "admins update works" on public.works for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete works" on public.works for delete to authenticated using ((select public.is_admin()));
create index works_created_at_idx on public.works (created_at desc);

create table public.settings (key text primary key, value jsonb, updated_at timestamptz not null default now());
alter table public.settings enable row level security;
create policy "public settings readable" on public.settings for select to anon, authenticated using (key in ('texts','room') or (select public.is_admin()));
create policy "admins insert settings" on public.settings for insert to authenticated with check ((select public.is_admin()));
create policy "admins update settings" on public.settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admins delete settings" on public.settings for delete to authenticated using ((select public.is_admin()));

create table public.visits (id bigint generated always as identity primary key, ip_hash text not null, created_at timestamptz not null default now());
alter table public.visits enable row level security;
create index visits_ip_time_idx on public.visits (ip_hash, created_at desc);

create table public.private_config (key text primary key, value text not null);
alter table public.private_config enable row level security;

create or replace function public.record_visit(p_secret text, p_ip_hash text) returns boolean
language plpgsql security definer set search_path = '' as $$
declare ok boolean;
begin
  select exists(select 1 from public.private_config c where c.key = 'visit_secret' and c.value = p_secret) into ok;
  if not ok or p_ip_hash is null or length(p_ip_hash) < 16 then return false; end if;
  if exists (select 1 from public.visits v where v.ip_hash = p_ip_hash and v.created_at > now() - interval '10 minutes') then return false; end if;
  insert into public.visits (ip_hash) values (p_ip_hash);
  return true;
end $$;

create or replace function public.visit_stats() returns json
language plpgsql stable security definer set search_path = '' as $$
begin
  if not public.is_admin() then return null; end if;
  return json_build_object(
    'total', (select count(*) from public.visits),
    'today', (select count(*) from public.visits where created_at >= date_trunc('day', now() at time zone 'Asia/Jerusalem') at time zone 'Asia/Jerusalem'),
    'week',  (select count(*) from public.visits where created_at >= now() - interval '7 days'));
end $$;
revoke execute on function public.visit_stats() from anon, public;

insert into storage.buckets (id, name, public, file_size_limit) values ('gallery', 'gallery', true, 104857600) on conflict (id) do nothing;
create policy "admins upload gallery files" on storage.objects for insert to authenticated with check (bucket_id = 'gallery' and (select public.is_admin()));
create policy "admins update gallery files" on storage.objects for update to authenticated using (bucket_id = 'gallery' and (select public.is_admin()));
create policy "admins delete gallery files" on storage.objects for delete to authenticated using (bucket_id = 'gallery' and (select public.is_admin()));

-- How a piece is shown in the size illustration: standing on the floor or hanging on the wall
alter table public.works add column if not exists mount text not null default 'stand' check (mount in ('stand','wall'));
