-- CVs, and the snapshots of them.
--
-- Until now a CV lived in localStorage and nowhere else. That is why the app
-- needs no account, and it is also why a CV is lost when someone clears their
-- browser, switches phones, or reinstalls. This is the schema that lets the
-- same CV follow a person, without making them sign up for the privilege.
--
--
-- OWNERSHIP, WITH NO ACCOUNTS
--
-- Every row belongs to a row in auth.users, but a user is not the same thing as
-- someone who signed up: Supabase's anonymous sign-in issues a real user for a
-- device that has never given an email. The app signs in anonymously on first
-- run, saves against that id, and everything below works — row-level security
-- included — with no login screen in the way.
--
-- Attaching an email later upgrades that same row in place. The id does not
-- change, so the CVs come along; there is no "merge the guest's work into the
-- new account" step, which is where this kind of feature usually goes wrong.
--
-- The cost is that an anonymous user who loses their session loses the link to
-- their rows, exactly as they lose localStorage today. Signing up is what makes
-- a CV recoverable, and that is an honest thing to tell someone: it is a reason
-- to make an account rather than a toll gate in front of the product.
--
--
-- ONE DOCUMENT PER ROW
--
-- `data` holds the whole CV as JSONB rather than a table per section. The app
-- edits a CV as one object and autosaves all of it on a 600 ms debounce; there
-- is no screen that reads one job without the rest, and no query that wants
-- "all the employers in the database". Normalising twelve section types would
-- buy a shape the app never asks for and pay for it on every save.
--
-- The columns beside it are what the list screen needs — title, template,
-- language, score, timestamps — kept out of the JSON so listing does not parse
-- every document, and so an index can sort by them.

create extension if not exists "pgcrypto";   -- gen_random_uuid

-- ---------------------------------------------------------------- cvs

create table if not exists public.cvs (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users (id) on delete cascade,

  -- Listing fields. Denormalised from `data` on write by the trigger below,
  -- so they cannot drift from the document they describe.
  title       text        not null default 'Untitled CV',
  template_id text        not null default 'modern',
  language    text        not null default 'en',
  -- The ATS score last computed for this CV, for the badge on the list. Null
  -- until it has been scored once; the score is derived, never authoritative.
  score       smallint,

  data        jsonb       not null,

  -- Bumped on every write. Two devices editing the same CV both send an
  -- update; the one holding a stale revision can be told so instead of
  -- silently overwriting the other. Last-write-wins is still the outcome by
  -- default — this makes it a decision rather than an accident.
  revision    integer     not null default 1,

  -- Soft delete. Losing a CV is the worst thing this app can do to someone,
  -- and a mis-tap is easier than a support request. Rows are hidden from the
  -- app immediately and purged by the job at the bottom.
  deleted_at  timestamptz,

  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint cvs_data_is_object check (jsonb_typeof(data) = 'object'),
  -- A CV that will not fit in a request is not a CV; this stops one row from
  -- growing without bound behind an embedded image.
  constraint cvs_data_size check (pg_column_size(data) < 1048576)
);

-- The list screen: this user's live CVs, newest edit first.
create index if not exists cvs_owner_updated_idx
  on public.cvs (owner_id, updated_at desc)
  where deleted_at is null;

-- The purge job, and the trash view if one is ever built.
create index if not exists cvs_deleted_idx
  on public.cvs (deleted_at)
  where deleted_at is not null;

-- ---------------------------------------------------- keeping columns honest

/**
 * Copies the listing fields out of the document and advances the revision.
 *
 * Doing it here rather than in the client means the two cannot disagree: a
 * write that changes the title inside `data` cannot leave the old title in the
 * column, whichever client sent it.
 */
create or replace function public.cvs_sync_columns()
returns trigger
language plpgsql
as $$
begin
  new.title       := coalesce(nullif(new.data->>'title', ''), 'Untitled CV');
  new.template_id := coalesce(nullif(new.data->>'template_id', ''), 'modern');
  new.language    := coalesce(nullif(new.data->>'language', ''), 'en');
  new.updated_at  := now();

  if tg_op = 'UPDATE' then
    -- Not from the client: a client that sends its own revision can send any
    -- number, and the count is only useful if the database owns it.
    new.revision   := old.revision + 1;
    new.owner_id   := old.owner_id;      -- ownership is not transferable
    new.created_at := old.created_at;
  end if;

  return new;
end;
$$;

drop trigger if exists cvs_sync_columns on public.cvs;
create trigger cvs_sync_columns
  before insert or update on public.cvs
  for each row execute function public.cvs_sync_columns();

-- ---------------------------------------------------------------- versions

-- Snapshots the user asked for, not an audit log. Autosave fires every 600 ms
-- while someone types; a row per save would be thousands of near-identical
-- copies and a history nobody can read. These are written when the user takes
-- a snapshot, and before a destructive action worth being able to undo.
create table if not exists public.cv_versions (
  id         uuid primary key default gen_random_uuid(),
  cv_id      uuid not null references public.cvs (id) on delete cascade,
  -- Repeated from the parent rather than joined for it: row-level security
  -- runs per row, and a policy that has to join is a policy that runs on every
  -- read of every version.
  owner_id   uuid not null references auth.users (id) on delete cascade,

  label      text,                    -- what the user called it, if anything
  data       jsonb       not null,    -- the whole CV as it stood
  score      smallint,
  created_at timestamptz not null default now(),

  constraint cv_versions_data_is_object check (jsonb_typeof(data) = 'object')
);

