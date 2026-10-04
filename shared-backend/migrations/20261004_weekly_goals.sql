-- Weekly parent goals stay family-private. They are not teacher tracker data.
create table if not exists public.weekly_goals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  client_id text not null,
  title text not null,
  description text not null default '',
  target_count integer not null check (target_count > 0),
  current_progress integer not null default 0 check (current_progress >= 0),
  goal_type text not null check (goal_type in ('worry_review', 'breathing', 'journal', 'quiet_time', 'custom')),
  week_start_date date not null,
  completed boolean not null default false,
  celebrated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, client_id),
  check (current_progress <= target_count)
);

create index if not exists weekly_goals_family_idx
  on public.weekly_goals(family_id, week_start_date desc, created_at desc);

alter table public.weekly_goals enable row level security;

grant select, insert, update, delete on table public.weekly_goals to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'weekly_goals'
      and policyname = 'family_owner_access'
  ) then
    create policy family_owner_access on public.weekly_goals
      for all to authenticated
      using (family_id = public.current_family_id())
      with check (family_id = public.current_family_id());
  end if;
end;
$$;
