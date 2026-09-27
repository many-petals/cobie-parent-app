-- Parent companion data for the shared Many Petals Supabase project.
-- These records are intentionally family-private. Teacher sharing happens only
-- through the separately consented shared_progress_summaries table.

create extension if not exists pgcrypto with schema extensions;

alter table public.families
  add column if not exists parent_pin_hash text;

create table if not exists public.petals (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  mood text not null,
  color text not null,
  earned_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.session_history (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  mood text not null,
  duration_seconds integer not null check (duration_seconds >= 0),
  session_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.family_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  narration_speed numeric not null default 1,
  high_contrast boolean not null default false,
  animations_enabled boolean not null default true,
  audio_enabled boolean not null default true,
  sound_enabled boolean not null default true,
  sound_volume numeric not null default 0.5 check (sound_volume between 0 and 1),
  sound_auto_fade boolean not null default true,
  sound_approved text[] not null default '{}',
  sound_character_defaults jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mood_journal (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  entry_date date not null,
  mood text not null,
  drawing_data text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, entry_date)
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  badge_type text not null,
  earned_date date not null default current_date,
  streak_count integer not null default 0 check (streak_count >= 0),
  created_at timestamptz not null default now(),
  unique (family_id, badge_type)
);

create table if not exists public.worries (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  type text not null check (type in ('text', 'drawing')),
  content text not null,
  category text not null default 'other',
  intensity integer not null default 3 check (intensity between 1 and 5),
  put_away boolean not null default false,
  reviewed_with_parent boolean not null default false,
  parent_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  game_type text not null,
  progress_data jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (family_id, game_type)
);

-- Billing status is private to the family. It does not make Stripe billing
-- active by itself; that remains dependent on a separately deployed function.
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null unique references public.families(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status text not null default 'inactive',
  plan_type text check (plan_type in ('monthly', 'yearly')),
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists petals_family_idx on public.petals(family_id, earned_date desc);
create index if not exists session_history_family_idx on public.session_history(family_id, session_date desc);
create index if not exists mood_journal_family_idx on public.mood_journal(family_id, entry_date desc);
create index if not exists badges_family_idx on public.badges(family_id, earned_date);
create index if not exists worries_family_idx on public.worries(family_id, created_at desc);

create or replace function public.current_family_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.families where user_id = auth.uid() limit 1;
$$;

create or replace function public.set_family_parent_pin(pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Sign in before setting a PIN'; end if;
  if pin !~ '^[0-9]{4}$' then raise exception 'PIN must contain exactly four digits'; end if;
  update public.families
  set parent_pin_hash = extensions.crypt(pin, extensions.gen_salt('bf')), updated_at = now()
  where id = public.current_family_id();
end;
$$;

create or replace function public.verify_family_parent_pin(pin text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.families
    where id = public.current_family_id()
      and parent_pin_hash = extensions.crypt(pin, parent_pin_hash)
  );
$$;

create or replace function public.has_family_parent_pin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.families
    where id = public.current_family_id() and parent_pin_hash is not null
  );
$$;

alter table public.petals enable row level security;
alter table public.session_history enable row level security;
alter table public.family_settings enable row level security;
alter table public.mood_journal enable row level security;
alter table public.badges enable row level security;
alter table public.worries enable row level security;
alter table public.game_progress enable row level security;
alter table public.subscriptions enable row level security;

grant select, insert, update, delete on table
  public.petals,
  public.session_history,
  public.family_settings,
  public.mood_journal,
  public.badges,
  public.worries,
  public.game_progress,
  public.subscriptions
to authenticated;

do $$
declare table_name text;
begin
  foreach table_name in array array[
    'petals', 'session_history', 'family_settings', 'mood_journal',
    'badges', 'worries', 'game_progress', 'subscriptions'
  ] loop
    execute format('drop policy if exists family_owner_access on public.%I', table_name);
    execute format(
      'create policy family_owner_access on public.%I for all to authenticated using (family_id = public.current_family_id()) with check (family_id = public.current_family_id())',
      table_name
    );
  end loop;
end;
$$;

revoke all on function public.current_family_id() from public;
grant execute on function public.current_family_id() to authenticated;
grant execute on function public.set_family_parent_pin(text) to authenticated;
grant execute on function public.verify_family_parent_pin(text) to authenticated;
grant execute on function public.has_family_parent_pin() to authenticated;
