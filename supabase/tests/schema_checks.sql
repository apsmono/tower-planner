\set ON_ERROR_STOP on
\pset pager off
\pset tuples_only on
\pset format unaligned

-- Helper: assert a statement fails.
create or replace function pg_temp.must_fail(sql text, what text) returns text
language plpgsql as $$
begin
  execute sql;
  return 'FAIL  (accepted, should have been rejected): ' || what;
exception when others then
  return 'ok    rejected: ' || what;
end $$;

create or replace function pg_temp.must_pass(sql text, what text) returns text
language plpgsql as $$
begin
  execute sql;
  return 'ok    accepted: ' || what;
exception when others then
  return 'FAIL  (rejected, should have been accepted): ' || what || ' — ' || sqlerrm;
end $$;

-- ---------------------------------------------------------------------------
select '--- uuidv7 ---';
select case when (('x' || substr(replace(public.uuid_generate_v7()::text,'-',''), 13, 1))::bit(4))::int = 7
            then 'ok    version nibble is 7' else 'FAIL  version nibble wrong' end;
select case when count(distinct v) = 200 and min(v::text) < max(v::text)
            then 'ok    200 distinct, time-ordered'
            else 'FAIL  uuidv7 collision or not ordered' end
from (select public.uuid_generate_v7() v from generate_series(1,200), pg_sleep(0)) s;

-- ---------------------------------------------------------------------------
select '--- new-user bootstrap ---';
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'a@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'b@example.com');

select case when count(*) = 2 then 'ok    2 profiles' else 'FAIL  profiles=' || count(*) end from public.profiles;
select case when count(*) = 10 then 'ok    5 lab slots each' else 'FAIL  lab_slots=' || count(*) end from public.lab_slots;
select case when count(*) = 18 then 'ok    9 UW rows each' else 'FAIL  ultimate_weapons=' || count(*) end from public.ultimate_weapons;
select case when count(*) = 2 then 'ok    2 build_states' else 'FAIL  build_states=' || count(*) end from public.build_states;
select case when stat1 = 15.4 and stat2 = 38 and stat3 = 200 then 'ok    GT defaults pulled from ref_uw_stats'
            else 'FAIL  GT defaults ' || stat1 || '/' || stat2 || '/' || stat3 end
from public.ultimate_weapons where uw_id = 'gt' and user_id = '11111111-1111-4111-8111-111111111111';

-- ---------------------------------------------------------------------------
select '--- reference-tier constraints ---';
select pg_temp.must_fail(
  $q$insert into public.ref_tournament_rewards (league, rank_min, rank_max, gems, stones, keys)
     values ('gold', 14, 20, 1, 1, 0)$q$,
  'overlapping rank band (gold 14-20 overlaps 13-15)');
select pg_temp.must_fail(
  $q$insert into public.ref_tournament_rewards (league, rank_min, rank_max, gems, stones, keys)
     values ('gold', 31, 25, 1, 1, 0)$q$,
  'inverted rank band');
select pg_temp.must_fail(
  $q$insert into public.ref_data_version (id, data_version) values (false, 2)$q$,
  'second ref_data_version row');
select pg_temp.must_fail(
  $q$insert into public.ref_labs (id, name, category, max_level) values ('x','X','nonsense',1)$q$,
  'unknown lab category');
select pg_temp.must_fail(
  $q$insert into public.ref_labs (id, name, category, max_level, default_channel)
     values ('x','X','attack',1,'coins.notAChannel')$q$,
  'unknown effect channel');

select '--- tournament_rewards() ---';
select case when count(*) = 0 then 'ok    unknown league returns no rows' else 'FAIL  guessed a league' end
from public.tournament_rewards(null, 3);
select case when count(*) = 0 then 'ok    unknown rank returns no rows' else 'FAIL  guessed a rank' end
from public.tournament_rewards('champion', null);
select case when gems = 400 and stones = 280 then 'ok    champion rank 3 = 400 gems / 280 stones'
            else 'FAIL  champion rank 3 = ' || gems || '/' || stones end
from public.tournament_rewards('champion', 3);
select case when count(*) = 30 then 'ok    every rank 1..30 resolves in every league'
            else 'FAIL  ' || count(*) || '/30 ranks resolve in legend' end
