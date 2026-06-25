import { notFound } from 'next/navigation';

import { ProjectActionBar } from '@/features/projects/components/ProjectActionBar';
import { ProjectWorkShell } from '@/features/projects/components/ProjectWorkShell';
import { ProjectTodoList } from '@/features/todos/components/ProjectTodoList';
import { listProjectTodos } from '@/features/todos/queries/project-todo.queries';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

interface IProjectTodosPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectTodosPage({ params }: IProjectTodosPageProps) {
	const user = await requireUser();
	const { id } = await params;
	const supabase = await createClient();

	const { data: project } = await supabase
		.from('projects')
		.select('id, type')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	const todos = await listProjectTodos(id);

	return (
		<div className='space-y-4 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1rem)] md:pb-2'>
			<ProjectWorkShell
				projectId={id}
				projectType={project.type}
				timeContent={null}
				todosContent={
					<ProjectTodoList
						projectId={id}
						projectType={project.type}
						initialTodos={todos}
					/>
				}
			/>
			<ProjectActionBar projectId={id} projectType={project.type} context='work' />
		</div>
	);
}
