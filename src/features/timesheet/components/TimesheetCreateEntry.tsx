'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/atoms/Button';
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
			<div className='mb-4 flex justify-end'>
				<Button type='button' size='sm' onClick={() => setOpen(true)}>
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
