-- ============================================================================
-- 02 · User state tier — hand-typed, unrecoverable, edited constantly
--
-- DOMAIN.md §1 is explicit that lab levels, UW stats, module sub-effects and
-- resource balances have no export in the game. Everything in this file was
-- typed by hand and has no upstream to restore from. That is why the
-- constraints here are tighter than they would normally be for a single-user
-- tool: the cheapest place to catch a bad write is before it lands.
--
-- Policy for every table: `user_id = auth.uid()`, both directions.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- profiles — the join point between auth.users and everything else.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- build_states — one row per user, the flattened BuildState scalars.
--
-- numeric, not bigint, throughout. The seed research catalog already carries a
-- 507.10B coin cost and balances climb from there; bigint tops out at 9.2e18
-- and the game's own scale suffixes reach 1e63.
--
-- cards stays jsonb: CardState.levels is Record<string, number> keyed by card
-- name, it is read and written whole, and nothing queries inside it.
-- ---------------------------------------------------------------------------
create table public.build_states (
  user_id               uuid primary key references auth.users(id) on delete cascade,
  coins                 numeric not null default 0 check (coins >= 0),
  cells                 numeric not null default 0 check (cells >= 0),
  gems                  numeric not null default 0 check (gems >= 0),
  stones                numeric not null default 0 check (stones >= 0),
  shards                numeric not null default 0 check (shards >= 0),
  lab_speed_multiplier  numeric not null default 1 check (lab_speed_multiplier > 0),
  card_slots            smallint not null default 0 check (card_slots >= 0),
  card_levels           jsonb not null default '{}'::jsonb
                          check (jsonb_typeof(card_levels) = 'object'),
  verification_flags    text[] not null default '{}',
  updated_at            timestamptz not null default now()
);

comment on column public.build_states.verification_flags is
  'DOMAIN.md §7 flags for numbers the player has not yet confirmed against the game screen.';

-- ---------------------------------------------------------------------------
-- research_catalog_entries — the player's current prices, not game constants.
--
-- DOMAIN.md §5 is explicit that the seeded catalog is a starting point the
-- player edits as prices climb, which is why this is per-user and not a ref_
-- table. lab_id deliberately has NO foreign key to ref_labs: the app lets the
-- player add entries the wiki catalog does not carry.
-- ---------------------------------------------------------------------------
create table public.research_catalog_entries (
  user_id            uuid not null references auth.users(id) on delete cascade,
  lab_id             text not null,
  name               text not null,
  level              integer not null default 0 check (level >= 0),
  change_label       text not null default '',
  coin_cost          numeric not null default 0 check (coin_cost >= 0),
  base_time_seconds  integer not null default 0 check (base_time_seconds >= 0),
  effect_channel     text references public.ref_effect_channels(id),
  effect_from        double precision,
  effect_to          double precision,
  effect_kind        text check (effect_kind in ('multiplier', 'percent', 'flat', 'unlock')),
  target_level       integer check (target_level >= 0),
  reason             text,
  estimated_impact   double precision,
  updated_at         timestamptz not null default now(),
  primary key (user_id, lab_id),
  -- A half-filled effect is worse than none: the Upgrade Queue would rank it
  -- with a null multiplier and quietly place it at the bottom.
  constraint research_effect_complete check (
    (effect_channel is null and effect_kind is null)
    or (effect_channel is not null and effect_kind is not null
        and effect_from is not null and effect_to is not null)
  ),
  constraint research_target_above_current check (
    target_level is null or target_level >= level
  )
);

comment on column public.research_catalog_entries.change_label is
  'The ResearchEntry.change display string, e.g. "×9.50 → ×10.00 (cap)". Renamed from `change` for SQL readability.';

-- ---------------------------------------------------------------------------
-- lab_slots — exactly five, and the scarce resource in the whole app.
--
-- The composite primary key plus the 0..4 range check enforces the invariant
-- that BuildState.labs currently only implies by array length.
--
-- research_id is a real foreign key to ref_labs. This WILL reject three of the
-- five slots in the current INITIAL_BUILD seed — `labs_speed`, `auto_pick` and
-- `dw_cells` do not exist in MASTER_LAB_CATALOG, which carries `lab_speed`,
-- `auto_pick_ranking` and `dw_cell`. Those three are already broken today:
-- LabDatabase.getLabById() returns undefined for them. Fix the seed ids before
-- migrating rather than dropping the constraint.
-- ---------------------------------------------------------------------------
create table public.lab_slots (
  user_id      uuid not null references auth.users(id) on delete cascade,
  slot_index   smallint not null check (slot_index between 0 and 4),
  research_id  text references public.ref_labs(id) on delete set null,
  level        integer not null default 0 check (level >= 0),
  boost        numeric(4,1) not null default 1.0 references public.ref_boost_costs(boost),
  started_at   timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, slot_index),
  -- An empty slot cannot be running.
  constraint lab_slot_started_requires_research check (
    started_at is null or research_id is not null
  )
);

comment on table public.lab_slots is
  'Exactly five rows per user, seeded on sign-up. Slot-days are the scarce resource the Upgrade Queue ranks against.';

