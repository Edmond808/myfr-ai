-- Verify a merchant for dispatch testing
-- Run in Supabase SQL editor after a pro applies at /pro

-- 1. Find pending merchants
select id, business_name, email, categories, service_areas, status, created_at
from merchants
where status = 'applied'
order by created_at desc;

-- 2. Approve a merchant (replace UUID)
-- update merchants
-- set status = 'verified'
-- where id = 'YOUR-MERCHANT-UUID';

-- 3. Optional: seed a verified test merchant linked to your auth user
-- insert into merchants (
--   owner_id,
--   business_name,
--   categories,
--   service_areas,
--   whatsapp_phone,
--   email,
--   status
-- ) values (
--   'YOUR-AUTH-USER-UUID',
--   'Test Pro Cannes',
--   array['groceries']::job_category[],
--   array['Cannes']::text[],
--   '+33600000000',
--   'pro@example.com',
--   'verified'
-- );

-- 4. End-to-end test
--    a. Verify merchant (step 2)
--    b. Customer: classify + dispatch a groceries job in Cannes
--    c. Merchant: open /pro/dashboard → submit quote
--    d. Customer: refresh dispatch view → quote appears

-- 5. Apply RLS patch if upgrading an existing Supabase project (merchant job feed)
-- create policy "merchant reads dispatched jobs" on jobs
--   for select using (
--     exists (
--       select 1 from quotes q
--       join merchants m on m.id = q.merchant_id
--       where q.job_id = jobs.id and m.owner_id = auth.uid()
--     )
--   );
