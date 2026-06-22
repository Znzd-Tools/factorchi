'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Select } from '@/components/atoms/Select';
import {
	createProjectPayment,
	deleteProjectPayment,
} from '@/features/projects/actions/project-payment.actions';
import type { ProjectPaymentWithMethod } from '@/features/projects/queries/project-payment.queries';
import { getUnappliedPaymentAmount } from '@/features/projects/utils/apply-advance-payments';
import { formatJalaliDate } from '@/lib/jalali';
import { formatMoney, parseMoneyInput } from '@/lib/money';
import type { PaymentMethod } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IProjectPaymentPanelProps {
	projectId: string;
	currencySymbol: string;
	paymentMethods: PaymentMethod[];
	initialPayments: ProjectPaymentWithMethod[];
	defaultPaidAt: string;
}

export function ProjectPaymentPanel({
	projectId,
	currencySymbol,
	paymentMethods,
	initialPayments,
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

	const handleDelete = (paymentId: string) => {
		startTransition(async () => {
			const result = await deleteProjectPayment({ id: paymentId, projectId });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			router.refresh();
		});
	};

	return (
		<div className='space-y-5'>
			<form onSubmit={handleSubmit} className='space-y-4'>
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

			{initialPayments.length > 0 ? (
				<ul className='divide-y divide-border rounded-2xl border border-border'>
					{initialPayments.map((payment) => {
						const unappliedAmount = getUnappliedPaymentAmount(payment);

						return (
						<li
							key={payment.id}
							className='flex items-start justify-between gap-3 px-4 py-3'
						>
							<div className='min-w-0 space-y-1'>
								<p className='font-bold tabular-nums text-foreground'>
									{formatMoney(unappliedAmount)} {currencySymbol}
								</p>
								<p className='text-xs text-muted-foreground'>
									{formatJalaliDate(payment.paid_at)}
									{payment.payment_method
										? ` · ${payment.payment_method.label}`
										: ''}
								</p>
								{payment.notes && (
									<p className='text-sm text-muted-foreground'>{payment.notes}</p>
								)}
							</div>
							<Button
								type='button'
								variant='ghost'
								size='sm'
								className={cn('shrink-0 text-destructive')}
								disabled={pending}
								onClick={() => handleDelete(payment.id)}
								aria-label='حذف پرداخت'
							>
								<Trash2 size={16} />
							</Button>
						</li>
						);
					})}
				</ul>
			) : (
				<p className='text-sm text-muted-foreground'>
					پیش‌پرداخت فعالی نیست. وقتی فاکتور را پرداخت‌شده کنی، پیش‌پرداخت قبلی خودکار تسویه می‌شود.
				</p>
			)}
		</div>
	);
}
