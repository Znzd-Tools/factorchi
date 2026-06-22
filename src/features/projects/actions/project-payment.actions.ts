'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	createProjectPaymentSchema,
	deleteProjectPaymentSchema,
} from '@/features/projects/schemas/project-payment.schema';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export interface IProjectPaymentActionState {
	error?: string;
	success?: string;
}

async function revalidatePaymentPaths(projectId: string) {
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

export async function createProjectPayment(
	input: unknown,
): Promise<IProjectPaymentActionState> {
	const parsed = createProjectPaymentSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();

	if (!(await assertProjectOwnership(parsed.data.projectId, user.id))) {
		return { error: 'پروژه یافت نشد.' };
	}

	const supabase = await createClient();
	const { error } = await supabase.from('project_payments').insert({
		project_id: parsed.data.projectId,
		user_id: user.id,
		amount: parsed.data.amount,
		paid_at: parsed.data.paidAt,
		payment_method_id: parsed.data.paymentMethodId ?? null,
		notes: parsed.data.notes?.trim() || null,
	});

	if (error) {
		return { error: error.message };
	}

	await revalidatePaymentPaths(parsed.data.projectId);
	return { success: 'پرداخت ثبت شد.' };
}

export async function deleteProjectPayment(
	input: unknown,
): Promise<IProjectPaymentActionState> {
	const parsed = deleteProjectPaymentSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { data: payment, error: fetchError } = await supabase
		.from('project_payments')
		.select('id, project_id, user_id, applied_amount')
		.eq('id', parsed.data.id)
		.eq('project_id', parsed.data.projectId)
		.single();

	if (fetchError || !payment || payment.user_id !== user.id) {
		return { error: 'پرداخت یافت نشد.' };
	}

	if (Number(payment.applied_amount) > 0) {
		return { error: 'پرداخت تسویه‌شده با فاکتور قابل حذف نیست.' };
	}

	const { error } = await supabase.from('project_payments').delete().eq('id', parsed.data.id);

	if (error) {
		return { error: error.message };
	}

	await revalidatePaymentPaths(parsed.data.projectId);
	return { success: 'پرداخت حذف شد.' };
}
