-- ============================================================================
-- 05 · Reference & User tier: Modules Catalog, Substats, and Loadouts
-- ============================================================================

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Master Modules Catalog
-- ---------------------------------------------------------------------------
create table if not exists public.ref_modules (
  id                         text primary key,
  name                       text not null,
  slot                       text not null check (slot in ('cannon', 'armor', 'generator', 'core')),
  unique_effect_name         text not null,
  unique_effect_description  text not null,
  theme_color                text not null default '#3b82f6',
  max_level                  integer not null default 160 check (max_level > 0),
  sort_order                 integer not null default 0,
  created_at                 timestamptz not null default now()
);

comment on table public.ref_modules is
  'Master reference catalog for Unique Epic Modules across Cannon, Armor, Generator, and Core.';

create index if not exists ref_modules_slot_idx on public.ref_modules (slot, sort_order);

alter table public.ref_modules enable row level security;
revoke all on public.ref_modules from anon, authenticated;
grant select on public.ref_modules to anon, authenticated;

drop policy if exists ref_modules_public_read on public.ref_modules;
create policy ref_modules_public_read on public.ref_modules
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- Master Substats Reference
-- ---------------------------------------------------------------------------
create table if not exists public.ref_module_substats (
  id              text primary key,
  name            text not null,
  slot            text not null check (slot in ('cannon', 'armor', 'generator', 'core')),
  unit            text not null default '',
  rare_val        numeric not null default 0,
  epic_val        numeric not null default 0,
  legendary_val   numeric not null default 0,
  mythic_val      numeric not null default 0,
  ancestral_val   numeric not null default 0,
  sort_order      integer not null default 0
);

comment on table public.ref_module_substats is
  'Master table of substat lines and values per rarity tier.';

create index if not exists ref_module_substats_slot_idx on public.ref_module_substats (slot, sort_order);

alter table public.ref_module_substats enable row level security;
revoke all on public.ref_module_substats from anon, authenticated;
grant select on public.ref_module_substats to anon, authenticated;

drop policy if exists ref_module_substats_public_read on public.ref_module_substats;
create policy ref_module_substats_public_read on public.ref_module_substats
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- User Module Loadouts
-- ---------------------------------------------------------------------------
create table if not exists public.user_modules (
  user_id           uuid not null references auth.users(id) on delete cascade,
  slot              text not null check (slot in ('cannon', 'armor', 'generator', 'core')),
  module_id         text references public.ref_modules(id) on delete set null,
  rarity            text not null default 'epic',
  level             integer not null default 1 check (level between 1 and 200),
  substats          jsonb not null default '[]'::jsonb,
  locked_substats   text[] not null default '{}',
  updated_at        timestamptz not null default now(),
  primary key (user_id, slot)
);

comment on table public.user_modules is
  'Equipped module loadout, level, rarity tier, and rolled/locked substats per user slot.';

alter table public.user_modules enable row level security;
revoke all on public.user_modules from anon, authenticated;
grant select, insert, update, delete on public.user_modules to authenticated;

drop policy if exists user_modules_owner on public.user_modules;
create policy user_modules_owner on public.user_modules
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
