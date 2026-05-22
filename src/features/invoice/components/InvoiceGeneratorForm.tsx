'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Select } from '@/components/atoms/Select';
import { ROUTES } from '@/config/routes';
import { createInvoice } from '@/features/invoice/actions/invoice.actions';
import { CURRENCIES } from '@/features/invoice/constants/currencies';
import type { CurrencyCode } from '@/features/invoice/interface/invoice.types';
import {
	hourlyInvoiceSchema,
	totalInvoiceSchema,
	type InvoiceGeneratorInput,
} from '@/features/invoice/schemas/invoice.schema';
import {
	calculateInvoiceTotals,
	generateHourlyLines,
	generateTotalLine,
} from '@/features/invoice/services/invoice-generator';
import { toFa } from '@/features/invoice/utils/format';
import type { PaymentMethod, Project, TimeEntry } from '@/lib/supabase/database.types';
import { formatMoney } from '@/lib/money';

interface IInvoiceGeneratorFormProps {
	project: Project;
	paymentMethods: PaymentMethod[];
	timeEntries?: Pick<TimeEntry, 'hours' | 'rate_at_entry' | 'work_date'>[];
}

export function InvoiceGeneratorForm({
	project,
	paymentMethods,
	timeEntries = [],
}: IInvoiceGeneratorFormProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const isHourly = project.type === 'hourly';

	const schema = isHourly ? hourlyInvoiceSchema : totalInvoiceSchema;

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<InvoiceGeneratorInput>({
		// zod v4 inferred input types differ from output; runtime validation is correct.
		resolver: zodResolver(schema) as never,
		defaultValues: {
			paymentMethodId: paymentMethods.find((method) => method.is_default)?.id ?? null,
			taxRate: 0,
			showProjectName: true,
			showOwnerName: true,
			periodStart: '',
			periodEnd: '',
			percentage: 10,
			altCurrencyEnabled: false,
			altCurrency: 'usd',
			exchangeMethod: 'divide',
			exchangeRate: undefined,
			notes: '',
		},
	});

	const watched = watch();
	const periodStart = watched.periodStart;
	const periodEnd = watched.periodEnd;
	const percentage = watched.percentage ?? 0;
	const taxRate = watched.taxRate ?? 0;
	const altCurrencyEnabled = watched.altCurrencyEnabled;
	const exchangeRate = watched.exchangeRate;
	const exchangeMethod = watched.exchangeMethod;

	const filteredEntries = useMemo(() => {
		if (!isHourly || !periodStart || !periodEnd) {
			return [];
		}

		return timeEntries.filter(
			(entry) => entry.work_date >= periodStart && entry.work_date <= periodEnd,
		);
	}, [isHourly, periodStart, periodEnd, timeEntries]);

	const previewLines = useMemo(() => {
		if (isHourly) {
			return generateHourlyLines(filteredEntries);
		}

		if (!project.total_amount || !percentage) {
			return [];
		}

		return [generateTotalLine(Number(project.total_amount), percentage)];
	}, [filteredEntries, isHourly, percentage, project.total_amount]);

	const previewTotals = useMemo(() => {
		const altConfig =
			altCurrencyEnabled && exchangeRate && exchangeMethod
				? { exchangeRate: Number(exchangeRate), exchangeMethod }
				: undefined;

		return calculateInvoiceTotals(previewLines, taxRate, altConfig);
	}, [altCurrencyEnabled, exchangeMethod, exchangeRate, previewLines, taxRate]);

	const currency = project.currency as CurrencyCode;

	const onSubmit = handleSubmit((values) => {
		startTransition(async () => {
			const result = await createInvoice({
				projectId: project.id,
				paymentMethodId: values.paymentMethodId ?? null,
				periodStart: values.periodStart,
				periodEnd: values.periodEnd,
				percentage: values.percentage,
				taxRate: values.taxRate ?? 0,
				showProjectName: values.showProjectName,
				showOwnerName: values.showOwnerName,
				notes: values.notes,
				altCurrency: values.altCurrencyEnabled ? values.altCurrency : null,
				exchangeRate: values.altCurrencyEnabled ? values.exchangeRate : null,
				exchangeMethod: values.altCurrencyEnabled ? values.exchangeMethod : null,
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success ?? 'فاکتور ایجاد شد.');
			if (result.invoiceId) {
				router.push(ROUTES.projectInvoice(project.id, result.invoiceId));
			} else {
				router.push(ROUTES.projectInvoices(project.id));
			}
		});
	});

	return (
		<form onSubmit={onSubmit} className='space-y-6'>
			{isHourly ? (
				<div className='grid gap-4 sm:grid-cols-2'>
					<JalaliDatePicker
						label='شروع بازه'
						value={periodStart ?? ''}
						onChange={(value) => setValue('periodStart', value, { shouldValidate: true })}
						error={errors.periodStart?.message}
					/>
					<JalaliDatePicker
						label='پایان بازه'
						value={periodEnd ?? ''}
						onChange={(value) => setValue('periodEnd', value, { shouldValidate: true })}
						error={errors.periodEnd?.message}
					/>
				</div>
			) : (
				<Input
					label='درصد از مبلغ کل پروژه'
					type='number'
					min={0.01}
					max={100}
					step={0.01}
					{...register('percentage', { valueAsNumber: true })}
					error={errors.percentage?.message}
				/>
			)}

			<div className='grid gap-4 sm:grid-cols-2'>
				<Input
					label='نرخ مالیات (%)'
					type='number'
					min={0}
					max={100}
					step={0.01}
					{...register('taxRate', { valueAsNumber: true })}
					error={errors.taxRate?.message}
				/>
				<Select label='روش پرداخت' {...register('paymentMethodId')}>
					<option value=''>بدون روش پرداخت</option>
					{paymentMethods.map((method) => (
						<option key={method.id} value={method.id}>
							{method.label} ({method.type === 'bank' ? 'بانکی' : 'کریپتو'})
						</option>
					))}
				</Select>
			</div>

			<div className='rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3'>
				<div className='grid gap-2 sm:grid-cols-2'>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input
							type='checkbox'
							{...register('showProjectName')}
							className='h-4 w-4 text-blue-600'
						/>
						<span className='text-sm font-bold text-slate-700'>نمایش نام پروژه در فاکتور</span>
					</label>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input
							type='checkbox'
							{...register('showOwnerName')}
							className='h-4 w-4 text-blue-600'
						/>
						<span className='text-sm font-bold text-slate-700'>نمایش نام کارفرما در فاکتور</span>
					</label>
				</div>

				<label className='flex items-center gap-2 cursor-pointer'>
					<input
						type='checkbox'
						{...register('altCurrencyEnabled')}
						className='h-4 w-4 text-blue-600'
					/>
					<span className='text-sm font-bold text-slate-700'>نمایش معادل ارزی</span>
				</label>

				{altCurrencyEnabled && (
					<div className='grid gap-3 sm:grid-cols-3'>
						<Select label='ارز' {...register('altCurrency')}>
							{Object.entries(CURRENCIES)
								.filter(([key]) => key !== currency)
								.map(([key, value]) => (
									<option key={key} value={key}>
										{value.label}
									</option>
								))}
						</Select>
						<Select label='روش تبدیل' {...register('exchangeMethod')}>
							<option value='divide'>تقسیم بر</option>
							<option value='multiply'>ضرب در</option>
						</Select>
						<Input
							label='نرخ تبدیل'
							type='number'
							min={0}
							step='any'
							{...register('exchangeRate', { valueAsNumber: true })}
							error={errors.exchangeRate?.message}
						/>
					</div>
				)}
			</div>

			<Input
				label='یادداشت (اختیاری)'
				{...register('notes')}
				error={errors.notes?.message}
			/>

			{previewLines.length > 0 && (
				<div className='rounded-xl border border-slate-200 bg-white p-4 space-y-3'>
					<h4 className='font-bold text-slate-800'>پیش‌نمایش محاسبات</h4>
					<ul className='space-y-2 text-sm text-slate-600'>
						{previewLines.map((line, index) => (
							<li key={`${line.type}-${line.rate ?? 'fixed'}-${index}`} className='flex justify-between gap-4'>
								<span>{line.title}</span>
								<span className='font-bold tabular-nums'>
									{formatMoney(line.total)} {CURRENCIES[currency].symbol}
								</span>
							</li>
						))}
					</ul>
					<div className='border-t border-slate-100 pt-3 space-y-1 text-sm'>
						<div className='flex justify-between'>
							<span>جمع:</span>
							<span className='font-bold tabular-nums'>
								{toFa(previewTotals.subtotal)} {CURRENCIES[currency].symbol}
							</span>
						</div>
						{taxRate > 0 && (
							<div className='flex justify-between'>
								<span>مالیات ({toFa(taxRate)}٪):</span>
								<span className='font-bold tabular-nums'>
									{toFa(previewTotals.taxAmount)} {CURRENCIES[currency].symbol}
								</span>
							</div>
						)}
						<div className='flex justify-between text-base font-black text-slate-900'>
							<span>مبلغ نهایی:</span>
							<span className='tabular-nums'>
								{toFa(previewTotals.total)} {CURRENCIES[currency].symbol}
							</span>
						</div>
					</div>
				</div>
			)}

			<div className='flex gap-3'>
				<Button type='submit' disabled={isPending || previewLines.length === 0}>
					{isPending ? 'در حال ایجاد...' : 'ایجاد فاکتور'}
				</Button>
				<Button
					type='button'
					variant='secondary'
					onClick={() => router.push(ROUTES.projectInvoices(project.id))}
				>
					انصراف
				</Button>
			</div>
		</form>
	);
}
