'use client';

import { CreditCard, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Modal } from '@/components/atoms/Modal';
import {
	deletePaymentMethod,
	setDefaultPaymentMethod,
} from '@/features/profile/actions/payment-method.actions';
import { PaymentMethodForm } from '@/features/profile/components/PaymentMethodForm';
import {
	type IBankPaymentDetails,
	type ICryptoPaymentDetails,
	type IPaymentMethodFormValues,
	defaultBankDetails,
	defaultCryptoDetails,
	normalizeBankDetails,
} from '@/features/profile/schemas/payment-method.schema';
import type { PaymentMethod } from '@/lib/supabase/database.types';

interface IPaymentMethodsListProps {
	paymentMethods: PaymentMethod[];
}

function toFormValues(method: PaymentMethod): IPaymentMethodFormValues {
	if (method.type === 'bank') {
		const details = normalizeBankDetails(method.details as Partial<IBankPaymentDetails>);

		return {
			type: 'bank',
			label: method.label,
			isDefault: method.is_default,
			details: {
				bankName: details.bankName ?? defaultBankDetails.bankName,
				accountName: details.accountName ?? defaultBankDetails.accountName,
				cardNumber: details.cardNumber ?? defaultBankDetails.cardNumber,
				shebaNumber: details.shebaNumber ?? defaultBankDetails.shebaNumber,
				accountNumber: details.accountNumber ?? defaultBankDetails.accountNumber,
			},
		};
	}

	const details = method.details as ICryptoPaymentDetails;

	return {
		type: 'crypto',
		label: method.label,
		isDefault: method.is_default,
		details: {
			coin: details.coin ?? defaultCryptoDetails.coin,
			network: details.network ?? defaultCryptoDetails.network,
			address: details.address ?? defaultCryptoDetails.address,
		},
	};
}

function getMethodSummary(method: PaymentMethod) {
	if (method.type === 'bank') {
		const details = normalizeBankDetails(method.details as Partial<IBankPaymentDetails>);
		const parts = [
			details.bankName,
			details.cardNumber,
			details.shebaNumber,
			details.accountNumber,
		].filter(Boolean);

		return parts.length > 0 ? parts.join(' · ') : 'حساب بانکی';
	}

	const details = method.details as ICryptoPaymentDetails;
	const parts = [details.coin, details.network, details.address].filter(Boolean);

	return parts.length > 0 ? parts.join(' · ') : 'ارز دیجیتال';
}

export function PaymentMethodsList({ paymentMethods }: IPaymentMethodsListProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [createOpen, setCreateOpen] = useState(false);
	const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
	const [deletingMethod, setDeletingMethod] = useState<PaymentMethod | null>(null);

	const refresh = () => {
		startTransition(() => {
			router.refresh();
		});
	};

	const handleDelete = async () => {
		if (!deletingMethod) {
			return;
		}

		const result = await deletePaymentMethod(deletingMethod.id);

		if (result.error) {
			toast.error(result.error);
			return;
		}

		toast.success(result.success ?? 'حذف شد.');
		setDeletingMethod(null);
		refresh();
	};

	const handleSetDefault = async (id: string) => {
		const result = await setDefaultPaymentMethod(id);

		if (result.error) {
			toast.error(result.error);
			return;
		}

		toast.success(result.success ?? 'تنظیم شد.');
		refresh();
	};

	const handleFormSuccess = () => {
		setCreateOpen(false);
		setEditingMethod(null);
		refresh();
	};

	return (
		<div className='space-y-6'>
			<div className='flex items-center justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-black text-foreground'>روش‌های پرداخت</h1>
					<p className='mt-1 text-sm text-muted-foreground'>
						حساب‌های بانکی و آدرس‌های کریپتو برای درج در فاکتورها
					</p>
				</div>
				<Button onClick={() => setCreateOpen(true)} haptic='medium'>
					<Plus size={16} />
					افزودن
				</Button>
			</div>

			{paymentMethods.length === 0 ? (
				<Card
					title='روش پرداختی ثبت نشده'
					description='برای استفاده در فاکتورها، یک روش پرداخت اضافه کنید.'
				>
					<Button onClick={() => setCreateOpen(true)}>
						<Plus size={16} />
						افزودن روش پرداخت
					</Button>
				</Card>
			) : (
				<div className='grid gap-4'>
					{paymentMethods.map((method) => (
						<Card key={method.id} className='relative'>
							<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
								<div className='space-y-2'>
									<div className='flex flex-wrap items-center gap-2'>
										<CreditCard size={18} className='text-slate-400' />
										<h3 className='font-bold text-slate-800'>{method.label}</h3>
										<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600'>
											{method.type === 'bank' ? 'بانکی' : 'کریپتو'}
										</span>
										{method.is_default && (
											<span className='inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800'>
												<Star size={12} />
												پیش‌فرض
											</span>
										)}
									</div>
									<p className='text-sm text-slate-500' dir='ltr'>
										{getMethodSummary(method)}
									</p>
								</div>

								<div className='flex flex-wrap gap-2'>
									{!method.is_default && (
										<Button
											variant='secondary'
											size='sm'
											disabled={isPending}
											onClick={() => handleSetDefault(method.id)}
										>
											<Star size={14} />
											پیش‌فرض
										</Button>
									)}
									<Button
										variant='secondary'
										size='sm'
										disabled={isPending}
										onClick={() => setEditingMethod(method)}
									>
										<Pencil size={14} />
										ویرایش
									</Button>
									<Button
										variant='danger'
										size='sm'
										disabled={isPending}
										onClick={() => setDeletingMethod(method)}
									>
										<Trash2 size={14} />
										حذف
									</Button>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			<Modal open={createOpen} onClose={() => setCreateOpen(false)} title='افزودن روش پرداخت'>
				<PaymentMethodForm onSuccess={handleFormSuccess} onCancel={() => setCreateOpen(false)} />
			</Modal>

			<Modal
				open={Boolean(editingMethod)}
				onClose={() => setEditingMethod(null)}
				title='ویرایش روش پرداخت'
			>
				{editingMethod && (
					<PaymentMethodForm
						key={editingMethod.id}
						paymentMethodId={editingMethod.id}
						initialValues={toFormValues(editingMethod)}
						onSuccess={handleFormSuccess}
						onCancel={() => setEditingMethod(null)}
					/>
				)}
			</Modal>

			<Modal
				open={Boolean(deletingMethod)}
				onClose={() => setDeletingMethod(null)}
				title='حذف روش پرداخت'
			>
				<div className='space-y-4'>
					<p className='text-sm text-slate-600'>
						آیا از حذف «{deletingMethod?.label}» مطمئن هستید؟
					</p>
					<div className='flex justify-end gap-2'>
						<Button variant='ghost' onClick={() => setDeletingMethod(null)} disabled={isPending}>
							انصراف
						</Button>
						<Button variant='danger' onClick={handleDelete} disabled={isPending}>
							{isPending ? 'در حال حذف...' : 'حذف'}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
