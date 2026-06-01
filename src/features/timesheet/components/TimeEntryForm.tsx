'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState, useTransition } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Modal } from '@/components/atoms/Modal';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import {
	createTimeEntry,
	updateTimeEntry,
} from '@/features/timesheet/actions/time-entry.actions';
import {
	TimeEntryTodoPicker,
	type ITimeEntryTodoOption,
} from '@/features/todos/components/TimeEntryTodoPicker';
import type { TimeEntry } from '@/lib/supabase/database.types';

interface ITimeEntryFormProps {
	open: boolean;
	onClose: () => void;
	projectId: string;
	defaultWorkDate: string;
	entry?: TimeEntry | null;
	openTodos?: ITimeEntryTodoOption[];
	initialDescription?: string;
	initialHours?: number;
	onSaved?: () => void;
}

interface ITimeEntryFormFieldsProps {
	projectId: string;
	defaultWorkDate: string;
	entry?: TimeEntry | null;
	openTodos: ITimeEntryTodoOption[];
	initialDescription: string;
	initialHours?: number;
	onClose: () => void;
	onSaved?: () => void;
}

function TimeEntryFormFields({
	projectId,
	defaultWorkDate,
	entry,
	openTodos,
	initialDescription,
	initialHours,
	onClose,
	onSaved,
}: ITimeEntryFormFieldsProps) {
	const router = useRouter();
	const { trigger: triggerCelebration } = useCelebration();
	const [pending, startTransition] = useTransition();
	const [workDate, setWorkDate] = useState(entry?.work_date ?? defaultWorkDate);
	const [hours, setHours] = useState<number | ''>(entry?.hours ?? initialHours ?? '');
	const [description, setDescription] = useState(entry?.description ?? initialDescription);
	const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
	const isEditing = Boolean(entry);

	const handleTodoSelect = (todo: ITimeEntryTodoOption | null) => {
		setSelectedTodoId(todo?.id ?? null);
		setDescription(todo?.title ?? '');
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmedDescription = description.trim() || null;

		if (!workDate) {
			toast.error('تاریخ الزامی است.');
			return;
		}

		if (hours === '' || hours <= 0) {
			toast.error('ساعات الزامی است.');
			return;
		}

		startTransition(async () => {
			const result = isEditing
				? await updateTimeEntry({
						id: entry!.id,
						workDate,
						hours: Number(hours),
						description: trimmedDescription,
					})
				: await createTimeEntry({
						projectId,
						workDate,
						hours: Number(hours),
						description: trimmedDescription,
					});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);

			if (result.celebration) {
				triggerCelebration(result.celebration);
			}

			onSaved?.();
			onClose();
			router.refresh();
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<JalaliDatePicker label='تاریخ' value={workDate} onChange={setWorkDate} />

			<DurationInput label='مدت زمان (ساعت:دقیقه)' value={hours} onChange={setHours} />

			{!isEditing && openTodos.length > 0 && (
				<TimeEntryTodoPicker
					todos={openTodos}
					selectedId={selectedTodoId}
					onSelect={handleTodoSelect}
				/>
			)}

			<Input
				label='توضیحات (اختیاری)'
				name='description'
				value={description}
				onChange={(event) => {
					setDescription(event.target.value);
					setSelectedTodoId(null);
				}}
				placeholder='شرح کار انجام‌شده'
			/>

			<div className='flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end'>
				<Button type='button' variant='secondary' onClick={onClose} disabled={pending}>
					انصراف
				</Button>
				<Button type='submit' disabled={pending}>
					{pending ? 'در حال ذخیره…' : isEditing ? 'ذخیره' : 'ثبت'}
				</Button>
			</div>
		</form>
	);
}

export function TimeEntryForm({
	open,
	onClose,
	projectId,
	defaultWorkDate,
	entry,
	openTodos = [],
	initialDescription = '',
	initialHours,
	onSaved,
}: ITimeEntryFormProps) {
	const formKey = entry
		? `edit-${entry.id}`
		: `new-${defaultWorkDate}-${initialDescription}-${initialHours ?? ''}`;

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={entry ? 'ویرایش ساعت کار' : 'ثبت ساعت کار'}
		>
			{open && (
				<TimeEntryFormFields
					key={formKey}
					projectId={projectId}
					defaultWorkDate={defaultWorkDate}
					entry={entry}
					openTodos={openTodos}
					initialDescription={initialDescription}
					initialHours={initialHours}
					onClose={onClose}
					onSaved={onSaved}
				/>
			)}
		</Modal>
	);
}
