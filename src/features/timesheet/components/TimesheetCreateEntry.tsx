'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { TimeEntryForm } from '@/features/timesheet/components/TimeEntryForm';
import { getDefaultWorkDateForMonth } from '@/features/timesheet/utils/month-params';

interface ITimesheetCreateEntryProps {
	projectId: string;
	year: number;
	month: number;
}

export function TimesheetCreateEntry({ projectId, year, month }: ITimesheetCreateEntryProps) {
	const [open, setOpen] = useState(false);
	const defaultWorkDate = getDefaultWorkDateForMonth(year, month);

	return (
		<>
			<FloatingActionButton
				icon={Plus}
				label='ثبت ساعت'
				onClick={() => setOpen(true)}
				className='md:hidden'
			/>
			<div className='mb-4 hidden justify-end md:flex'>
				<Button type='button' onClick={() => setOpen(true)} haptic='medium'>
					<Plus size={16} />
					ثبت ساعت
				</Button>
			</div>

			<TimeEntryForm
				key={`new-${year}-${month}`}
				open={open}
				onClose={() => setOpen(false)}
				projectId={projectId}
				defaultWorkDate={defaultWorkDate}
			/>
		</>
	);
}
