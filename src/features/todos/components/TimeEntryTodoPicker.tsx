'use client';

import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

export interface ITimeEntryTodoOption {
	id: string;
	title: string;
}

interface ITimeEntryTodoPickerProps {
	todos: ITimeEntryTodoOption[];
	selectedId: string | null;
	onSelect: (todo: ITimeEntryTodoOption | null) => void;
}

export function TimeEntryTodoPicker({ todos, selectedId, onSelect }: ITimeEntryTodoPickerProps) {
	if (todos.length === 0) {
		return null;
	}

	return (
		<div className='space-y-2'>
			<p className='text-sm text-muted-foreground'>از لیست کارها (اختیاری)</p>
			<div className='scrollbar-hide -mx-1 flex flex-wrap gap-2'>
				{todos.map((todo) => {
					const active = selectedId === todo.id;

					return (
						<button
							key={todo.id}
							type='button'
							onClick={() => {
								triggerHaptic('selection');
								onSelect(active ? null : todo);
							}}
							className={cn(
								'max-w-full truncate rounded-xl border px-3 py-2 text-sm font-bold transition-all active:scale-[0.98]',
								active
									? 'border-primary bg-primary/10 text-primary'
									: 'border-border bg-muted/50 text-foreground',
							)}
						>
							{todo.title}
						</button>
					);
				})}
			</div>
		</div>
	);
}
