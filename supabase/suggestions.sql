-- Schema for the "Suggestions" tab.
--
-- Run this in the SQL editor of a Supabase project DEDICATED to
-- suggestions — deliberately NOT the menu database, since that one's
-- tables get overwritten wholesale by a daily cron job and would take
-- user-submitted suggestions down with it.
--
-- After running this, copy the new project's URL and anon key into .env as
-- EXPO_PUBLIC_SUGGESTIONS_SUPABASE_URL / EXPO_PUBLIC_SUGGESTIONS_SUPABASE_ANON_KEY.

create table public.suggestions (
  id bigint generated always as identity primary key,
  email text not null,
  content text not null,
  score integer not null default 0,
  created_at timestamptz not null default now(),
  constraint suggestions_content_length check (char_length(content) between 1 and 1000),
  constraint suggestions_email_format check (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- What the app is actually allowed to read — no email column, so
-- submitters' addresses never leave the database. Query this directly
-- (e.g. via the Supabase Table Editor, or `select * from suggestions
-- order by created_at desc`) to see suggestions alongside who sent them.
create view public.suggestions_public as
  select id, content, score, created_at
  from public.suggestions
  order by created_at desc;

alter table public.suggestions enable row level security;

-- The anon key may only ever INSERT — never read the base table (so email
-- stays private), and never UPDATE/DELETE directly (score changes only
-- through vote_suggestion() below, which can't touch email or content).
create policy "anon can submit suggestions"
  on public.suggestions
  for insert
  to anon
  with check (true);

revoke all on public.suggestions from anon;
grant insert (email, content) on public.suggestions to anon;
grant select on public.suggestions_public to anon;

-- SECURITY DEFINER so it can update `score` on the caller's behalf without
-- granting anon any direct UPDATE privilege on the table.
--
-- Caveat: since the app has no sign-in, this can't verify who's calling it
-- server-side — the app only prevents accidental double-votes locally (see
-- data/suggestions.ts). Someone hitting this endpoint directly with the
-- anon key could inflate/deflate a score. Fine for a small trusted
-- audience; if that ever becomes a problem, the fix is to require some
-- form of per-device identity this function can check against a votes
-- table before applying the delta.
create or replace function public.vote_suggestion(suggestion_id bigint, delta integer)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  new_score integer;
begin
  if delta not in (-2, -1, 1, 2) then
    raise exception 'invalid delta: %', delta;
  end if;
  update public.suggestions
  set score = score + delta
  where id = suggestion_id
  returning score into new_score;

  if new_score is null then
    raise exception 'suggestion % not found', suggestion_id;
  end if;
  return new_score;
end;
$$;

grant execute on function public.vote_suggestion(bigint, integer) to anon;
