alter table public.projects
  drop constraint if exists projects_pomodoro_minutes_check;

alter table public.projects
  drop column if exists pomodoro_minutes;
