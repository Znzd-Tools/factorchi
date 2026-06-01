alter table public.projects
  add column if not exists pomodoro_minutes integer not null default 25;

alter table public.projects
  add constraint projects_pomodoro_minutes_check
  check (pomodoro_minutes >= 5 and pomodoro_minutes <= 120);

comment on column public.projects.pomodoro_minutes is 'Focus timer Pomodoro block length in minutes (hourly projects)';
