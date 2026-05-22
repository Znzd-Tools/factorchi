'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import {
	type ProjectFormValues,
	projectFormSchema,
} from '@/features/projects/schemas/project.schema';
import { createClient } from '@/lib/supabase/server';

export interface IProjectActionState {
	error?: string;
	success?: string;
}

function toProjectFields(values: ProjectFormValues) {
	return {
		name: values.name,
		client_name: values.client_name,
		client_contact: values.client_contact?.trim() || null,
		type: values.type,
		currency: values.currency,
		notes: values.notes?.trim() || null,
		hourly_rate: values.type === 'hourly' ? (values.hourly_rate ?? null) : null,
		total_amount: values.type === 'total' ? (values.total_amount ?? null) : null,
	};
}

export async function createProject(
	values: ProjectFormValues,
): Promise<IProjectActionState> {
	const parsed = projectFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است.' };
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { data, error } = await supabase
		.from('projects')
		.insert({ ...toProjectFields(parsed.data), user_id: user.id })
		.select('id')
		.single();

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.projects);
	redirect(ROUTES.project(data.id));
}

export async function updateProject(
	projectId: string,
	values: ProjectFormValues,
): Promise<IProjectActionState> {
	const parsed = projectFormSchema.safeParse(values);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'اطلاعات نامعتبر است.' };
	}

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { error } = await supabase
		.from('projects')
		.update(toProjectFields(parsed.data))
		.eq('id', projectId)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.projects);
	revalidatePath(ROUTES.project(projectId));
	revalidatePath(ROUTES.projectSettings(projectId));

	return { success: 'پروژه ذخیره شد.' };
}

export async function archiveProject(projectId: string): Promise<IProjectActionState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { error } = await supabase
		.from('projects')
		.update({ status: 'archived' })
		.eq('id', projectId)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.projects);
	revalidatePath(ROUTES.project(projectId));
	redirect(ROUTES.projects);
}