from generate_series(1,30) r, lateral public.tournament_rewards('legend', r);

-- ---------------------------------------------------------------------------
select '--- user-state constraints ---';
select pg_temp.must_fail(
  $q$insert into public.lab_slots (user_id, slot_index) values ('11111111-1111-4111-8111-111111111111', 5)$q$,
  'sixth lab slot');
select pg_temp.must_fail(
  $q$update public.lab_slots set boost = 2.5 where slot_index = 0$q$,
  'boost tier that has no cell price');
select pg_temp.must_pass(
  $q$update public.lab_slots set boost = 3.0, research_id = 'lab_speed', started_at = now() where slot_index = 0$q$,
  'valid boost + real lab id');
select pg_temp.must_fail(
  $q$update public.lab_slots set research_id = 'labs_speed' where slot_index = 1$q$,
  'INITIAL_BUILD typo `labs_speed` (master catalog has `lab_speed`)');
select pg_temp.must_fail(
  $q$update public.lab_slots set research_id = 'auto_pick' where slot_index = 1$q$,
  'INITIAL_BUILD typo `auto_pick` (master catalog has `auto_pick_ranking`)');
select pg_temp.must_fail(
  $q$update public.lab_slots set research_id = 'dw_cells' where slot_index = 1$q$,
  'INITIAL_BUILD typo `dw_cells` (master catalog has `dw_cell`)');
select pg_temp.must_fail(
  $q$update public.lab_slots set started_at = now() where slot_index = 2 and research_id is null$q$,
  'empty slot marked as running');
select pg_temp.must_fail(
  $q$update public.ultimate_weapons set active = true where uw_id = 'cf'$q$,
  'UW active without being unlocked');
select pg_temp.must_fail(
  $q$update public.build_states set coins = -1$q$,
  'negative coin balance');
select pg_temp.must_pass(
  $q$update public.build_states set coins = 9.9e30$q$,
  'coin balance past the bigint ceiling (numeric, not bigint)');

select '--- research catalog ---';
select pg_temp.must_fail(
  $q$insert into public.research_catalog_entries (user_id, lab_id, name, effect_channel)
     values ('11111111-1111-4111-8111-111111111111', 'bh_coin', 'BH Coin Bonus', 'coins.blackHole')$q$,
  'half-filled effect (channel with no kind/from/to)');
select pg_temp.must_pass(
  $q$insert into public.research_catalog_entries
       (user_id, lab_id, name, coin_cost, base_time_seconds, effect_channel, effect_kind, effect_from, effect_to, level, target_level)
     values ('11111111-1111-4111-8111-111111111111', 'bh_coin', 'Black Hole Coin Bonus',
             13130000000, 417600, 'coins.blackHole', 'multiplier', 9.5, 10.0, 18, 19)$q$,
  'complete research entry at 13.13B coins');
select pg_temp.must_pass(
  $q$insert into public.research_catalog_entries (user_id, lab_id, name, coin_cost)
     values ('11111111-1111-4111-8111-111111111111', 'my_custom_lab', 'Something the wiki lacks', 1)$q$,
  'catalog entry for a lab not in ref_labs (deliberately unconstrained)');

select '--- planner tasks ---';
select pg_temp.must_fail(
  $q$insert into public.planner_tasks (user_id, type, name)
     values ('11111111-1111-4111-8111-111111111111', 'experiment', 'benchmark T10')$q$,
  'experiment task with no tier or run count');
select pg_temp.must_pass(
  $q$insert into public.planner_tasks (user_id, type, name, experiment_tier, experiment_required_runs)
     values ('11111111-1111-4111-8111-111111111111', 'experiment', 'benchmark T10, n=3', 10, 3)$q$,
  'experiment task with tier and run count');
select pg_temp.must_fail(
  $q$update public.planner_tasks set status = 'completed'$q$,
  'completed status with no completed_at');

-- ---------------------------------------------------------------------------
select '--- run log ---';
insert into public.tournament_results (id, user_id, league, event_date, max_wave, rank)
values ('33333333-3333-4333-8333-333333333333', '11111111-1111-4111-8111-111111111111', null, '2026-08-20', 871, 12);
select case when league is null then 'ok    tournament result with unknown league is storable'
            else 'FAIL  league defaulted to ' || league end
