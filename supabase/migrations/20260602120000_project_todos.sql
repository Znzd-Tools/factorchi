create table if not exists public.project_todos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  is_done boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_todos_title_length check (char_length(trim(title)) between 1 and 200)
);

create index if not exists project_todos_project_id_idx
  on public.project_todos (project_id, is_done, created_at desc);

alter table public.project_todos enable row level security;

create policy "project_todos_all_own" on public.project_todos
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create trigger project_todos_updated_at before update on public.project_todos
  for each row execute function public.set_updated_at();
