-- Local stub of the parts of a Supabase project the migrations depend on.
-- NOT part of the deliverable — this is only so the migrations can be run
-- against a throwaway Postgres in CI/verification.

create schema if not exists extensions;
create schema if not exists auth;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;

grant usage on schema public to anon, authenticated, service_role;
grant usage on schema extensions to anon, authenticated, service_role;

create table if not exists auth.users (
  id                    uuid primary key default gen_random_uuid(),
  email                 text,
  raw_user_meta_data    jsonb not null default '{}'::jsonb,
  created_at            timestamptz not null default now()
);

-- Supabase reads the uid out of the request JWT claims; the stub reads a GUC
-- so tests can impersonate a user with `set local request.jwt.claim.sub`.
create or replace function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
