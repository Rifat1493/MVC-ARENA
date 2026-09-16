-- ===========================================================================
-- MVC-ARENA Base Mode playtest telemetry (columnar, no jsonb payload)
--
-- Run once in Supabase -> SQL Editor -> New query -> Run.
-- Safe to re-run; drops and rebuilds.
--
-- Flow Mode will use a separate table later.
--
-- Browser writes only via log_base_game_events() (no table privileges).
-- ===========================================================================

drop function if exists public.log_base_game_events(jsonb);
drop function if exists public.log_game_events(jsonb);
drop view     if exists public.game_session_summary;
drop table    if exists public.base_game_events;
drop table    if exists public.game_events;


create table public.base_game_events (
  id                     bigint generated always as identity primary key,
  event_id               uuid        not null unique,
  client_id              uuid        not null,
  session_id             uuid,
  event                  text        not null,
  is_playtest            boolean     not null default false,
  client_time            timestamptz not null,
  received_at            timestamptz not null default now(),
  app_version            text,

  turn_number            integer,
  player_id              integer,
  player_name            text,
  is_bot                 boolean,

  action_type            text,
  card_type              text,
  component_name         text,
  target_player_id       integer,
  defended               boolean,
  decision_duration_ms   integer,

  score_p0               integer,
  score_p1               integer,

  end_reason             text,
  session_duration_ms    bigint,
  winner_id              integer,
  winner_name            text
);

create index base_game_events_session_idx  on public.base_game_events (session_id);
create index base_game_events_client_idx   on public.base_game_events (client_id);
create index base_game_events_playtest_idx on public.base_game_events (is_playtest)
  where is_playtest;
create index base_game_events_event_idx    on public.base_game_events (event);
create index base_game_events_received_idx on public.base_game_events (received_at desc);


grant usage on schema public to anon, authenticated, service_role;

revoke all on table public.base_game_events from anon, authenticated;
grant all on table public.base_game_events to service_role;

alter table public.base_game_events enable row level security;


create function public.log_base_game_events(events jsonb)
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

  insert into public.base_game_events (
    event_id, client_id, session_id, event, is_playtest, client_time, app_version,
    turn_number, player_id, player_name, is_bot,
    action_type, card_type, component_name, target_player_id, defended,
    decision_duration_ms, score_p0, score_p1,
    end_reason, session_duration_ms, winner_id, winner_name
  )
  select
    (e ->> 'event_id')::uuid,
    (e ->> 'client_id')::uuid,
    nullif(e ->> 'session_id', '')::uuid,
    e ->> 'event',
    coalesce((e ->> 'is_playtest')::boolean, false),
    (e ->> 'client_time')::timestamptz,
    e ->> 'app_version',
    nullif(e ->> 'turn_number', '')::integer,
    nullif(e ->> 'player_id', '')::integer,
    e ->> 'player_name',
    case when e ? 'is_bot' then (e ->> 'is_bot')::boolean else null end,
    e ->> 'action_type',
    e ->> 'card_type',
    e ->> 'component_name',
    nullif(e ->> 'target_player_id', '')::integer,
    case when e ? 'defended' then (e ->> 'defended')::boolean else null end,
    nullif(e ->> 'decision_duration_ms', '')::integer,
    nullif(e ->> 'score_p0', '')::integer,
    nullif(e ->> 'score_p1', '')::integer,
    e ->> 'end_reason',
    nullif(e ->> 'session_duration_ms', '')::bigint,
    nullif(e ->> 'winner_id', '')::integer,
    e ->> 'winner_name'
  from jsonb_array_elements(events) as e
  on conflict (event_id) do nothing;

  get diagnostics inserted = row_count;
  return inserted;
end;
$$;

revoke all on function public.log_base_game_events(jsonb) from public;
grant execute on function public.log_base_game_events(jsonb) to anon, authenticated;


-- Self-test (expect rows_inserted = 1)
set role anon;
select public.log_base_game_events(jsonb_build_array(jsonb_build_object(
  'event_id',              gen_random_uuid(),
  'client_id',             gen_random_uuid(),
  'session_id',            gen_random_uuid(),
  'event',                 '__setup_test__',
  'is_playtest',           true,
  'client_time',           now(),
  'card_type',             'LOGGER',
  'defended',              true,
  'decision_duration_ms',  1000
))) as rows_inserted;
reset role;

delete from public.base_game_events where event = '__setup_test__';
