'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { Input } from '@/components/atoms/Input';
import { JalaliDatePicker } from '@/components/atoms/JalaliDatePicker';
import { Modal } from '@/components/atoms/Modal';
import {
	createTimeEntry,
	updateTimeEntry,
} from '@/features/timesheet/actions/time-entry.actions';
import type { TimeEntry } from '@/lib/supabase/database.types';

interface ITimeEntryFormProps {
	open: boolean;
	onClose: () => void;
	projectId: string;
	defaultWorkDate: string;
	entry?: TimeEntry | null;
}

export function TimeEntryForm({
	open,
	onClose,
	projectId,
	defaultWorkDate,
	entry,
}: ITimeEntryFormProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [workDate, setWorkDate] = useState(entry?.work_date ?? defaultWorkDate);
	const [hours, setHours] = useState<number | ''>(entry?.hours ?? '');
	const isEditing = Boolean(entry);

	const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const description = String(formData.get('description') ?? '').trim() || null;

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
						description,
					})
				: await createTimeEntry({
						projectId,
						workDate,
						hours: Number(hours),
						description,
					});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			onClose();
			router.refresh();
		});
	};

	return (
		<Modal
			open={open}
			onClose={onClose}
			title={isEditing ? 'ویرایش ساعت کار' : 'ثبت ساعت کار'}
		>
			<form key={entry?.id ?? defaultWorkDate} onSubmit={handleSubmit} className='space-y-4'>
				<JalaliDatePicker label='تاریخ' value={workDate} onChange={setWorkDate} />

				<DurationInput label='مدت زمان (ساعت:دقیقه)' value={hours} onChange={setHours} />

				<Input
					label='توضیحات (اختیاری)'
					name='description'
					defaultValue={entry?.description ?? ''}
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
		</Modal>
	);
}
