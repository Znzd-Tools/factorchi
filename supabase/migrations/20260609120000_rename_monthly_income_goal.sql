alter table public.profiles
  rename column monthly_paid_goal to monthly_income_goal;

comment on column public.profiles.monthly_income_goal is
  'Target monthly income from logged hours (hours * rate_at_entry; same units as invoice.total)';
