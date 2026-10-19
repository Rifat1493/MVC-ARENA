-- ===========================================================================
-- Enable study_id on an EXISTING base_game_events table (keeps all old rows).
--
-- Run once: Supabase -> SQL Editor -> paste this whole file -> Run.
-- Old rows: study_id stays NULL (expected).
-- New playtest rows: study_id is saved when the player entered one.
-- ===========================================================================

-- 1) Add the column (safe if it already exists)
alter table public.base_game_events
  add column if not exists study_id text;

-- 2) Teach the write function to fill that column when present
drop function if exists public.log_base_game_events(jsonb);

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
    event_id, client_id, session_id, event, is_playtest, study_id, client_time, app_version,
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
    nullif(e ->> 'study_id', ''),
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
