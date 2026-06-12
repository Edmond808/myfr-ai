-- Promoted merchant placement + quote filter analytics

alter table merchants
  add column if not exists is_promoted boolean not null default false,
  add column if not exists promotion_rank int not null default 0,
  add column if not exists promotion_expires_at timestamptz;

comment on column merchants.is_promoted is 'Paid top placement in customer quote list';
comment on column merchants.promotion_rank is 'Higher rank = closer to top among promoted pros';
comment on column merchants.promotion_expires_at is 'When promotion ends; null = no expiry';

create table if not exists user_quote_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text,
  job_id uuid references jobs(id) on delete set null,
  filters_json jsonb not null default '{}',
  sort_by text not null default 'recommended',
  created_at timestamptz default now()
);

create index if not exists user_quote_prefs_job_idx
  on user_quote_preferences (job_id, created_at desc);
create index if not exists user_quote_prefs_user_idx
  on user_quote_preferences (user_id, created_at desc)
  where user_id is not null;

alter table user_quote_preferences enable row level security;

create policy "log quote filter preferences" on user_quote_preferences
  for insert with check (true);

create policy "users read own quote preferences" on user_quote_preferences
  for select using (auth.uid() = user_id);

-- Dispatch ALL verified merchants; promoted pros first
create or replace function dispatch_job(p_job_id uuid)
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
  order by
    (m.is_promoted and (m.promotion_expires_at is null or m.promotion_expires_at > now())) desc,
    m.promotion_rank desc,
    m.rating desc,
    m.jobs_completed desc;

  get diagnostics v_count = row_count;
  if v_count > 0 then
    update jobs set status = 'dispatched' where id = p_job_id;
  end if;
  return v_count;
end $$;
