'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { TimeEntryForm } from '@/features/timesheet/components/TimeEntryForm';
import { deleteTimeEntry } from '@/features/timesheet/actions/time-entry.actions';
import type { ITimeEntryTodoOption } from '@/features/todos/components/TimeEntryTodoPicker';
import type { TimeEntry } from '@/lib/supabase/database.types';

interface ITimesheetRowActionsProps {
	projectId: string;
	entry: TimeEntry;
	openTodos: ITimeEntryTodoOption[];
}

export function TimesheetRowActions({ projectId, entry, openTodos }: ITimesheetRowActionsProps) {
	const router = useRouter();
	const [editOpen, setEditOpen] = useState(false);
	const [pending, startTransition] = useTransition();

	const handleDelete = () => {
		if (!window.confirm('این ردیف حذف شود؟')) {
			return;
		}

		startTransition(async () => {
			const result = await deleteTimeEntry({ id: entry.id, projectId });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			router.refresh();
		});
	};

	return (
		<>
			<div className='flex items-center justify-end gap-1'>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={() => setEditOpen(true)}
					disabled={pending}
					aria-label='ویرایش'
				>
					<Pencil size={16} />
				</Button>
				<Button
					type='button'
					variant='ghost'
					size='sm'
					onClick={handleDelete}
					disabled={pending}
					aria-label='حذف'
					className='text-red-600 hover:bg-red-50 hover:text-red-700'
				>
					<Trash2 size={16} />
				</Button>
			</div>

			<TimeEntryForm
				key={entry.id}
				open={editOpen}
				onClose={() => setEditOpen(false)}
				projectId={projectId}
				defaultWorkDate={entry.work_date}
				entry={entry}
				openTodos={openTodos}
			/>
		</>
	);
}
