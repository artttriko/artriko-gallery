-- Dream admin: analytics + riddle bank + text overrides. Access is limited to the single owner Google account.
create or replace function public.dream_owner() returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(lower(auth.jwt() ->> 'email') = 'ssaharr@gmail.com' and coalesce((auth.jwt() -> 'user_metadata' ->> 'email_verified')::boolean, false), false);
$$;
revoke all on function public.dream_owner() from public, anon;
grant execute on function public.dream_owner() to authenticated;
create table if not exists public.dream_events (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  sid text not null check (char_length(sid) <= 64),
  uid uuid,
  kind text not null check (kind in ('visit','end')),
  device text check (device in ('phone','tablet','desktop')),
  dur integer check (dur is null or (dur >= 0 and dur <= 14400)),
  meta jsonb
);
alter table public.dream_events enable row level security;
create index if not exists dream_events_created_idx on public.dream_events (created_at desc);
drop policy if exists "dream events insert" on public.dream_events;
create policy "dream events insert" on public.dream_events for insert to anon, authenticated with check (kind in ('visit','end'));
drop policy if exists "dream events admin read" on public.dream_events;
create policy "dream events admin read" on public.dream_events for select to authenticated using ((select public.dream_owner()));

create table if not exists public.dream_riddles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  q text not null check (char_length(q) between 3 and 400),
  opts jsonb not null check (jsonb_typeof(opts) = 'array' and jsonb_array_length(opts) = 4),
  ans integer not null check (ans between 0 and 3),
  hint text,
  young boolean not null default false,
  active boolean not null default true
);
alter table public.dream_riddles add column if not exists level smallint not null default 1 check (level between 1 and 3);
alter table public.dream_riddles enable row level security;
drop policy if exists "dream riddles read" on public.dream_riddles;
create policy "dream riddles read" on public.dream_riddles for select to anon, authenticated using (active or (select public.dream_owner()));
drop policy if exists "dream riddles admin ins" on public.dream_riddles;
create policy "dream riddles admin ins" on public.dream_riddles for insert to authenticated with check ((select public.dream_owner()));
drop policy if exists "dream riddles admin upd" on public.dream_riddles;
create policy "dream riddles admin upd" on public.dream_riddles for update to authenticated using ((select public.dream_owner())) with check ((select public.dream_owner()));
drop policy if exists "dream riddles admin del" on public.dream_riddles;
create policy "dream riddles admin del" on public.dream_riddles for delete to authenticated using ((select public.dream_owner()));

create table if not exists public.dream_texts (
  key text primary key check (char_length(key) <= 120),
  value text not null check (char_length(value) <= 2000),
  updated_at timestamptz not null default now()
);
alter table public.dream_texts enable row level security;
drop policy if exists "dream texts read" on public.dream_texts;
create policy "dream texts read" on public.dream_texts for select to anon, authenticated using (true);
drop policy if exists "dream texts admin ins" on public.dream_texts;
create policy "dream texts admin ins" on public.dream_texts for insert to authenticated with check ((select public.dream_owner()));
drop policy if exists "dream texts admin upd" on public.dream_texts;
create policy "dream texts admin upd" on public.dream_texts for update to authenticated using ((select public.dream_owner())) with check ((select public.dream_owner()));
drop policy if exists "dream texts admin del" on public.dream_texts;
create policy "dream texts admin del" on public.dream_texts for delete to authenticated using ((select public.dream_owner()));

create or replace function public.dream_stats(days integer default 30)
returns jsonb language plpgsql security definer set search_path = public as $$
declare r jsonb;
begin
  if not public.dream_owner() then return null; end if;
  select jsonb_build_object(
    'visitors', (select count(distinct sid) from dream_events where kind='visit' and created_at > now() - make_interval(days => days)),
    'visits', (select count(*) from dream_events where kind='visit' and created_at > now() - make_interval(days => days)),
    'registered', (select count(*) from dream_saves),
    'avg_seconds', (select coalesce(round(avg(t))::int,0) from (select sid, sum(dur) t from dream_events where kind='end' and created_at > now() - make_interval(days => days) group by sid) x),
    'devices', (select coalesce(jsonb_object_agg(device, c),'{}'::jsonb) from (select device, count(distinct sid) c from dream_events where kind='visit' and created_at > now() - make_interval(days => days) group by device) d),
    'daily', (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'v', v) order by d),'[]'::jsonb) from (select (created_at at time zone 'Asia/Jerusalem')::date d, count(distinct sid) v from dream_events where kind='visit' and created_at > now() - make_interval(days => days) group by 1) q)
  ) into r;
  return r;
end $$;
revoke all on function public.dream_stats(integer) from public, anon;
grant execute on function public.dream_stats(integer) to authenticated;
