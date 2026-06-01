'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import { monthlyGoalsSchema } from '@/features/goals/schemas/goals.schema';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export interface IGoalsActionState {
	error?: string;
	success?: string;
}

export async function updateMonthlyGoalsAction(
	_prevState: IGoalsActionState,
	formData: FormData,
): Promise<IGoalsActionState> {
	const parsed = monthlyGoalsSchema.safeParse({
		hoursGoal: formData.get('hoursGoal'),
		paidGoal: formData.get('paidGoal'),
	});

	if (!parsed.success) {
		return { error: 'مقادیر هدف نامعتبر است.' };
	}

	const user = await requireUser();
	const supabase = await createClient();

	const { error } = await supabase
		.from('profiles')
		.update({
			monthly_hours_goal: parsed.data.hoursGoal,
			monthly_paid_goal: parsed.data.paidGoal,
			updated_at: new Date().toISOString(),
		})
		.eq('id', user.id);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.dashboard);
	revalidatePath(ROUTES.profile);

	return { success: 'اهداف ماه ذخیره شد.' };
}
