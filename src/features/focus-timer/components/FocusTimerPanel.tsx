'use client';

import { Pause, Play, Square, Timer } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { POMODORO_FOCUS_MINUTES } from '@/features/focus-timer/constants';
import { useFocusTimer } from '@/features/focus-timer/context/FocusTimerContext';
import { FocusTimerRing } from '@/features/focus-timer/components/FocusTimerRing';
import {
	formatElapsedClock,
	formatPomodoroBlockRemaining,
} from '@/features/focus-timer/utils/timer-format';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { cn } from '@/lib/utils/cn';

interface IFocusTimerPanelProps {
	projectId: string;
	projectName: string;
	compact?: boolean;
}

export function FocusTimerPanel({ projectId, projectName, compact = false }: IFocusTimerPanelProps) {
	const {
		timer,
		elapsedMs,
		pomodoroProgress,
		completedPomodoros,
		start,
		pause,
		resume,
		requestStop,
	} = useFocusTimer();

	const isThisProject = timer?.projectId === projectId;
	const isRunning = isThisProject && timer.status === 'running';
	const isPaused = isThisProject && timer.status === 'paused';
	const isIdle = !isThisProject;
	const otherProjectActive = timer != null && !isThisProject;

	const handleStart = () => {
		if (otherProjectActive) {
			return;
		}

		start({ id: projectId, name: projectName });
	};

	if (isIdle && !compact) {
		return (
			<section
				className={cn(
					'rounded-3xl border border-dashed border-primary/30 bg-gradient-to-br from-primary/5 via-card to-violet-500/5 p-5',
					otherProjectActive && 'opacity-60',
				)}
			>
				<div className='flex items-start gap-3'>
					<div className='flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary'>
						<Timer size={24} aria-hidden />
					</div>
					<div className='min-w-0 flex-1'>
						<h2 className='text-lg font-black text-foreground'>تایمر تمرکز</h2>
						<p className='mt-1 text-sm text-muted-foreground'>
							پومودورو {toFaNumber(POMODORO_FOCUS_MINUTES)} دقیقه‌ای · شروع، توقف، ثبت در تایم‌شیت
						</p>
						{otherProjectActive && (
							<p className='mt-2 text-xs font-bold text-amber-600 dark:text-amber-400'>
								تایمر برای «{timer.projectName}» فعال است
							</p>
						)}
						<Button
							type='button'
							className='mt-4 w-full sm:w-auto'
							haptic='medium'
							disabled={otherProjectActive}
							onClick={handleStart}
						>
							<Play size={18} aria-hidden />
							شروع تمرکز
						</Button>
					</div>
				</div>
			</section>
		);
	}

	if (isIdle && compact) {
		return (
			<Button
				type='button'
				variant='secondary'
				size='sm'
				haptic='medium'
				disabled={otherProjectActive}
				onClick={handleStart}
			>
				<Play size={16} aria-hidden />
				تمرکز
			</Button>
		);
	}

	if (!isThisProject) {
		return null;
	}

	return (
		<section
			className={cn(
				'rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-indigo-500/10 p-5 shadow-[var(--shadow-soft)]',
				isRunning && 'ring-2 ring-primary/20',
				compact && 'p-4',
			)}
		>
			<div className='mb-3 flex items-center justify-between gap-2'>
				<div>
					<p className='text-xs font-bold text-primary'>در حال تمرکز</p>
					{completedPomodoros > 0 && (
						<p className='text-xs text-muted-foreground'>
							{toFaNumber(completedPomodoros)} پومودورو تمام شد
						</p>
					)}
				</div>
				<p className='text-xs text-muted-foreground'>
					باقی‌مانده: <span dir='ltr'>{formatPomodoroBlockRemaining(elapsedMs)}</span>
				</p>
			</div>

			<FocusTimerRing progress={pomodoroProgress} isRunning={isRunning}>
				<p className='text-4xl font-black tabular-nums text-foreground' dir='ltr'>
					{formatElapsedClock(elapsedMs)}
				</p>
				<p className='mt-1 text-xs text-muted-foreground'>پومودورو {toFaNumber(POMODORO_FOCUS_MINUTES)} دقیقه</p>
			</FocusTimerRing>

			<div className='mt-5 flex gap-2'>
				{isRunning ? (
					<Button type='button' variant='secondary' className='flex-1' haptic='light' onClick={pause}>
						<Pause size={18} aria-hidden />
						مکث
					</Button>
				) : (
					<Button type='button' className='flex-1' haptic='selection' onClick={resume}>
						<Play size={18} aria-hidden />
						ادامه
					</Button>
				)}
				<Button
					type='button'
					variant='danger'
					className='flex-1'
					haptic='warning'
					onClick={requestStop}
				>
					<Square size={18} aria-hidden />
					پایان
				</Button>
			</div>

			{isPaused && (
				<p className='mt-3 text-center text-xs text-muted-foreground'>مکث · برای ثبت، پایان را بزن</p>
			)}
		</section>
	);
}
