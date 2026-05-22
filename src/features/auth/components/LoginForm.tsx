'use client';

import { useActionState } from 'react';

import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { ROUTES } from '@/config/routes';
import {
	type IAuthActionState,
	signInAction,
} from '@/features/auth/actions/auth.actions';

const initialState: IAuthActionState = {};

export function LoginForm() {
	const [state, formAction, pending] = useActionState(signInAction, initialState);

	return (
		<form action={formAction} className='space-y-4'>
			<Input label='ایمیل' name='email' type='email' autoComplete='email' required dir='ltr' />
			<Input
				label='رمز عبور'
				name='password'
				type='password'
				autoComplete='current-password'
				required
				dir='ltr'
			/>
			{state.error && <p className='text-sm text-red-500'>{state.error}</p>}
			<Button type='submit' className='w-full' disabled={pending}>
				{pending ? 'در حال ورود...' : 'ورود'}
			</Button>
			<p className='text-center text-sm text-slate-500'>
				حساب ندارید؟{' '}
				<Link href={ROUTES.register} className='text-blue-600 hover:underline'>
					ثبت‌نام
				</Link>
			</p>
		</form>
	);
}