-- ---------------------------------------------------------------------------
-- ultimate_weapons
-- ---------------------------------------------------------------------------
create table public.ultimate_weapons (
  user_id     uuid not null references auth.users(id) on delete cascade,
  uw_id       text not null references public.ref_uw_configs(id) on delete cascade,
  unlocked    boolean not null default false,
  active      boolean not null default false,
  level       integer not null default 0 check (level >= 0),
  stat1       double precision,
  stat2       double precision,
  stat3       double precision,
  updated_at  timestamptz not null default now(),
  primary key (user_id, uw_id),
  -- A weapon that has not been acquired cannot be slotted into a run.
  constraint uw_active_requires_unlocked check (not active or unlocked)
);

-- ---------------------------------------------------------------------------
-- modules and their sub-effects
-- ---------------------------------------------------------------------------
create table public.modules (
  user_id     uuid not null references auth.users(id) on delete cascade,
  module_id   text not null,
  name        text not null,
  tier        text not null references public.ref_module_tiers(id),
  updated_at  timestamptz not null default now(),
  primary key (user_id, module_id)
);

create table public.module_sub_effects (
  user_id        uuid not null,
  module_id      text not null,
  sub_effect_id  text not null,
  name           text not null,
  tier           text not null references public.ref_module_tiers(id),
  locked         boolean not null default true,
  updated_at     timestamptz not null default now(),
  primary key (user_id, module_id, sub_effect_id),
  foreign key (user_id, module_id)
    references public.modules(user_id, module_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- planner_tasks
--
-- The shape check encodes what each task type actually needs. An experiment
-- task with no tier is the failure mode the benchmark loop in DOMAIN.md would
-- hit first, and it is silent in the current array-of-objects model.
-- ---------------------------------------------------------------------------
create table public.planner_tasks (
  id                            uuid primary key default public.uuid_generate_v7(),
  user_id                       uuid not null references auth.users(id) on delete cascade,
  type                          text not null check (type in ('research', 'resource', 'experiment')),
  name                          text not null,
  status                        text not null default 'active' check (status in ('active', 'completed')),
  target_research_id            text,
  target_level                  integer check (target_level >= 0),
  target_resource               text check (target_resource in ('coins', 'cells', 'gems', 'stones', 'shards')),
  target_amount                 numeric check (target_amount >= 0),
  experiment_tier               integer check (experiment_tier > 0),
  experiment_required_runs      integer check (experiment_required_runs > 0),
  experiment_completed_run_ids  uuid[] not null default '{}',
  notes                         text,
  created_at                    timestamptz not null default now(),
  completed_at                  timestamptz,
  updated_at                    timestamptz not null default now(),
  constraint planner_task_shape check (
    case type
      when 'research'   then target_research_id is not null
      when 'resource'   then target_resource is not null and target_amount is not null
      when 'experiment' then experiment_tier is not null and experiment_required_runs is not null
      else false
    end
  ),
  constraint planner_task_completed_at check (
    (status = 'completed') = (completed_at is not null)
  )
);

create index planner_tasks_user_status_idx
  on public.planner_tasks (user_id, status, created_at desc);

-- ---------------------------------------------------------------------------
-- New-user bootstrap.
--
-- Creates the profile, the singleton build_state, the five lab slots and one
-- row per Ultimate Weapon, so the invariants above hold from the first request
-- rather than from whenever the client first writes.
--
-- Every insert is ON CONFLICT DO NOTHING. Phase 2's local-data adoption has to
-- upsert over these defaults; it must never see an empty cloud state and
-- conclude the local one should be cleared.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;

  insert into public.build_states (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.lab_slots (user_id, slot_index)
  select new.id, generate_series(0, 4)::smallint
  on conflict (user_id, slot_index) do nothing;

  insert into public.ultimate_weapons (user_id, uw_id, stat1, stat2, stat3)
  select
    new.id,
    c.id,
    max(case when s.stat_index = 1 then s.default_val end),
    max(case when s.stat_index = 2 then s.default_val end),
    max(case when s.stat_index = 3 then s.default_val end)
  from public.ref_uw_configs c
  left join public.ref_uw_stats s on s.uw_id = c.id
  group by c.id
  on conflict (user_id, uw_id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'build_states', 'research_catalog_entries', 'lab_slots',
    'ultimate_weapons', 'modules', 'module_sub_effects', 'planner_tasks'
  ]
  loop
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.set_updated_at()',
      t || '_set_updated_at', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS.
--
-- `(select auth.uid())` rather than a bare `auth.uid()`: wrapping it lets the
-- planner evaluate it once as an InitPlan instead of per row, which is the
-- difference between a fast and a slow scan on the run log next door.
--
-- module_sub_effects carries its own user_id column rather than reaching
-- through modules, so its policy is a column comparison and not a subquery.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy profiles_own_row on public.profiles
  for all to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

do $$
declare
  t text;
begin
  foreach t in array array[
    'build_states', 'research_catalog_entries', 'lab_slots',
    'ultimate_weapons', 'modules', 'module_sub_effects', 'planner_tasks'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using (user_id = (select auth.uid())) '
      'with check (user_id = (select auth.uid()))',
      t || '_own_rows', t
    );
  end loop;
end;
$$;

revoke all on public.profiles from anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
