'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Disclosure } from '@/components/ui/Disclosure';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Select } from '@/components/atoms/Select';
import { Surface } from '@/components/ui/Surface';
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
import { cn } from '@/lib/utils/cn';

interface IInvoiceGeneratorFormProps {
	project: Project;
	paymentMethods: PaymentMethod[];
	timeEntries?: Pick<TimeEntry, 'hours' | 'rate_at_entry' | 'work_date'>[];
}

const STEPS = ['بازه / درصد', 'پرداخت و نمایش', 'بازبینی'] as const;

function InvoiceWizardStepScope({ isHourly }: { isHourly: boolean }) {
	const {
		register,
		watch,
		setValue,
		formState: { errors },
	} = useFormContext<InvoiceGeneratorInput>();

	const periodStart = watch('periodStart');
	const periodEnd = watch('periodEnd');

	return (
		<div className='space-y-4'>
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
		</div>
	);
}

function InvoiceWizardStepOptions({ paymentMethods }: { paymentMethods: PaymentMethod[] }) {
	const {
		register,
		watch,
		formState: { errors },
	} = useFormContext<InvoiceGeneratorInput>();
	const altCurrencyEnabled = watch('altCurrencyEnabled');

	return (
		<div className='space-y-4'>
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

			<Disclosure title='تنظیمات نمایش و ارز' defaultOpen={false}>
				<div className='space-y-3'>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input type='checkbox' {...register('showProjectName')} className='h-4 w-4' />
						<span className='text-sm font-bold'>نمایش نام پروژه در فاکتور</span>
					</label>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input type='checkbox' {...register('showOwnerName')} className='h-4 w-4' />
						<span className='text-sm font-bold'>نمایش نام کارفرما در فاکتور</span>
					</label>
					<label className='flex items-center gap-2 cursor-pointer'>
						<input type='checkbox' {...register('altCurrencyEnabled')} className='h-4 w-4' />
						<span className='text-sm font-bold'>نمایش معادل ارزی</span>
					</label>
					{altCurrencyEnabled && (
						<div className='grid gap-3 sm:grid-cols-3'>
							<Select label='ارز' {...register('altCurrency')}>
								{Object.entries(CURRENCIES).map(([key, value]) => (
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
			</Disclosure>

			<Input label='یادداشت (اختیاری)' {...register('notes')} error={errors.notes?.message} />
		</div>
	);
}

function InvoiceWizardStepReview({
	previewLines,
	previewTotals,
	taxRate,
	currency,
}: {
	previewLines: ReturnType<typeof generateHourlyLines>;
	previewTotals: ReturnType<typeof calculateInvoiceTotals>;
	taxRate: number;
	currency: CurrencyCode;
}) {
	return (
		<div className='space-y-3'>
			<ul className='space-y-2 text-sm text-muted-foreground'>
				{previewLines.map((line, index) => (
					<li key={`${line.type}-${line.rate ?? 'fixed'}-${index}`} className='flex justify-between gap-4'>
						<span>{line.title}</span>
						<span className='font-bold tabular-nums text-foreground'>
							{formatMoney(line.total)} {CURRENCIES[currency].symbol}
						</span>
					</li>
				))}
			</ul>
			<div className='border-t border-border pt-3 space-y-1 text-sm'>
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
				<div className='flex justify-between text-base font-black text-foreground'>
					<span>مبلغ نهایی:</span>
					<span className='tabular-nums'>
						{toFa(previewTotals.total)} {CURRENCIES[currency].symbol}
					</span>
				</div>
			</div>
		</div>
	);
}

function InvoiceWizardInner({
	project,
	paymentMethods,
	timeEntries,
}: IInvoiceGeneratorFormProps) {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [isPending, startTransition] = useTransition();
	const isHourly = project.type === 'hourly';
	const currency = project.currency as CurrencyCode;

	const methods = useFormContext<InvoiceGeneratorInput>();
	const watched = methods.watch();
	const { handleSubmit, formState: { errors } } = methods;

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

		return (timeEntries ?? []).filter(
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
			<div className='flex gap-2'>
				{STEPS.map((label, index) => (
					<div
						key={label}
						className={cn(
							'flex-1 rounded-lg px-2 py-2 text-center text-xs font-bold',
							step === index
								? 'bg-primary text-primary-foreground'
								: step > index
									? 'bg-primary/10 text-primary'
									: 'bg-muted text-muted-foreground',
						)}
					>
						{label}
					</div>
				))}
			</div>

			<div className='grid gap-6 lg:grid-cols-2'>
				<Surface title={STEPS[step] ?? ''} padding='sm'>
					{step === 0 && <InvoiceWizardStepScope isHourly={isHourly} />}
					{step === 1 && <InvoiceWizardStepOptions paymentMethods={paymentMethods} />}
					{step === 2 && (
						<InvoiceWizardStepReview
							previewLines={previewLines}
							previewTotals={previewTotals}
							taxRate={taxRate}
							currency={currency}
						/>
					)}
				</Surface>

				<div className='hidden lg:block'>
					<Surface title='پیش‌نمایش' padding='sm'>
						{previewLines.length > 0 ? (
							<InvoiceWizardStepReview
								previewLines={previewLines}
								previewTotals={previewTotals}
								taxRate={taxRate}
								currency={currency}
							/>
						) : (
							<p className='text-sm text-muted-foreground'>بازه یا درصد را انتخاب کنید.</p>
						)}
					</Surface>
				</div>
			</div>

			{errors.root && <p className='text-sm text-destructive'>{errors.root.message}</p>}

			<div className='sticky bottom-0 flex gap-3 border-t border-border bg-background py-3 md:static md:border-0 md:py-0'>
				{step > 0 && (
					<Button type='button' variant='secondary' onClick={() => setStep((s) => s - 1)}>
						قبلی
					</Button>
				)}
				{step < STEPS.length - 1 ? (
					<Button type='button' fullWidth onClick={() => setStep((s) => s + 1)}>
						ادامه — {formatMoney(previewTotals.total)} {CURRENCIES[currency].symbol}
					</Button>
				) : (
					<Button type='submit' fullWidth disabled={isPending || previewLines.length === 0}>
						{isPending ? 'در حال ایجاد...' : 'ایجاد فاکتور'}
					</Button>
				)}
				<Button
					type='button'
					variant='ghost'
					onClick={() => router.push(ROUTES.projectInvoices(project.id))}
				>
					انصراف
				</Button>
			</div>
		</form>
	);
}

export function InvoiceGeneratorForm({
	project,
	paymentMethods,
	timeEntries = [],
}: IInvoiceGeneratorFormProps) {
	const isHourly = project.type === 'hourly';
	const schema = isHourly ? hourlyInvoiceSchema : totalInvoiceSchema;

	const methods = useForm<InvoiceGeneratorInput>({
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

	return (
		<FormProvider {...methods}>
			<InvoiceWizardInner
				project={project}
				paymentMethods={paymentMethods}
				timeEntries={timeEntries}
			/>
		</FormProvider>
	);
}
