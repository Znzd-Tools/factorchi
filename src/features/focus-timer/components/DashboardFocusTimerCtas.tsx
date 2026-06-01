'use client';

import { Play, Timer } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { useFocusTimer } from '@/features/focus-timer/context/FocusTimerContext';
import type { IFocusTimerProject } from '@/features/focus-timer/types';
import { formatElapsedClock } from '@/features/focus-timer/utils/timer-format';
import { cn } from '@/lib/utils/cn';

interface IDashboardFocusTimerCtasProps {
	projects: IFocusTimerProject[];
}

export function DashboardFocusTimerCtas({ projects }: IDashboardFocusTimerCtasProps) {
	const { timer, elapsedMs, start, isActive } = useFocusTimer();

	if (projects.length === 0) {
		return null;
	}

	return (
		<section className='space-y-3'>
			<div className='flex items-center gap-2'>
				<Timer size={18} className='text-primary' aria-hidden />
				<h2 className='text-sm font-bold text-muted-foreground'>تایمر تمرکز</h2>
			</div>

			{isActive && timer && (
				<Link
					href={ROUTES.project(timer.projectId)}
					className='flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 transition-colors active:bg-primary/15'
				>
					<div className='min-w-0'>
						<p className='text-xs font-bold text-primary'>در حال اجرا</p>
						<p className='truncate font-black text-foreground'>{timer.projectName}</p>
					</div>
					<p className='shrink-0 text-xl font-black tabular-nums' dir='ltr'>
						{formatElapsedClock(elapsedMs)}
					</p>
				</Link>
			)}

			<div className='scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-1'>
				{projects.map((project) => {
					const active = timer?.projectId === project.id;

					return (
						<div
							key={project.id}
							className={cn(
								'flex w-[11rem] shrink-0 flex-col gap-2 rounded-2xl border p-3',
								active
									? 'border-primary bg-primary/10'
									: 'border-border bg-card',
							)}
						>
							<p className='truncate text-sm font-bold text-foreground'>{project.name}</p>
							<Button
								type='button'
								size='sm'
								variant={active ? 'primary' : 'secondary'}
								className='w-full'
								haptic='medium'
								disabled={isActive && !active}
								onClick={() => start(project)}
							>
								<Play size={14} aria-hidden />
								{active ? 'فعال' : 'شروع'}
							</Button>
						</div>
					);
				})}
			</div>
		</section>
	);
}
