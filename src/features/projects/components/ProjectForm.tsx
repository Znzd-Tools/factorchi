'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Select } from '@/components/atoms/Select';
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
	const [pending, startTransition] = useTransition();
	const [archivePending, startArchiveTransition] = useTransition();

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: defaultValues ?? projectFormDefaults,
	});

	const projectType = watch('type');

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

	return (
		<form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
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

			{projectType === 'hourly' ? (
				<>
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
					<Input
						label='مدت هر پومودورو (دقیقه)'
						type='number'
						inputMode='numeric'
						min={5}
						max={120}
						dir='ltr'
						error={errors.pomodoro_minutes?.message}
						{...register('pomodoro_minutes', { valueAsNumber: true })}
					/>
					<p className='-mt-2 text-xs text-muted-foreground'>
						بعد از هر پومودورو تایمر متوقف می‌شود تا استراحت کنی؛ «ادامه» راند بعدی را شروع می‌کند.
					</p>
				</>
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
				<label htmlFor='notes' className='block text-sm text-slate-500'>
					یادداشت
				</label>
				<textarea
					id='notes'
					rows={3}
					className='w-full rounded-lg border border-slate-200 p-2.5 outline-none transition-all focus:ring-2 focus:ring-blue-500'
					{...register('notes')}
				/>
			</div>

			{errors.root && <p className='text-sm text-red-500'>{errors.root.message}</p>}

			<div className='flex flex-wrap gap-3'>
				<Button type='submit' disabled={pending}>
					{pending ? 'در حال ذخیره...' : mode === 'create' ? 'ایجاد پروژه' : 'ذخیره تغییرات'}
				</Button>
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
