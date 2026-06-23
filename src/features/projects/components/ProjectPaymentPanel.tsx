'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Select } from '@/components/atoms/Select';
import { createProjectPayment } from '@/features/projects/actions/project-payment.actions';
import { parseMoneyInput } from '@/lib/money';
import type { PaymentMethod } from '@/lib/supabase/database.types';

interface IProjectPaymentPanelProps {
	projectId: string;
	paymentMethods: PaymentMethod[];
	defaultPaidAt: string;
}

export function ProjectPaymentPanel({
	projectId,
	paymentMethods,
	defaultPaidAt,
}: IProjectPaymentPanelProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [amount, setAmount] = useState('');
	const [paidAt, setPaidAt] = useState(defaultPaidAt);
	const [paymentMethodId, setPaymentMethodId] = useState(
		paymentMethods.find((method) => method.is_default)?.id ?? '',
	);
	const [notes, setNotes] = useState('');

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const parsedAmount = parseMoneyInput(amount);

		if (parsedAmount == null || parsedAmount <= 0) {
			toast.error('مبلغ معتبر وارد کن.');
			return;
		}

		if (!paidAt) {
			toast.error('تاریخ پرداخت الزامی است.');
			return;
		}

		startTransition(async () => {
			const result = await createProjectPayment({
				projectId,
				amount: parsedAmount,
				paidAt,
				paymentMethodId: paymentMethodId || null,
				notes: notes.trim() || undefined,
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			setAmount('');
			setNotes('');
			router.refresh();
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<p className='text-sm text-muted-foreground'>
				پیش‌پرداخت اینجا ثبت می‌شود. با پرداخت‌شده کردن فاکتور، خودکار تسویه می‌شود و در تراز
				نمایش داده نمی‌شود.
			</p>

			<div className='grid gap-4 sm:grid-cols-2'>
				<Input
					label='مبلغ دریافتی'
					inputMode='numeric'
					placeholder='مثلاً ۵۰۰۰۰۰۰'
					value={amount}
					onChange={(event) => setAmount(event.target.value)}
				/>
				<JalaliDatePicker label='تاریخ دریافت' value={paidAt} onChange={setPaidAt} />
			</div>

			<Select
				label='روش پرداخت (اختیاری)'
				value={paymentMethodId}
				onChange={(event) => setPaymentMethodId(event.target.value)}
			>
				<option value=''>بدون روش پرداخت</option>
				{paymentMethods.map((method) => (
					<option key={method.id} value={method.id}>
						{method.label} ({method.type === 'bank' ? 'بانکی' : 'کریپتو'})
					</option>
				))}
			</Select>

			<Input
				label='یادداشت (اختیاری)'
				value={notes}
				onChange={(event) => setNotes(event.target.value)}
				placeholder='مثلاً پیش‌پرداخت فاز اول'
			/>

			<Button type='submit' disabled={pending}>
				ثبت پرداخت
			</Button>
		</form>
	);
}