create index if not exists cv_versions_cv_created_idx
  on public.cv_versions (cv_id, created_at desc);

/**
 * Keeps the twenty most recent snapshots of a CV.
 *
 * Without a cap this table grows for as long as someone keeps using the app,
 * and the value of the fiftieth-oldest snapshot is nil. Trimming on insert
 * costs one small delete per snapshot, which is rare by design.
 */
create or replace function public.cv_versions_trim()
returns trigger
language plpgsql
as $$
begin
  delete from public.cv_versions
  where cv_id = new.cv_id
    and id not in (
      select id from public.cv_versions
      where cv_id = new.cv_id
      -- id breaks the tie: snapshots taken inside one transaction share a
      -- created_at, and "the most recent twenty" of a set that ties is
      -- otherwise whichever twenty the planner happens to return.
      order by created_at desc, id desc
      limit 20
    );
  return null;
end;
$$;

drop trigger if exists cv_versions_trim on public.cv_versions;
create trigger cv_versions_trim
  after insert on public.cv_versions
  for each row execute function public.cv_versions_trim();

-- ------------------------------------------------------------------- RLS
--
-- Everything below is the actual security boundary. The anon key is public —
-- it is in the JavaScript bundle and inside the APK — so these policies, not
-- the key, are what stop one person reading another's CV.

alter table public.cvs         enable row level security;
alter table public.cv_versions enable row level security;

-- Deleted rows are invisible through the API. Undelete is therefore not a
-- client operation; it needs a function, which is the right place for it.
drop policy if exists "read own cvs" on public.cvs;
create policy "read own cvs" on public.cvs
  for select using (auth.uid() = owner_id and deleted_at is null);

drop policy if exists "create own cvs" on public.cvs;
create policy "create own cvs" on public.cvs
  for insert with check (auth.uid() = owner_id);

-- `using` decides which rows may be updated; `with check` decides what they
-- may become. Both are needed: without the second, a permitted update could
-- set owner_id to someone else and hand the row away.
drop policy if exists "update own cvs" on public.cvs;
create policy "update own cvs" on public.cvs
  for update using (auth.uid() = owner_id)
          with check (auth.uid() = owner_id);

-- No delete policy. Removal goes through soft_delete_cv below, so a client
-- cannot destroy a row outright — deliberately, given what a row is here.

drop policy if exists "read own versions" on public.cv_versions;
create policy "read own versions" on public.cv_versions
  for select using (auth.uid() = owner_id);

drop policy if exists "create own versions" on public.cv_versions;
create policy "create own versions" on public.cv_versions
  for insert with check (auth.uid() = owner_id);

drop policy if exists "delete own versions" on public.cv_versions;
create policy "delete own versions" on public.cv_versions
  for delete using (auth.uid() = owner_id);

-- ------------------------------------------------------------- operations

/**
 * Hides a CV. Returns false when it is not the caller's, rather than raising.
 *
 * Runs as definer, and not for convenience. The read policy hides rows with a
 * deleted_at, so setting one moves the row out of the caller's own view — and
 * Postgres rejects an update whose result the updater could no longer see:
 *
 *   ERROR: new row violates row-level security policy for table "cvs"
 *
 * A plain `update ... set deleted_at = now()` therefore always fails, however
 * clearly it is the owner asking. Bypassing RLS and making the ownership check
 * here is what restore_cv already does for the mirror-image reason: it has to
 * touch a row the policy is hiding.
 */
create or replace function public.soft_delete_cv(p_cv_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.cvs
     set deleted_at = now()
   where id = p_cv_id
     and owner_id = auth.uid()      -- the check RLS would have made
     and deleted_at is null;
  return found;
end;
$$;

/** Brings one back, within the window before the purge. */
create or replace function public.restore_cv(p_cv_id uuid)
returns boolean
language plpgsql
security definer            -- the read policy hides deleted rows from the caller
set search_path = public
as $$
begin
  update public.cvs
     set deleted_at = null
   where id = p_cv_id
     and owner_id = auth.uid()      -- the check RLS would have made
     and deleted_at is not null;
  return found;
end;
$$;

/**
 * Empties the trash. Meant for a scheduled call (pg_cron, or a function on a
 * timer); nothing calls it automatically, so the window is real until you
 * schedule it.
 */
create or replace function public.purge_deleted_cvs(p_older_than interval default interval '30 days')
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  delete from public.cvs
   where deleted_at is not null
     and deleted_at < now() - p_older_than;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.purge_deleted_cvs(interval) from public, anon, authenticated;

grant execute on function public.soft_delete_cv(uuid) to authenticated, anon;
grant execute on function public.restore_cv(uuid)     to authenticated, anon;
