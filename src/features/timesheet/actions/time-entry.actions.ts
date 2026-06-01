'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	createTimeEntrySchema,
	deleteTimeEntrySchema,
	updateTimeEntrySchema,
} from '@/features/timesheet/schemas/time-entry.schema';
import { detectTimeEntryCelebration } from '@/features/engagement/utils/detect-celebration';
import type { CelebrationId } from '@/features/engagement/types/celebration';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export interface ITimeEntryActionState {
	error?: string;
	success?: string;
	celebration?: CelebrationId;
}

async function revalidateProjectPaths(projectId: string) {
	revalidatePath(ROUTES.project(projectId));
	revalidatePath(ROUTES.projectTimesheet(projectId));
}

export async function createTimeEntry(input: unknown): Promise<ITimeEntryActionState> {
	const parsed = createTimeEntrySchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('id, type, hourly_rate, user_id')
		.eq('id', parsed.data.projectId)
		.single();

	if (projectError || !project || project.user_id !== user.id) {
		return { error: 'پروژه یافت نشد.' };
	}

	if (project.type !== 'hourly' || project.hourly_rate == null) {
		return { error: 'ثبت ساعت فقط برای پروژه‌های ساعتی مجاز است.' };
	}

	const { error } = await supabase.from('time_entries').insert({
		project_id: parsed.data.projectId,
		user_id: user.id,
		work_date: parsed.data.workDate,
		hours: parsed.data.hours,
		rate_at_entry: project.hourly_rate,
		description: parsed.data.description,
	});

	if (error) {
		return { error: error.message };
	}

	const { data: workDates } = await supabase
		.from('time_entries')
		.select('work_date')
		.eq('user_id', user.id);

	const celebration = detectTimeEntryCelebration((workDates ?? []).map((row) => row.work_date));

	await revalidateProjectPaths(parsed.data.projectId);
	revalidatePath(ROUTES.dashboard);

	return {
		success: 'ساعت کار ثبت شد.',
		celebration,
	};
}

export async function updateTimeEntry(input: unknown): Promise<ITimeEntryActionState> {
	const parsed = updateTimeEntrySchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { data: existing, error: existingError } = await supabase
		.from('time_entries')
		.select('id, project_id, user_id')
		.eq('id', parsed.data.id)
		.single();

	if (existingError || !existing || existing.user_id !== user.id) {
		return { error: 'ردیف یافت نشد.' };
	}

	const { error } = await supabase
		.from('time_entries')
		.update({
			work_date: parsed.data.workDate,
			hours: parsed.data.hours,
			description: parsed.data.description,
		})
		.eq('id', parsed.data.id)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	await revalidateProjectPaths(existing.project_id);
	return { success: 'ردیف به‌روزرسانی شد.' };
}

export async function deleteTimeEntry(input: unknown): Promise<ITimeEntryActionState> {
	const parsed = deleteTimeEntrySchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { data: existing, error: existingError } = await supabase
		.from('time_entries')
		.select('id, user_id')
		.eq('id', parsed.data.id)
		.eq('project_id', parsed.data.projectId)
		.single();

	if (existingError || !existing || existing.user_id !== user.id) {
		return { error: 'ردیف یافت نشد.' };
	}

	const { error } = await supabase
		.from('time_entries')
		.delete()
		.eq('id', parsed.data.id)
		.eq('user_id', user.id);

	if (error) {
		return { error: error.message };
	}

	await revalidateProjectPaths(parsed.data.projectId);
	return { success: 'ردیف حذف شد.' };
}
