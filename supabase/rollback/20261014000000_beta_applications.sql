-- DESTRUCTIVE: deletes every stored beta application. Back up/export first.
-- Run manually only if withdrawing this feature; never applied automatically.
begin;
drop table public.beta_applications;
commit;
