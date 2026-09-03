-- ===========================================================================
-- MVC-ARENA playtest telemetry — simplified multi-row event log
--
-- Run once in Supabase -> SQL Editor -> New query -> Run.
-- Safe to re-run; drops and rebuilds.
--
-- One row per gameplay event. A session is reconstructed with:
--   SELECT * FROM game_events
--   WHERE session_id = '...' AND is_playtest
--   ORDER BY client_time, id;
--
-- Browser writes only via log_game_events() (no table privileges).
-- ===========================================================================

drop function if exists public.log_game_events(jsonb);
drop view     if exists public.game_session_summary;
drop table    if exists public.game_events;


create table public.game_events (
  id            bigint generated always as identity primary key,
  event_id      uuid        not null unique,
  client_id     uuid        not null,
  session_id    uuid,
  event         text        not null,
  is_playtest   boolean     not null default false,
  client_time   timestamptz not null,
  received_at   timestamptz not null default now(),
  properties    jsonb       not null default '{}'::jsonb
);

create index game_events_session_idx   on public.game_events (session_id);
create index game_events_client_idx    on public.game_events (client_id);
create index game_events_playtest_idx  on public.game_events (is_playtest)
  where is_playtest;
create index game_events_received_idx  on public.game_events (received_at desc);


grant usage on schema public to anon, authenticated, service_role;

revoke all on table public.game_events from anon, authenticated;
grant all on table public.game_events to service_role;

alter table public.game_events enable row level security;


-- Append-only write path for the browser publishable key.
create function public.log_game_events(events jsonb)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted integer;
begin
  if jsonb_typeof(events) is distinct from 'array' then
    raise exception 'events must be a JSON array';
  end if;

  if jsonb_array_length(events) > 200 then
    raise exception 'batch too large (max 200 events)';
  end if;

  insert into public.game_events (
    event_id, client_id, session_id, event, is_playtest, client_time, properties
  )
  select
    (e ->> 'event_id')::uuid,
    (e ->> 'client_id')::uuid,
    nullif(e ->> 'session_id', '')::uuid,
    e ->> 'event',
    coalesce((e ->> 'is_playtest')::boolean, false),
    (e ->> 'client_time')::timestamptz,
    coalesce(e -> 'properties', '{}'::jsonb)
  from jsonb_array_elements(events) as e
  on conflict (event_id) do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.log_game_events(jsonb) from public;
grant execute on function public.log_game_events(jsonb) to anon, authenticated;


-- Self-test (expect rows_inserted = 1)
set role anon;
select public.log_game_events(jsonb_build_array(jsonb_build_object(
  'event_id',    gen_random_uuid(),
  'client_id',   gen_random_uuid(),
  'session_id',  gen_random_uuid(),
  'event',       '__setup_test__',
  'is_playtest', true,
  'client_time', now(),
  'properties',  jsonb_build_object('ok', true)
))) as rows_inserted;
reset role;

delete from public.game_events where event = '__setup_test__';
