-- ============================================================================
-- 04 · Reference tier: Perks catalog & user perk preferences
-- ============================================================================

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Master Perk Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.ref_perks (
  id               text primary key,
  name             text not null,
  category         text not null check (category in ('standard', 'tradeoff', 'ultimate_weapon')),
  max_picks        integer not null default 1 check (max_picks > 0),
  base_value       numeric not null,
  unit             text not null default '',
  positive_effect  text not null,
  negative_effect  text,
  uw_id            text references public.ref_uw_configs(id) on delete set null,
  description      text not null default '',
  tier_score       smallint not null default 3 check (tier_score between 1 and 5),
  recommended_ban  boolean not null default false,
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now()
);

comment on table public.ref_perks is
  'Master catalog of Standard, Purple Trade-Off, and Green Ultimate Weapon perks.';

create index if not exists ref_perks_category_idx on public.ref_perks (category, sort_order);

-- ---------------------------------------------------------------------------
-- Enable RLS and public read grant
-- ---------------------------------------------------------------------------
alter table public.ref_perks enable row level security;
revoke all on public.ref_perks from anon, authenticated;
grant select on public.ref_perks to anon, authenticated;

drop policy if exists ref_perks_public_read on public.ref_perks;
create policy ref_perks_public_read on public.ref_perks
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- User Perk Preferences & Ban Priorities
-- ---------------------------------------------------------------------------
create table if not exists public.user_perk_profiles (
  user_id            uuid not null references auth.users(id) on delete cascade,
  profile_name       text not null default 'Default Farm',
  first_perk_choice  text references public.ref_perks(id) on delete set null,
  banned_perk_ids    text[] not null default '{}',
  auto_pick_priority text[] not null default '{}',
  standard_perk_lab  integer not null default 0 check (standard_perk_lab between 0 and 25),
  updated_at         timestamptz not null default now(),
  primary key (user_id, profile_name)
);

comment on table public.user_perk_profiles is
  'User perk preference profiles, first perk picks, ban lists, and auto-pick queues.';

alter table public.user_perk_profiles enable row level security;
revoke all on public.user_perk_profiles from anon, authenticated;
grant select, insert, update, delete on public.user_perk_profiles to authenticated;

drop policy if exists user_perk_profiles_owner on public.user_perk_profiles;
create policy user_perk_profiles_owner on public.user_perk_profiles
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
