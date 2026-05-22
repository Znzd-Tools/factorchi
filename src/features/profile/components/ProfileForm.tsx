'use client';

import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { CURRENCIES } from '@/features/invoice/constants/currencies';
import {
	type IAuthActionState,
	updateProfileAction,
} from '@/features/auth/actions/auth.actions';

interface IProfileFormProps {
	email: string;
	fullName: string;
	defaultCurrency: string;
}

const initialState: IAuthActionState = {};

export function ProfileForm({ email, fullName, defaultCurrency }: IProfileFormProps) {
	const [state, formAction, pending] = useActionState(updateProfileAction, initialState);

	useEffect(() => {
		if (state.error) {
			toast.error(state.error);
		}

		if (state.success) {
			toast.success(state.success);
		}
	}, [state.error, state.success]);

	return (
		<form action={formAction} className='space-y-4'>
			<Input label='ایمیل' name='email' value={email} disabled dir='ltr' readOnly />
			<Input
				label='نام کامل'
				name='fullName'
				defaultValue={fullName}
				autoComplete='name'
			/>
			<Select label='ارز پیش‌فرض' name='defaultCurrency' defaultValue={defaultCurrency}>
				{Object.entries(CURRENCIES).map(([code, config]) => (
					<option key={code} value={code}>
						{config.label}
					</option>
				))}
			</Select>
			<Button type='submit' disabled={pending}>
				{pending ? 'در حال ذخیره...' : 'ذخیره پروفایل'}
			</Button>
		</form>
	);
}
