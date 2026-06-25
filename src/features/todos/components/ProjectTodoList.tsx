'use client';

import { Check, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { Disclosure } from '@/components/ui/Disclosure';
import { Input } from '@/components/atoms/Input';
import { TimeEntryForm } from '@/features/timesheet/components/TimeEntryForm';
import { getDefaultWorkDateForMonth } from '@/features/timesheet/utils/month-params';
import {
	completeProjectTodo,
	createProjectTodo,
	deleteProjectTodo,
	reopenProjectTodo,
} from '@/features/todos/actions/project-todo.actions';
import { TodoCompletePromptModal } from '@/features/todos/components/TodoCompletePromptModal';
import { getCurrentJalaliMonth } from '@/lib/jalali';
import { toFaNumber } from '@/lib/locale/persian-digits';
import type { ProjectTodo } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IProjectTodoListProps {
	projectId: string;
	projectType: 'hourly' | 'total';
	initialTodos: ProjectTodo[];
}

export function ProjectTodoList({ projectId, projectType, initialTodos }: IProjectTodoListProps) {
	const router = useRouter();
	const [pending, startTransition] = useTransition();
	const [title, setTitle] = useState('');
	const [pendingComplete, setPendingComplete] = useState<ProjectTodo | null>(null);
	const [completingTodoId, setCompletingTodoId] = useState<string | null>(null);
	const [timeEntryOpen, setTimeEntryOpen] = useState(false);
	const [timeEntryDescription, setTimeEntryDescription] = useState('');

	const { year, month } = getCurrentJalaliMonth();
	const defaultWorkDate = getDefaultWorkDateForMonth(year, month);
	const showTimeEntryOnComplete = projectType === 'hourly';

	const { openTodos, doneTodos } = useMemo(() => {
		const open = initialTodos.filter((todo) => !todo.is_done);
		const done = initialTodos.filter((todo) => todo.is_done);

		return { openTodos: open, doneTodos: done };
	}, [initialTodos]);

	const handleAdd = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const trimmed = title.trim();

		if (!trimmed) {
			return;
		}

		startTransition(async () => {
			const result = await createProjectTodo({ projectId, title: trimmed });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			setTitle('');
			router.refresh();
		});
	};

	const handleCompleteOnly = () => {
		if (!pendingComplete) {
			return;
		}

		startTransition(async () => {
			const result = await completeProjectTodo({
				id: pendingComplete.id,
				projectId,
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			setPendingComplete(null);
			router.refresh();
		});
	};

	const handleLogTime = () => {
		if (!pendingComplete) {
			return;
		}

		setCompletingTodoId(pendingComplete.id);
		setTimeEntryDescription(pendingComplete.title);
		setPendingComplete(null);
		setTimeEntryOpen(true);
	};

	const handleReopen = (todo: ProjectTodo) => {
		startTransition(async () => {
			const result = await reopenProjectTodo({ id: todo.id, projectId });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			router.refresh();
		});
	};

	const handleDelete = (todo: ProjectTodo) => {
		if (!window.confirm('این کار حذف شود؟')) {
			return;
		}

		startTransition(async () => {
			const result = await deleteProjectTodo({ id: todo.id, projectId });

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);
			router.refresh();
		});
	};

	const onTimeEntrySaved = () => {
		if (!completingTodoId) {
			return;
		}

		startTransition(async () => {
			await completeProjectTodo({ id: completingTodoId, projectId });
			setCompletingTodoId(null);
			setTimeEntryDescription('');
			router.refresh();
		});
	};

	return (
		<>
			<form onSubmit={handleAdd} className='flex gap-2'>
				<Input
					label='کار جدید'
					value={title}
					onChange={(event) => setTitle(event.target.value)}
					placeholder='مثلاً: طراحی صفحه اصلی'
					className='flex-1'
				/>
				<Button
					type='submit'
					className='mt-6 shrink-0'
					haptic='medium'
					disabled={pending || !title.trim()}
					aria-label='افزودن'
				>
					<Plus size={18} />
				</Button>
			</form>

			<section className='mt-6 space-y-2'>
				<p className='text-sm font-bold text-muted-foreground'>باز ({toFaNumber(openTodos.length)})</p>
				{openTodos.length === 0 ? (
					<p className='rounded-2xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground'>
						کار بازی نیست — یک مورد اضافه کن.
					</p>
				) : (
					<ul className='space-y-2'>
						{openTodos.map((todo) => (
							<li
								key={todo.id}
								className='flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3'
							>
								<button
									type='button'
									disabled={pending}
									onClick={() => setPendingComplete(todo)}
									className='flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted transition-colors active:bg-primary/15'
									aria-label={`انجام ${todo.title}`}
								>
									<Check size={18} className='text-primary' />
								</button>
								<p className='min-w-0 flex-1 font-bold text-foreground'>{todo.title}</p>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									disabled={pending}
									onClick={() => handleDelete(todo)}
									aria-label='حذف'
								>
									<Trash2 size={16} className='text-red-600' />
								</Button>
							</li>
						))}
					</ul>
				)}
			</section>

			{doneTodos.length > 0 && (
				<Disclosure
					title={`انجام‌شده (${toFaNumber(doneTodos.length)})`}
					defaultOpen={false}
					className='mt-6'
				>
					<ul className='space-y-2'>
						{doneTodos.map((todo) => (
							<li
								key={todo.id}
								className={cn(
									'flex items-center gap-3 rounded-xl border border-border bg-muted/40 px-3 py-3',
								)}
							>
								<span className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent'>
									<Check size={18} aria-hidden />
								</span>
								<p className='min-w-0 flex-1 text-sm text-muted-foreground line-through'>
									{todo.title}
								</p>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									disabled={pending}
									onClick={() => handleReopen(todo)}
									aria-label='بازگردانی'
								>
									<RotateCcw size={16} />
								</Button>
								<Button
									type='button'
									variant='ghost'
									size='sm'
									disabled={pending}
									onClick={() => handleDelete(todo)}
									aria-label='حذف'
								>
									<Trash2 size={16} className='text-red-600' />
								</Button>
							</li>
						))}
					</ul>
				</Disclosure>
			)}

			<TodoCompletePromptModal
				todo={pendingComplete}
				showTimeEntry={showTimeEntryOnComplete}
				onDismiss={() => setPendingComplete(null)}
				onMarkDoneOnly={handleCompleteOnly}
				onLogTime={handleLogTime}
			/>

			{showTimeEntryOnComplete && (
				<TimeEntryForm
					open={timeEntryOpen}
					onClose={() => {
						setTimeEntryOpen(false);
						setCompletingTodoId(null);
						setTimeEntryDescription('');
					}}
					projectId={projectId}
					defaultWorkDate={defaultWorkDate}
					initialDescription={timeEntryDescription}
					initialHours={1}
					onSaved={onTimeEntrySaved}
				/>
			)}
		</>
	);
}
