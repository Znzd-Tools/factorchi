import { createClient } from '@/lib/supabase/server';
import type { ProjectTodo } from '@/lib/supabase/database.types';

export async function listProjectTodos(projectId: string): Promise<ProjectTodo[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('project_todos')
		.select('*')
		.eq('project_id', projectId)
		.order('is_done', { ascending: true })
		.order('created_at', { ascending: false });

	if (error) {
		return [];
	}

	return data ?? [];
}

export async function listOpenProjectTodos(
	projectId: string,
): Promise<Pick<ProjectTodo, 'id' | 'title'>[]> {
	const supabase = await createClient();

	const { data, error } = await supabase
		.from('project_todos')
		.select('id, title')
		.eq('project_id', projectId)
		.eq('is_done', false)
		.order('created_at', { ascending: true });

	if (error) {
		return [];
	}

	return data ?? [];
}
