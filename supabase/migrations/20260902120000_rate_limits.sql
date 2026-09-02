-- Rate limiting for the AI endpoints.
--
-- These functions call a paid API with no sign-in in front of them, which is
-- the deliberate trade that keeps the app usable without an account. The cost
-- of that trade is that anyone who finds the URL can spend money through it,
-- so the endpoints count calls per address and refuse past a threshold.
--
-- Counting lives in Postgres rather than in the function's memory because edge
-- functions are horizontally scaled and short-lived: an in-memory counter is
-- reset by every cold start and is not shared between instances, so it limits
-- almost nothing.

create table if not exists public.rate_limits (
  -- Address plus endpoint: a burst of CV analyses should not lock someone out
  -- of the contact form.
  bucket       text        not null,
  window_start timestamptz not null,
  hits         integer     not null default 0,
  primary key (bucket, window_start)
);

-- Only the functions touch this, and they use the service role, which bypasses
-- RLS. Enabling it with no policy therefore denies every anon/authenticated
-- client while leaving the functions working — the table holds addresses, and
-- nothing in the app has any reason to read it.
alter table public.rate_limits enable row level security;

create index if not exists rate_limits_window_idx
  on public.rate_limits (window_start);

/**
 * Records one hit and reports whether the caller is still under the limit.
 *
 * Fixed windows rather than a sliding log: a caller can spend a full window's
 * budget at the boundary and get another immediately, which is acceptable for
 * a spend guard and costs one row per window instead of one per request.
 *
 * The insert is atomic, so two concurrent calls cannot both read the count
 * before either writes it.
 */
create or replace function public.check_rate_limit(
  p_bucket text,
  p_limit  integer,
  p_window interval
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_window_start timestamptz;
  v_hits integer;
begin
  -- Snap to the start of the current window so every caller in it shares a row.
  v_window_start := to_timestamp(
    floor(extract(epoch from now()) / extract(epoch from p_window))
    * extract(epoch from p_window)
  );

  insert into public.rate_limits (bucket, window_start, hits)
  values (p_bucket, v_window_start, 1)
  on conflict (bucket, window_start)
    do update set hits = public.rate_limits.hits + 1
  returning hits into v_hits;

  -- Old windows are dead weight; clear them occasionally rather than running a
  -- scheduled job for a table this small.
  if random() < 0.01 then
    delete from public.rate_limits where window_start < now() - interval '1 day';
  end if;

  return v_hits <= p_limit;
end;
$$;

revoke all on function public.check_rate_limit(text, integer, interval) from public, anon, authenticated;
