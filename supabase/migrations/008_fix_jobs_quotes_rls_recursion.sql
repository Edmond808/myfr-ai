-- 008 — Fix jobs ↔ quotes RLS infinite recursion
-- Run in Supabase SQL editor if not applied via CLI.
-- Adds security-definer helpers and updates dispatch_job to bypass RLS during insert.

-- ---- Security-definer helpers (avoid jobs <-> quotes policy loops) ----
create or replace function is_job_customer(p_job_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from jobs
    where id = p_job_id and customer_id = auth.uid()
  );
$$;

create or replace function is_merchant_on_job(p_job_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from quotes q
    join merchants m on m.id = q.merchant_id
    where q.job_id = p_job_id and m.owner_id = auth.uid()
  );
$$;

-- ---- Replace recursive job policies ----
drop policy if exists "merchant reads dispatched jobs" on jobs;
drop policy if exists "merchant updates dispatched job" on jobs;

create policy "merchant reads dispatched jobs" on jobs
  for select using (is_merchant_on_job(id));
create policy "merchant updates dispatched job" on jobs
  for update using (is_merchant_on_job(id));

-- ---- Replace recursive quote policies ----
drop policy if exists "customer reads quotes" on quotes;
drop policy if exists "customer accepts quotes" on quotes;

create policy "customer reads quotes" on quotes
  for select using (is_job_customer(job_id));
create policy "customer accepts quotes" on quotes
  for update using (is_job_customer(job_id));

-- ---- dispatch_job: RLS off + staged wave 1 (from 006_review_fixes) ----
create or replace function dispatch_job(p_job_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  perform set_config('row_security', 'off', true);

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

-- Wave 2: remaining matching pros (cron or manual after ~60–90 min)
create or replace function widen_dispatch(p_job_id uuid)
returns int language plpgsql security definer set search_path = public as $$
declare
  v_count int;
begin
  perform set_config('row_security', 'off', true);

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
