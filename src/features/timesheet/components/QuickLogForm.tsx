'use client';

import { Timer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { createTimeEntry } from '@/features/timesheet/actions/time-entry.actions';
import { useQuickLogProject } from '@/hooks/useQuickLogProject';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { ROUTES } from '@/config/routes';
import { formatJalaliDate } from '@/lib/jalali';
import { getTodayIso } from '@/lib/jalali/picker';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { setQuickLogProjectId } from '@/lib/quick-log/storage';
import { cn } from '@/lib/utils/cn';

const HOUR_PRESETS = [1, 2, 4, 8] as const;

export interface IQuickLogProject {
	id: string;
	name: string;
	client_name: string;
}

interface IQuickLogFormProps {
	projects: IQuickLogProject[];
}

export function QuickLogForm({ projects }: IQuickLogFormProps) {
	const router = useRouter();
	const { trigger: triggerCelebration } = useCelebration();
	const [pending, startTransition] = useTransition();
	const todayIso = getTodayIso();
	const projectIds = useMemo(() => projects.map((project) => project.id), [projects]);
	const defaultProjectId = projects[0]?.id ?? null;
	const { projectId: resolvedProjectId, setProjectId } = useQuickLogProject(
		projectIds,
		defaultProjectId,
	);

	const [hours, setHours] = useState<number | ''>(2);
	const [customHours, setCustomHours] = useState(false);

	const selectedProject = projects.find((project) => project.id === resolvedProjectId);

	const handleSubmit = () => {
		if (!resolvedProjectId) {
			toast.error('پروژه‌ای انتخاب نشده.');
			return;
		}

		if (hours === '' || hours <= 0) {
			toast.error('مدت زمان را وارد کن.');
			return;
		}

		startTransition(async () => {
			const result = await createTimeEntry({
				projectId: resolvedProjectId,
				workDate: todayIso,
				hours: Number(hours),
				description: null,
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			setQuickLogProjectId(resolvedProjectId);
			toast.success(result.success);

			if (result.celebration) {
				triggerCelebration(result.celebration);
			}

			setHours(2);
			setCustomHours(false);
			router.refresh();
		});
	};

	if (projects.length === 0) {
		return (
			<div className='rounded-3xl border border-dashed border-border bg-muted/40 px-5 py-10 text-center'>
				<p className='font-bold text-foreground'>پروژه ساعتی فعال نداری</p>
				<p className='mt-2 text-sm text-muted-foreground'>
					برای ثبت سریع، یک پروژه با نرخ ساعتی بساز.
				</p>
				<Link href={ROUTES.projectNew} className='mt-5 inline-block'>
					<Button haptic='medium'>پروژه جدید</Button>
				</Link>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			<div className='rounded-2xl border border-border bg-card px-4 py-3.5 shadow-[var(--shadow-soft)]'>
				<p className='text-xs font-bold text-muted-foreground'>امروز</p>
				<p className='mt-1 text-lg font-black text-foreground'>{formatJalaliDate(todayIso)}</p>
			</div>

			<div className='space-y-2'>
				<p className='text-sm font-bold text-muted-foreground'>پروژه</p>
				<div className='scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-1'>
					{projects.map((project) => {
						const active = project.id === resolvedProjectId;

						return (
							<button
								key={project.id}
								type='button'
								onClick={() => setProjectId(project.id)}
								className={cn(
									'max-w-[14rem] shrink-0 rounded-2xl border px-4 py-3 text-start transition-all active:scale-[0.98]',
									active
										? 'border-primary bg-primary/10 text-primary shadow-[var(--shadow-soft)]'
										: 'border-border bg-card text-foreground',
								)}
							>
								<p className='truncate font-bold'>{project.name}</p>
								<p className='truncate text-xs text-muted-foreground'>{project.client_name}</p>
							</button>
						);
					})}
				</div>
			</div>

			<div className='space-y-2'>
				<p className='text-sm font-bold text-muted-foreground'>چند ساعت؟</p>
				<div className='grid grid-cols-4 gap-2'>
					{HOUR_PRESETS.map((preset) => {
						const active = !customHours && hours === preset;

						return (
							<Button
								key={preset}
								type='button'
								variant={active ? 'primary' : 'secondary'}
								size='lg'
								className='tabular-nums'
								haptic='selection'
								onClick={() => {
									setCustomHours(false);
									setHours(preset);
								}}
							>
								{toFaNumber(preset)}
							</Button>
						);
					})}
				</div>
				<Button
					type='button'
					variant={customHours ? 'primary' : 'ghost'}
					size='sm'
					className='w-full'
					haptic='selection'
					onClick={() => setCustomHours(true)}
				>
					سفارشی
				</Button>
				{customHours && (
					<DurationInput label='مدت دقیق' value={hours} onChange={setHours} maxHours={24} />
				)}
			</div>

			<Button
				type='button'
				size='lg'
				className='w-full shadow-[var(--shadow-elevated)]'
				haptic='success'
				disabled={pending || !selectedProject}
				onClick={handleSubmit}
			>
				<Timer size={20} aria-hidden />
				{pending
					? 'در حال ثبت…'
					: `ثبت ${hours === '' ? '…' : formatHoursAsDurationFa(Number(hours))}`}
			</Button>

			{selectedProject && (
				<p className='text-center text-xs text-muted-foreground'>
					برای {selectedProject.name} ·{' '}
					<Link href={ROUTES.projectTimesheet(selectedProject.id)} className='font-bold text-primary'>
						تایم‌شیت کامل
					</Link>
				</p>
			)}
		</div>
	);
}
