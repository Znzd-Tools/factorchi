alter table public.profiles
  add column if not exists monthly_hours_goal double precision,
  add column if not exists monthly_paid_goal bigint;

comment on column public.profiles.monthly_hours_goal is 'Target hours for the current working month';
comment on column public.profiles.monthly_paid_goal is 'Target paid invoice total (same units as invoice.total)';
