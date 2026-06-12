-- myfr.ai — Supabase schema v1
-- Run in Supabase SQL editor. Assumes Supabase Auth (auth.users) is enabled.

-- ============ ENUMS ============
create type job_category as enum (
  'groceries','housekeeping','rentals','transport',
  'boats','handyman','events','concierge'
);
create type job_urgency as enum ('today','this_week','flexible');
create type job_status as enum (
  'submitted','classified','dispatched','quoted',
  'accepted','in_progress','completed','disputed','cancelled'
);
create type quote_status as enum ('pending','submitted','accepted','rejected','expired');
create type merchant_status as enum ('applied','under_review','verified','suspended');
create type txn_status as enum ('requires_payment','held','released','refunded','failed');

-- ============ PROFILES (customers) ============
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  preferred_language text default 'en',
  default_location text default 'Cannes',
  loyalty_tier smallint not null default 0 check (loyalty_tier >= 0 and loyalty_tier <= 3),
  created_at timestamptz default now()
);

-- ============ MERCHANTS ============
create table merchants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id),
  business_name text not null,
  siret text,                          -- French business registration
  categories job_category[] not null,
  service_areas text[] not null,       -- ['Cannes','Antibes',...]
  status merchant_status default 'applied',
  whatsapp_phone text,                 -- primary notification channel
  email text,
  rating numeric(2,1) default 0,
  jobs_completed int default 0,
  is_promoted boolean not null default false,
  promotion_rank int not null default 0,
  promotion_expires_at timestamptz,
  stripe_account_id text,              -- Stripe Connect Express acct_...
  stripe_onboarded boolean default false,
  commission_rate numeric(4,3) default 0.150,  -- per-merchant override possible
  created_at timestamptz default now()
);
create index merchants_dispatch_idx on merchants using gin (categories);
create index merchants_area_idx on merchants using gin (service_areas);

-- ============ JOBS ============
create table jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id),
  raw_request text not null,           -- original free text (keep: training data!)
  category job_category not null,
  title text not null,
  summary text not null,
  location text not null,
  urgency job_urgency not null,
  budget_estimate_eur int,
  clarifying_question text,
  status job_status default 'submitted',
  accepted_quote_id uuid,              -- FK added after quotes table
  created_at timestamptz default now(),
  completed_at timestamptz
);
create index jobs_customer_idx on jobs (customer_id, created_at desc);
create index jobs_dispatch_idx on jobs (category, status);

-- ============ QUOTES ============
create table quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  merchant_id uuid not null references merchants(id),
  price_eur numeric(10,2),
  message text,
  status quote_status default 'pending',  -- 'pending' = dispatched, awaiting merchant
  expires_at timestamptz,
  created_at timestamptz default now(),
  unique (job_id, merchant_id)
);
alter table jobs add constraint jobs_accepted_quote_fk
  foreign key (accepted_quote_id) references quotes(id);

-- ============ TRANSACTIONS ============
create table transactions (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id),
  quote_id uuid not null references quotes(id),
  merchant_id uuid not null references merchants(id),
  customer_id uuid not null references auth.users(id),
  amount_eur numeric(10,2) not null,        -- what customer pays
  commission_eur numeric(10,2) not null,    -- platform fee
  merchant_payout_eur numeric(10,2) not null,
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  status txn_status default 'requires_payment',
  created_at timestamptz default now(),
  released_at timestamptz
);
create index txn_merchant_idx on transactions (merchant_id, created_at desc);

-- ============ ROW LEVEL SECURITY ============
alter table profiles enable row level security;
alter table merchants enable row level security;
alter table jobs enable row level security;
alter table quotes enable row level security;
alter table transactions enable row level security;

-- Customers see/edit own profile
create policy "own profile" on profiles
  for all using (auth.uid() = id);

-- Merchants: owner manages own record; verified merchants publicly readable (for quote cards)
create policy "merchant owner" on merchants
  for all using (auth.uid() = owner_id);
create policy "verified merchants visible" on merchants
  for select using (status = 'verified');

-- Jobs: customer sees own jobs
create policy "customer jobs" on jobs
  for all using (auth.uid() = customer_id);
-- Merchants read jobs dispatched to them via pending/submitted quotes
create policy "merchant reads dispatched jobs" on jobs
  for select using (
    exists (
      select 1 from quotes q
      join merchants m on m.id = q.merchant_id
      where q.job_id = jobs.id and m.owner_id = auth.uid()
    )
  );
create policy "merchant updates dispatched job" on jobs
  for update using (
    exists (
      select 1 from quotes q
      join merchants m on m.id = q.merchant_id
      where q.job_id = jobs.id and m.owner_id = auth.uid()
    )
  );

-- Quotes: customer sees quotes on own jobs; merchant sees/updates own quotes
create policy "customer reads quotes" on quotes
  for select using (
    exists (select 1 from jobs where jobs.id = quotes.job_id and jobs.customer_id = auth.uid())
  );
create policy "customer accepts quotes" on quotes
  for update using (
    exists (select 1 from jobs where jobs.id = quotes.job_id and jobs.customer_id = auth.uid())
  );
create policy "merchant own quotes" on quotes
  for all using (
    exists (select 1 from merchants where merchants.id = quotes.merchant_id and merchants.owner_id = auth.uid())
  );

-- Transactions: customer and merchant each see their own
create policy "customer txns" on transactions
  for select using (auth.uid() = customer_id);
create policy "merchant txns" on transactions
  for select using (
    exists (select 1 from merchants where merchants.id = transactions.merchant_id and merchants.owner_id = auth.uid())
  );

-- ============ MERCHANT JOB FEED (what a pro sees) ============
create view merchant_job_feed as
select
  q.id as quote_id, q.status as quote_status, q.expires_at,
  j.id as job_id, j.category, j.title, j.summary, j.location,
  j.urgency, j.budget_estimate_eur, j.created_at,
  q.merchant_id
from quotes q
join jobs j on j.id = q.job_id
where j.status in ('dispatched','quoted');

-- ============ DISPATCH FUNCTION ============
-- Called server-side after classification: creates pending quotes
-- for ALL verified merchants matching category + area (promoted first).
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

-- ============ AUTO-CREATE PROFILE ON SIGNUP ============
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (
    id, full_name, preferred_language, default_location, loyalty_tier
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'preferred_language', 'en'),
    coalesce(new.raw_user_meta_data->>'default_location', 'Cannes'),
    0
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
