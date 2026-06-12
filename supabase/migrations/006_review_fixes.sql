-- 006 — Claude review fixes (main @ 92bcf7f)
-- 1. Close forged-insert hole on user_quote_preferences
-- 2. Staged dispatch: wave 1 = active promoted + top 5; widen_dispatch() for the rest

-- ---- 1. RLS fix ----
drop policy if exists "log quote filter preferences" on user_quote_preferences;
create policy "log quote filter preferences" on user_quote_preferences
  for insert with check (user_id is null or user_id = auth.uid());

-- ---- 2. Staged dispatch ----
-- Wave 1: all active-promoted pros + top 5 non-promoted by rating.
-- Protects merchant win rates while keeping promoted placement value.
create or replace function dispatch_job(p_job_id uuid)
returns int language plpgsql security definer as $$
declare
  v_count int;
begin
  insert into quotes (job_id, merchant_id, status, expires_at)
  select p_job_id, m.id, 'pending', now() + interval '4 hours'
  from jobs j
  join lateral (
    select m.id
    from merchants m
    where j.category = any(m.categories)
      and j.location = any(m.service_areas)
      and m.status = 'verified'
      and m.is_promoted
      and (m.promotion_expires_at is null or m.promotion_expires_at > now())
    union
    select m.id from (
      select m.id
      from merchants m
      where j.category = any(m.categories)
        and j.location = any(m.service_areas)
        and m.status = 'verified'
        and not (m.is_promoted
                 and (m.promotion_expires_at is null or m.promotion_expires_at > now()))
      order by m.rating desc, m.jobs_completed desc
      limit 5
    ) m
  ) m on true
  where j.id = p_job_id
  on conflict (job_id, merchant_id) do nothing;

  get diagnostics v_count = row_count;
  if v_count > 0 then
    update jobs set status = 'dispatched' where id = p_job_id;
  end if;
  return v_count;
end $$;

-- Wave 2: call after ~60-90 min if < 2 quotes came in (cron or manual).
-- Dispatches all remaining matching verified pros not yet quoted.
create or replace function widen_dispatch(p_job_id uuid)
returns int language plpgsql security definer as $$
declare
  v_count int;
begin
  insert into quotes (job_id, merchant_id, status, expires_at)
  select p_job_id, m.id, 'pending', now() + interval '4 hours'
  from jobs j
  join merchants m
    on j.category = any(m.categories)
   and j.location = any(m.service_areas)
   and m.status = 'verified'
  where j.id = p_job_id
    and j.status in ('dispatched','quoted')
    and not exists (
      select 1 from quotes q
      where q.job_id = p_job_id and q.merchant_id = m.id
    )
  on conflict (job_id, merchant_id) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end $$;
