-- Promote a merchant to top of quote lists (testing / manual admin)
-- Run in Supabase SQL editor. Stripe billing integration planned for Phase 4.

-- 1. Find verified merchants
select id, business_name, rating, is_promoted, promotion_rank, promotion_expires_at
from merchants
where status = 'verified'
order by business_name;

-- 2. Enable promotion (replace UUID)
-- update merchants
-- set
--   is_promoted = true,
--   promotion_rank = 10,
--   promotion_expires_at = now() + interval '30 days'
-- where id = 'YOUR-MERCHANT-UUID';

-- 3. Remove promotion
-- update merchants
-- set
--   is_promoted = false,
--   promotion_rank = 0,
--   promotion_expires_at = null
-- where id = 'YOUR-MERCHANT-UUID';

-- 4. End-to-end test
--    a. Promote merchant (step 2)
--    b. Customer: dispatch a job matching their category + area
--    c. Verify promoted pro appears first with Sponsored badge in dispatch UI