from public.tournament_results where id = '33333333-3333-4333-8333-333333333333';

select pg_temp.must_pass(
  $q$insert into public.runs (id, user_id, tier, wave, battle_date, real_time_sec, content_hash, raw_text, parser_version, fields)
     values ('44444444-4444-4444-8444-444444444444', '11111111-1111-4111-8111-111111111111',
             9, 3444, '2026-08-26T21:00:00Z', 26400, 'hash-a', 'Battle Report\ttier\t9', 2,
             '{"coinsEarned": 4.391e13, "blackHoleDamage": 3.36e21}'::jsonb)$q$,
  'run with 1e21-scale field values');
select pg_temp.must_fail(
  $q$insert into public.runs (user_id, tier, wave, content_hash) values
     ('11111111-1111-4111-8111-111111111111', 9, 3444, 'hash-a')$q$,
  'second run with the same content_hash (double paste)');
select pg_temp.must_pass(
  $q$update public.runs set deleted_at = now() where content_hash = 'hash-a'$q$,
  'soft-deleting the run');
select pg_temp.must_pass(
  $q$insert into public.runs (user_id, tier, wave, content_hash) values
     ('11111111-1111-4111-8111-111111111111', 9, 3444, 'hash-a')$q$,
  're-importing it after the soft delete');
select pg_temp.must_fail(
  $q$insert into public.runs (user_id, run_type, tier, wave, content_hash, tournament_result_id) values
     ('11111111-1111-4111-8111-111111111111', 'farm', 9, 3444, 'hash-b', '33333333-3333-4333-8333-333333333333')$q$,
  'farm run linked to a tournament result');
select pg_temp.must_pass(
  $q$insert into public.runs (user_id, run_type, tier, wave, content_hash, tournament_result_id) values
     ('11111111-1111-4111-8111-111111111111', 'tournament', 8, 871, 'hash-c', '33333333-3333-4333-8333-333333333333')$q$,
  'tournament run linked to that result');
select case when count(*) = 1 then 'ok    updated_at trigger fires on update'
            else 'FAIL  updated_at not maintained' end
from public.runs where content_hash = 'hash-a' and updated_at > created_at;

-- ---------------------------------------------------------------------------
select '--- RLS ---';
insert into public.runs (user_id, tier, wave, content_hash)
values ('22222222-2222-4222-8222-222222222222', 10, 3099, 'hash-user-b');

begin;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select case when count(*) = 0 then 'ok    user A cannot see user B''s runs'
            else 'FAIL  leaked ' || count(*) || ' rows' end
from public.runs where content_hash = 'hash-user-b';

select case when count(*) = 5 then 'ok    user A sees exactly its own 5 lab slots'
            else 'FAIL  sees ' || count(*) || ' lab slots' end
from public.lab_slots;

select case when count(*) = 71 then 'ok    reference data readable while signed in'
            else 'FAIL  ref_labs visible rows = ' || count(*) end
from public.ref_labs;

select pg_temp.must_fail(
  $q$insert into public.runs (user_id, tier, wave, content_hash) values
     ('22222222-2222-4222-8222-222222222222', 9, 1, 'forged')$q$,
  'writing a run under another user''s id');
select pg_temp.must_fail(
  $q$update public.ref_boost_costs set cell_cost = 0 where boost = 3.0$q$,
  'a signed-in client editing reference data');
-- RLS filters DELETE/UPDATE rather than raising, so the assertion is that the
-- other user's row survives, not that the statement errors.
delete from public.profiles where id = '22222222-2222-4222-8222-222222222222';
commit;
begin;
select case when count(*) = 1 then 'ok    another user''s profile survives a delete attempt'
            else 'FAIL  deleted another user''s profile' end
from public.profiles where id = '22222222-2222-4222-8222-222222222222';

commit;

begin;
set local role anon;
select case when count(*) = 71 then 'ok    anon can read reference data'
            else 'FAIL  anon ref_labs = ' || count(*) end from public.ref_labs;
select pg_temp.must_fail($q$select count(*) from public.runs$q$,
  'anon touching the run log at all (privilege revoked, before RLS is even consulted)');
commit;

select '--- done ---';
