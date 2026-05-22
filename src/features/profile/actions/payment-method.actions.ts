'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	paymentMethodFormSchema,
	updatePaymentMethodSchema,
} from '@/features/profile/schemas/payment-method.schema';
import { createClient } from '@/lib/supabase/server';

export interface IPaymentMethodActionResult {
	error?: string;
	success?: string;
}

async function getAuthenticatedUserId() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	return { supabase, userId: user?.id ?? null };
}

async function clearDefaultPaymentMethods(
	supabase: Awaited<ReturnType<typeof createClient>>,
	userId: string,
) {
	const { error } = await supabase
		.from('payment_methods')
		.update({ is_default: false })
		.eq('user_id', userId);

	return error;
}

export async function createPaymentMethod(
	input: unknown,
): Promise<IPaymentMethodActionResult> {
	const parsed = paymentMethodFormSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'اطلاعات وارد شده معتبر نیست.' };
	}

	const { supabase, userId } = await getAuthenticatedUserId();

	if (!userId) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { type, label, details, isDefault } = parsed.data;

	if (isDefault) {
		const clearError = await clearDefaultPaymentMethods(supabase, userId);

		if (clearError) {
			return { error: clearError.message };
		}
	}

	const { error } = await supabase.from('payment_methods').insert({
		user_id: userId,
		type,
		label,
		details,
		is_default: isDefault ?? false,
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.paymentMethods);
	return { success: 'روش پرداخت اضافه شد.' };
}

export async function updatePaymentMethod(
	input: unknown,
): Promise<IPaymentMethodActionResult> {
	const parsed = updatePaymentMethodSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'اطلاعات وارد شده معتبر نیست.' };
	}

	const { supabase, userId } = await getAuthenticatedUserId();

	if (!userId) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { id, type, label, details, isDefault } = parsed.data;

	if (isDefault) {
		const clearError = await clearDefaultPaymentMethods(supabase, userId);

		if (clearError) {
			return { error: clearError.message };
		}
	}

	const { error } = await supabase
		.from('payment_methods')
		.update({
			type,
			label,
			details,
			is_default: isDefault ?? false,
		})
		.eq('id', id)
		.eq('user_id', userId);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.paymentMethods);
	return { success: 'روش پرداخت به‌روزرسانی شد.' };
}

export async function deletePaymentMethod(id: string): Promise<IPaymentMethodActionResult> {
	if (!id) {
		return { error: 'شناسه روش پرداخت الزامی است.' };
	}

	const { supabase, userId } = await getAuthenticatedUserId();

	if (!userId) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { error } = await supabase
		.from('payment_methods')
		.delete()
		.eq('id', id)
		.eq('user_id', userId);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.paymentMethods);
	return { success: 'روش پرداخت حذف شد.' };
}

export async function setDefaultPaymentMethod(id: string): Promise<IPaymentMethodActionResult> {
	if (!id) {
		return { error: 'شناسه روش پرداخت الزامی است.' };
	}

	const { supabase, userId } = await getAuthenticatedUserId();

	if (!userId) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const clearError = await clearDefaultPaymentMethods(supabase, userId);

	if (clearError) {
		return { error: clearError.message };
	}

	const { error } = await supabase
		.from('payment_methods')
		.update({ is_default: true })
		.eq('id', id)
		.eq('user_id', userId);

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.paymentMethods);
	return { success: 'روش پرداخت پیش‌فرض تنظیم شد.' };
}
