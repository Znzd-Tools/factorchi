'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
import { Surface } from '@/components/ui/Surface';
import { ROUTES } from '@/config/routes';
import {
	archiveProject,
	createProject,
	updateProject,
} from '@/features/projects/actions/project.actions';
import { CURRENCIES } from '@/features/invoice/constants/currencies';
import {
	type ProjectFormValues,
	projectFormDefaults,
	projectFormSchema,
} from '@/features/projects/schemas/project.schema';
import { parseMoneyInput } from '@/lib/money';

interface IProjectFormProps {
	mode: 'create' | 'edit';
	projectId?: string;
	defaultValues?: ProjectFormValues;
}

export function ProjectForm({ mode, projectId, defaultValues }: IProjectFormProps) {
	const router = useRouter();
	const [step, setStep] = useState(0);
	const [pending, startTransition] = useTransition();
	const [archivePending, startArchiveTransition] = useTransition();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		trigger,
		formState: { errors },
	} = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: defaultValues ?? projectFormDefaults,
	});

	const projectType = watch('type');
	const isCreate = mode === 'create';

	const onSubmit = (values: ProjectFormValues) => {
		startTransition(async () => {
			const result =
				mode === 'create'
					? await createProject(values)
					: await updateProject(projectId!, values);

			if (result?.error) {
				toast.error(result.error);
				return;
			}

			if (result?.success) {
				toast.success(result.success);
				router.refresh();
			}
		});
	};

	const handleArchive = () => {
		if (!projectId) {
			return;
		}

		startArchiveTransition(async () => {
			const result = await archiveProject(projectId);

			if (result?.error) {
				toast.error(result.error);
			}
		});
	};

	const handleNextStep = async () => {
		const fields: (keyof ProjectFormValues)[] =
			step === 0 ? ['name', 'client_name', 'client_contact', 'type', 'currency'] : [];

		const valid = fields.length === 0 || (await trigger(fields));
		if (valid) {
			setStep((current) => current + 1);
		}
	};

	const basicsFields = (
		<div className='space-y-4'>
			<Input label='نام پروژه' {...register('name')} error={errors.name?.message} />
			<Input
				label='نام کارفرما'
				{...register('client_name')}
				error={errors.client_name?.message}
			/>
			<Input
				label='اطلاعات تماس کارفرما'
				{...register('client_contact')}
				error={errors.client_contact?.message}
			/>
			<Select
				label='نوع پروژه'
				{...register('type')}
				error={errors.type?.message}
				onChange={(event) => {
					const nextType = event.target.value as ProjectFormValues['type'];
					setValue('type', nextType);
					if (nextType === 'hourly') {
						setValue('total_amount', null);
					} else {
						setValue('hourly_rate', null);
					}
				}}
			>
				<option value='hourly'>ساعتی</option>
				<option value='total'>مبلغ ثابت</option>
			</Select>
			<Select label='ارز' {...register('currency')} error={errors.currency?.message}>
				{Object.entries(CURRENCIES).map(([code, config]) => (
					<option key={code} value={code}>
						{config.label}
					</option>
				))}
			</Select>
		</div>
	);

	const billingFields = (
		<div className='space-y-4'>
			{projectType === 'hourly' ? (
				<Input
					label='نرخ ساعتی'
					inputMode='decimal'
					dir='ltr'
					error={errors.hourly_rate?.message}
					onChange={(event) => {
						setValue('hourly_rate', parseMoneyInput(event.target.value), {
							shouldValidate: true,
						});
					}}
					defaultValue={
						defaultValues?.hourly_rate != null ? String(defaultValues.hourly_rate) : ''
					}
				/>
			) : (
				<Input
					label='مبلغ کل پروژه'
					inputMode='decimal'
					dir='ltr'
					error={errors.total_amount?.message}
					onChange={(event) => {
						setValue('total_amount', parseMoneyInput(event.target.value), {
							shouldValidate: true,
						});
					}}
					defaultValue={
						defaultValues?.total_amount != null ? String(defaultValues.total_amount) : ''
					}
				/>
			)}

			<div className='space-y-1'>
				<label htmlFor='notes' className='block text-sm font-bold text-muted-foreground'>
					یادداشت
				</label>
				<textarea
					id='notes'
					rows={3}
					className='w-full rounded-lg border border-border bg-input p-2.5 outline-none transition-all focus:ring-2 focus:ring-ring/30'
					{...register('notes')}
				/>
			</div>
		</div>
	);

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
			{isCreate ? (
				<>
					{step === 0 && (
						<Surface title='اطلاعات پایه' description='پروژه و کارفرما'>
							{basicsFields}
						</Surface>
					)}
					{step === 1 && (
						<Surface title='اطلاعات مالی' description='نرخ یا مبلغ قرارداد'>
							{billingFields}
						</Surface>
					)}
				</>
			) : (
				<>
					<Surface title='اطلاعات پایه'>{basicsFields}</Surface>
					<Surface title='اطلاعات مالی' className='mt-4'>
						{billingFields}
					</Surface>
				</>
			)}

			{errors.root && <p className='text-sm text-destructive'>{errors.root.message}</p>}

			<div className='flex flex-wrap gap-3'>
				{isCreate && step === 1 && (
					<Button type='button' variant='secondary' onClick={() => setStep(0)}>
						قبلی
					</Button>
				)}
				{isCreate && step === 0 ? (
					<Button type='button' onClick={handleNextStep}>
						ادامه
					</Button>
				) : (
					<Button type='submit' disabled={pending}>
						{pending ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد پروژه' : 'ذخیره تغییرات'}
					</Button>
				)}
				<Button
					type='button'
					variant='secondary'
					onClick={() => router.push(ROUTES.projects)}
					disabled={pending}
				>
					انصراف
				</Button>
				{mode === 'edit' && projectId && (
					<Button
						type='button'
						variant='danger'
						onClick={handleArchive}
						disabled={archivePending || pending}
					>
						{archivePending ? 'در حال بایگانی...' : 'بایگانی پروژه'}
					</Button>
				)}
			</div>
		</form>
	);
}
