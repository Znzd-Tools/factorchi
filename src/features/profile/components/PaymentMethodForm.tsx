'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Coins } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import {
	createPaymentMethod,
	updatePaymentMethod,
} from '@/features/profile/actions/payment-method.actions';
import {
	type IBankPaymentDetails,
	type ICryptoPaymentDetails,
	type IPaymentMethodFormValues,
	getDefaultPaymentMethodValues,
	paymentMethodFormSchema,
} from '@/features/profile/schemas/payment-method.schema';

interface IPaymentMethodFormProps {
	initialValues?: IPaymentMethodFormValues;
	paymentMethodId?: string;
	onSuccess: () => void;
	onCancel: () => void;
}

export function PaymentMethodForm({
	initialValues,
	paymentMethodId,
	onSuccess,
	onCancel,
}: IPaymentMethodFormProps) {
	const [submitting, setSubmitting] = useState(false);
	const isEditing = Boolean(paymentMethodId);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<IPaymentMethodFormValues>({
		resolver: zodResolver(paymentMethodFormSchema),
		defaultValues: initialValues ?? getDefaultPaymentMethodValues('bank'),
	});

	const paymentType = watch('type');
	const bankDetailsErrors =
		paymentType === 'bank' && errors.details && typeof errors.details === 'object'
			? (errors.details as Partial<Record<keyof IBankPaymentDetails, { message?: string }>>)
			: undefined;
	const cryptoDetailsErrors =
		paymentType === 'crypto' && errors.details && typeof errors.details === 'object'
			? (errors.details as Partial<Record<keyof ICryptoPaymentDetails, { message?: string }>>)
			: undefined;
	const detailsRootError =
		errors.details && 'message' in errors.details
			? String(errors.details.message)
			: undefined;

	const onSubmit = handleSubmit(async (values) => {
		setSubmitting(true);

		try {
			const result = isEditing
				? await updatePaymentMethod({ id: paymentMethodId!, ...values })
				: await createPaymentMethod(values);

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success ?? 'ذخیره شد.');
			onSuccess();
		} finally {
			setSubmitting(false);
		}
	});

	const handleTypeChange = (nextType: 'bank' | 'crypto') => {
		setValue('type', nextType);
		setValue(
			'details',
			nextType === 'bank'
				? getDefaultPaymentMethodValues('bank').details
				: getDefaultPaymentMethodValues('crypto').details,
		);
	};

	return (
		<form onSubmit={onSubmit} className='space-y-4'>
			<Input
				label='نام روش پرداخت'
				placeholder='مثلاً حساب اصلی سامان'
				error={errors.label?.message}
				{...register('label')}
			/>

			<div className='space-y-2'>
				<span className='block text-sm text-muted-foreground'>نوع</span>
				<div className='flex flex-wrap gap-3'>
					<label className='flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2'>
						<input
							type='radio'
							checked={paymentType === 'bank'}
							onChange={() => handleTypeChange('bank')}
							className='text-blue-600'
						/>
						<Building2 size={16} />
						<span className='text-sm'>حساب بانکی</span>
					</label>
					<label className='flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2'>
						<input
							type='radio'
							checked={paymentType === 'crypto'}
							onChange={() => handleTypeChange('crypto')}
							className='text-blue-600'
						/>
						<Coins size={16} />
						<span className='text-sm'>ارز دیجیتال</span>
					</label>
				</div>
			</div>

			{paymentType === 'bank' ? (
				<div className='space-y-3 rounded-xl border border-border bg-muted p-4'>
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
						<Input label='نام بانک' placeholder='مثلاً سامان' {...register('details.bankName')} />
						<Input label='نام صاحب حساب' {...register('details.accountName')} />
					</div>
					<Input
						label='شماره کارت'
						dir='ltr'
						className='text-left tabular-nums'
						{...register('details.cardNumber')}
					/>
					<Input
						label='شماره شبا'
						placeholder='مثال: IR120170000000000000000'
						dir='ltr'
						className='text-left tabular-nums'
						error={bankDetailsErrors?.shebaNumber?.message ?? detailsRootError}
						{...register('details.shebaNumber')}
					/>
					<Input
						label='شماره حساب'
						dir='ltr'
						className='text-left tabular-nums'
						error={bankDetailsErrors?.accountNumber?.message}
						{...register('details.accountNumber')}
					/>
					<p className='text-xs text-muted-foreground'>حداقل یکی از شماره شبا یا شماره حساب الزامی است.</p>
				</div>
			) : (
				<div className='space-y-3 rounded-xl border border-border bg-muted p-4'>
					<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
						<Input
							label='نوع ارز'
							placeholder='مثلاً USDT'
							dir='ltr'
							className='text-left'
							error={cryptoDetailsErrors?.coin?.message ?? detailsRootError}
							{...register('details.coin')}
						/>
						<Input
							label='شبکه'
							placeholder='مثلاً TRC20'
							dir='ltr'
							className='text-left'
							{...register('details.network')}
						/>
					</div>
					<Input
						label='آدرس کیف پول'
						dir='ltr'
						className='text-left'
						error={cryptoDetailsErrors?.address?.message}
						{...register('details.address')}
					/>
				</div>
			)}

			<label className='flex cursor-pointer items-center gap-2'>
				<input type='checkbox' className='h-4 w-4 text-blue-600' {...register('isDefault')} />
				<span className='text-sm'>پیش‌فرض</span>
			</label>

			<div className='flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end'>
				<Button type='button' variant='ghost' onClick={onCancel} disabled={submitting}>
					انصراف
				</Button>
				<Button type='submit' disabled={submitting}>
					{submitting ? 'در حال ذخیره...' : isEditing ? 'به‌روزرسانی' : 'افزودن'}
				</Button>
			</div>
		</form>
	);
}
