'use client';

import { useActionState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ROUTES } from '@/config/routes';
import {
	type IAuthActionState,
	signUpAction,
} from '@/features/auth/actions/auth.actions';

const initialState: IAuthActionState = {};

export function RegisterForm() {
	const [state, formAction, pending] = useActionState(signUpAction, initialState);

	return (
		<form action={formAction} className='space-y-4'>
			<Input label='نام کامل' name='fullName' autoComplete='name' />
			<Input label='ایمیل' name='email' type='email' autoComplete='email' required dir='ltr' />
			<Input
				label='رمز عبور'
				name='password'
				type='password'
				autoComplete='new-password'
				required
				dir='ltr'
			/>
			{state.error && <p className='text-sm text-red-500'>{state.error}</p>}
			<Button type='submit' className='w-full' disabled={pending}>
				{pending ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
			</Button>
			<p className='text-center text-sm text-slate-500'>
				حساب دارید؟{' '}
				<Link href={ROUTES.login} className='text-blue-600 hover:underline'>
					ورود
				</Link>
			</p>
		</form>
	);
}
