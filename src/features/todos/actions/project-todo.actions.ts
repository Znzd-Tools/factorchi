'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	createProjectTodoSchema,
	projectTodoIdSchema,
} from '@/features/todos/schemas/project-todo.schema';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export interface IProjectTodoActionState {
	error?: string;
	success?: string;
}

async function revalidateTodoPaths(projectId: string) {
	revalidatePath(ROUTES.projectTodos(projectId));
	revalidatePath(ROUTES.projectTimesheet(projectId));
	revalidatePath(ROUTES.project(projectId));
}

async function assertProjectOwnership(projectId: string, userId: string) {
	const supabase = await createClient();
	const { data: project, error } = await supabase
		.from('projects')
		.select('id')
		.eq('id', projectId)
		.eq('user_id', userId)
		.single();

	return !error && project != null;
}

export async function createProjectTodo(input: unknown): Promise<IProjectTodoActionState> {
	const parsed = createProjectTodoSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();

	if (!(await assertProjectOwnership(parsed.data.projectId, user.id))) {
		return { error: 'پروژه یافت نشد.' };
	}

	const supabase = await createClient();
	const { error } = await supabase.from('project_todos').insert({
		project_id: parsed.data.projectId,
		user_id: user.id,
		title: parsed.data.title,
	});

	if (error) {
		return { error: error.message };
	}

	await revalidateTodoPaths(parsed.data.projectId);
	return { success: 'کار اضافه شد.' };
}

export async function completeProjectTodo(input: unknown): Promise<IProjectTodoActionState> {
	const parsed = projectTodoIdSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { data: todo, error: fetchError } = await supabase
		.from('project_todos')
		.select('id, project_id, user_id, is_done')
		.eq('id', parsed.data.id)
		.eq('project_id', parsed.data.projectId)
		.single();

	if (fetchError || !todo || todo.user_id !== user.id) {
		return { error: 'کار یافت نشد.' };
	}

	if (todo.is_done) {
		return { success: 'این کار قبلاً انجام شده.' };
	}

	const { error } = await supabase
		.from('project_todos')
		.update({ is_done: true, completed_at: new Date().toISOString() })
		.eq('id', parsed.data.id)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	await revalidateTodoPaths(parsed.data.projectId);
	return { success: 'انجام شد.' };
}

export async function reopenProjectTodo(input: unknown): Promise<IProjectTodoActionState> {
	const parsed = projectTodoIdSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { error } = await supabase
		.from('project_todos')
		.update({ is_done: false, completed_at: null })
		.eq('id', parsed.data.id)
		.eq('project_id', parsed.data.projectId)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	await revalidateTodoPaths(parsed.data.projectId);
	return { success: 'کار دوباره باز شد.' };
}

export async function deleteProjectTodo(input: unknown): Promise<IProjectTodoActionState> {
	const parsed = projectTodoIdSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { error } = await supabase
		.from('project_todos')
		.delete()
		.eq('id', parsed.data.id)
		.eq('project_id', parsed.data.projectId)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	await revalidateTodoPaths(parsed.data.projectId);
	return { success: 'کار حذف شد.' };
}
