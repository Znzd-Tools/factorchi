'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { createClient } from '@/lib/supabase/server';

export interface IAuthActionState {
	error?: string;
	success?: string;
}

export async function signUpAction(
	_prevState: IAuthActionState,
	formData: FormData,
): Promise<IAuthActionState> {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');
	const fullName = String(formData.get('fullName') ?? '').trim();

	if (!email || !password) {
		return { error: 'ایمیل و رمز عبور الزامی است.' };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			data: { full_name: fullName },
		},
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.dashboard);
	redirect(ROUTES.dashboard);
}

export async function signInAction(
	_prevState: IAuthActionState,
	formData: FormData,
): Promise<IAuthActionState> {
	const email = String(formData.get('email') ?? '').trim();
	const password = String(formData.get('password') ?? '');

	if (!email || !password) {
		return { error: 'ایمیل و رمز عبور الزامی است.' };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.dashboard);
	redirect(ROUTES.dashboard);
}

export async function signOutAction() {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect(ROUTES.login);
}

export async function updateProfileAction(
	_prevState: IAuthActionState,
	formData: FormData,
): Promise<IAuthActionState> {
	const fullName = String(formData.get('fullName') ?? '').trim();
	const defaultCurrency = String(formData.get('defaultCurrency') ?? 'toman');

	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { error } = await supabase.from('profiles').upsert({
		id: user.id,
		full_name: fullName,
		default_currency: defaultCurrency,
	});

	if (error) {
		return { error: error.message };
	}

	revalidatePath(ROUTES.profile);
	return { success: 'پروفایل ذخیره شد.' };
}
