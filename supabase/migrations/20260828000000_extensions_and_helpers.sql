-- ============================================================================
-- 00 · Extensions and shared helpers
--
-- Nothing in this file is domain-specific. It exists so the three tier
-- migrations that follow can assume uuidv7 keys, an updated_at trigger and
-- non-overlapping-range constraints already work.
-- ============================================================================

create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- uuidv7: time-ordered primary keys.
--
-- Postgres 16 (what Supabase runs) has no native uuidv7; it arrives in PG 18.
-- This is the standard bit-twiddling implementation: take a v4 uuid, overwrite
-- the leading 48 bits with a millisecond timestamp, then rewrite the version
-- nibble from 0100 (v4) to 0111 (v7). Note that set_bit() numbers bits
-- LSB-first within each byte, which is why the version nibble is bits 52..55
-- and setting 52 and 53 is enough.
--
-- Why it matters here: `runs` is append-mostly and always read in battle_date
-- order. Random v4 keys scatter inserts across the whole btree; v7 keys append
-- to the right-hand edge like a bigint sequence, without leaking a row count.
-- ---------------------------------------------------------------------------
create or replace function public.uuid_generate_v7()
returns uuid
language sql
volatile
parallel safe
as $$
  select encode(
    set_bit(
      set_bit(
        overlay(
          uuid_send(gen_random_uuid())
          placing substring(
            int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint)
            from 3
          )
          from 1 for 6
        ),
        52, 1
      ),
      53, 1
    ),
    'hex'
  )::uuid;
$$;

comment on function public.uuid_generate_v7() is
  'Time-ordered UUID (RFC 9562 v7). Replace with the native gen_uuid_v7() once the project is on Postgres 18.';

-- ---------------------------------------------------------------------------
-- updated_at maintenance.
--
-- The sync engine pulls user state by an updated_at cursor and resolves
-- conflicts last-write-wins on the same column. A client that forgets to set
-- it would silently make its own writes invisible to the other device, so the
-- column is maintained server-side and client-supplied values are ignored.
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE trigger. Stamps updated_at server-side so the sync cursor cannot be falsified by a client clock.';
