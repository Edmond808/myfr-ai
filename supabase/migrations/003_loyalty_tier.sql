-- Riviera Club loyalty tier on customer profiles
-- 0 = Guest, 1 = Azur, 2 = Côte, 3 = Prestige

alter table profiles
  add column if not exists loyalty_tier smallint not null default 0
  check (loyalty_tier >= 0 and loyalty_tier <= 3);

comment on column profiles.loyalty_tier is
  'Riviera Club tier: 0 Guest, 1 Azur (8%), 2 Côte (12%), 3 Prestige (18%)';
