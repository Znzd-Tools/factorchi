import { notFound } from 'next/navigation';

import { Card } from '@/components/atoms/Card';
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
		<Card
			title='کارها'
			description='لیست کارهای پروژه؛ هنگام ثبت ساعت می‌توانی از همین لیست انتخاب کنی'
		>
			<ProjectTodoList
				projectId={id}
				projectType={project.type}
				initialTodos={todos}
			/>
		</Card>
	);
}
