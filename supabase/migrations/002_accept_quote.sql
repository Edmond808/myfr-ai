-- Atomic quote acceptance: accept one quote, reject siblings, mark job accepted.
-- Run in Supabase SQL editor after schema.sql.

create or replace function accept_quote(p_job_id uuid, p_quote_id uuid)
returns void language plpgsql security definer as $$
begin
  if not exists (
    select 1 from jobs
    where id = p_job_id and customer_id = auth.uid()
      and status in ('dispatched','quoted')
  ) then
    raise exception 'job not acceptable';
  end if;
  if not exists (
    select 1 from quotes
    where id = p_quote_id and job_id = p_job_id
      and status = 'submitted' and price_eur is not null
  ) then
    raise exception 'quote not acceptable';
  end if;

  update quotes set status = 'accepted' where id = p_quote_id;
  update quotes set status = 'rejected'
    where job_id = p_job_id and id <> p_quote_id
      and status in ('pending','submitted');
  update jobs set accepted_quote_id = p_quote_id, status = 'accepted'
    where id = p_job_id;
end $$;
