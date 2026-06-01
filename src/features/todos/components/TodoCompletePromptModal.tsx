'use client';

import { Button } from '@/components/atoms/Button';
import { Modal } from '@/components/atoms/Modal';
import type { ProjectTodo } from '@/lib/supabase/database.types';

interface ITodoCompletePromptModalProps {
	todo: ProjectTodo | null;
	showTimeEntry: boolean;
	onDismiss: () => void;
	onMarkDoneOnly: () => void;
	onLogTime: () => void;
}

export function TodoCompletePromptModal({
	todo,
	showTimeEntry,
	onDismiss,
	onMarkDoneOnly,
	onLogTime,
}: ITodoCompletePromptModalProps) {
	if (!todo) {
		return null;
	}

	return (
		<Modal open title='کار انجام شد' onClose={onDismiss}>
			<div className='space-y-4'>
				<p className='text-sm leading-relaxed text-muted-foreground'>
					«<span className='font-bold text-foreground'>{todo.title}</span>» را تمام کردی.
					{showTimeEntry ? ' می‌خواهی برایش در تایم‌شیت ساعت ثبت کنی؟' : ''}
				</p>

				<div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
					<Button type='button' variant='ghost' onClick={onDismiss}>
						انصراف
					</Button>
					<Button type='button' variant='secondary' haptic='light' onClick={onMarkDoneOnly}>
						{showTimeEntry ? 'فقط تیک بزن' : 'تأیید'}
					</Button>
					{showTimeEntry && (
						<Button type='button' haptic='success' onClick={onLogTime}>
							ثبت ساعت
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}
