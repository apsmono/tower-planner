-- ============================================================================
-- 06 · Update run_type check constraint & add user_lifetime_stats
-- ============================================================================

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- 1. Allow 'event' in public.runs
-- ---------------------------------------------------------------------------
alter table public.runs drop constraint if exists runs_run_type_check;
alter table public.runs add constraint runs_run_type_check 
  check (run_type in ('farm', 'tournament', 'milestone', 'event'));

-- ---------------------------------------------------------------------------
-- 2. User Lifetime Stats & Milestone Tracking
-- ---------------------------------------------------------------------------
create table if not exists public.user_lifetime_stats (
  user_id                 uuid primary key references auth.users(id) on delete cascade,
  total_coins             numeric not null default 0,
  total_gems              numeric not null default 0,
  total_stones            numeric not null default 0,
  total_cells             numeric not null default 0,
  total_rounds_played     integer not null default 0,
  total_waves_completed   integer not null default 0,
  total_enemies_killed    bigint not null default 0,
  max_tier_unlocked       integer not null default 1 check (max_tier_unlocked between 1 and 25),
  tier_max_waves          jsonb not null default '{}'::jsonb,
  raw_stats_text          text not null default '',
  updated_at              timestamptz not null default now()
);

comment on table public.user_lifetime_stats is
  'Lifetime career statistics imported from Settings > Stats and highest tier wave records.';

alter table public.user_lifetime_stats enable row level security;
revoke all on public.user_lifetime_stats from anon, authenticated;
grant select, insert, update, delete on public.user_lifetime_stats to authenticated;

drop policy if exists user_lifetime_stats_owner on public.user_lifetime_stats;
create policy user_lifetime_stats_owner on public.user_lifetime_stats
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
