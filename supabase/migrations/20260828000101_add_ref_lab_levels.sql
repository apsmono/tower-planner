-- ============================================================================
-- 01b · Reference tier extension: Lab level-by-level base duration & costs
--
-- Stores base research time (pre-lab-speed and pre-cell-boost seconds) and
-- base coin cost for every level of all research items in ref_labs.
--
-- Policy: public read, no write policy (writes via service_role / seed).
-- ============================================================================

set search_path = public, extensions;

-- ---------------------------------------------------------------------------
-- Level-by-level lab research metrics.
-- ---------------------------------------------------------------------------
create table if not exists public.ref_lab_levels (
  lab_id             text not null references public.ref_labs(id) on delete cascade,
  level              integer not null check (level > 0),
  base_time_seconds  bigint not null check (base_time_seconds >= 0),
  coin_cost          numeric check (coin_cost >= 0),
  created_at         timestamptz not null default now(),
  primary key (lab_id, level)
);

comment on table public.ref_lab_levels is
  'Baseline pre-boost research time in seconds and coin costs for every lab level.';

create index if not exists ref_lab_levels_lab_id_idx on public.ref_lab_levels (lab_id, level);

-- ---------------------------------------------------------------------------
-- Enable RLS and public read grant
-- ---------------------------------------------------------------------------
alter table public.ref_lab_levels enable row level security;
revoke all on public.ref_lab_levels from anon, authenticated;
grant select on public.ref_lab_levels to anon, authenticated;

drop policy if exists ref_lab_levels_public_read on public.ref_lab_levels;
create policy ref_lab_levels_public_read on public.ref_lab_levels
  for select to anon, authenticated using (true);
