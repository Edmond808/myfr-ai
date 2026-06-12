-- Fix infinite RLS recursion between jobs and quotes (safe to re-run).
-- Old policies cross-referenced jobs <-> quotes in USING clauses; Postgres
-- re-evaluates RLS on each subquery and loops. Security-definer helpers
-- read ownership without triggering nested policy checks.

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

grant execute on function is_job_customer(uuid) to authenticated, anon, service_role;
grant execute on function is_merchant_on_job(uuid) to authenticated, anon, service_role;

drop policy if exists "merchant reads dispatched jobs" on jobs;
create policy "merchant reads dispatched jobs" on jobs
  for select using (is_merchant_on_job(id));

drop policy if exists "merchant updates dispatched job" on jobs;
create policy "merchant updates dispatched job" on jobs
  for update using (is_merchant_on_job(id));

drop policy if exists "customer reads quotes" on quotes;
create policy "customer reads quotes" on quotes
  for select using (is_job_customer(job_id));

drop policy if exists "customer accepts quotes" on quotes;
create policy "customer accepts quotes" on quotes
  for update using (is_job_customer(job_id));
