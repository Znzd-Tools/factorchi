'use client';

import Link from 'next/link';
import { Pause, Play, Square, Timer, X } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { useFocusTimer } from '@/features/focus-timer/context/FocusTimerContext';
import { FocusTimerRing } from '@/features/focus-timer/components/FocusTimerRing';
import {
	formatElapsedClock,
	formatPomodoroBlockRemaining,
} from '@/features/focus-timer/utils/timer-format';
import { getCurrentPomodoroIndex } from '@/features/focus-timer/utils/timer-math';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { cn } from '@/lib/utils/cn';

interface IFocusTimerPanelProps {
	projectId: string;
	projectName: string;
	pomodoroMinutes: number;
	compact?: boolean;
}

export function FocusTimerPanel({
	projectId,
	projectName,
	pomodoroMinutes,
	compact = false,
}: IFocusTimerPanelProps) {
	const {
		timer,
		elapsedMs,
		pomodoroMinutes: activePomodoroMinutes,
		pomodoroProgress,
		completedPomodoros,
		onPomodoroBreak,
		start,
		pause,
		resume,
		requestStop,
		cancelSession,
		syncPomodoroMinutes,
	} = useFocusTimer();

	useEffect(() => {
		syncPomodoroMinutes(projectId, pomodoroMinutes);
	}, [projectId, pomodoroMinutes, syncPomodoroMinutes]);

	const displayMinutes = timer?.projectId === projectId ? activePomodoroMinutes : pomodoroMinutes;
	const isThisProject = timer?.projectId === projectId;
	const isRunning = isThisProject && timer.status === 'running';
	const isPaused = isThisProject && timer.status === 'paused';
	const isIdle = !isThisProject;
	const otherProjectActive = timer != null && !isThisProject;
	const currentBlock = isThisProject
		? getCurrentPomodoroIndex(elapsedMs, displayMinutes)
		: 1;

	const handleStart = () => {
		if (otherProjectActive) {
			return;
		}

		start({ id: projectId, name: projectName, pomodoroMinutes });
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
							هر پومودورو {toFaNumber(displayMinutes)} دقیقه · بعد از هر راند استراحت و «ادامه»
						</p>
						<Link
							href={ROUTES.projectSettings(projectId)}
							className='mt-2 inline-block text-xs font-bold text-primary'
						>
							تغییر مدت پومودورو در تنظیمات
						</Link>
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
				onPomodoroBreak && 'border-accent/40',
				compact && 'p-4',
			)}
		>
			{onPomodoroBreak && (
				<div className='mb-3 rounded-xl bg-accent/15 px-3 py-2.5 text-center text-sm font-bold text-accent'>
					پومودورو تمام شد — استراحت کن، بعد «ادامه» برای راند{' '}
					{toFaNumber(completedPomodoros + 1)}
				</div>
			)}

			<div className='mb-3 flex items-center justify-between gap-2'>
				<div>
					<p className='text-xs font-bold text-primary'>
						{isRunning ? 'در حال تمرکز' : 'مکث'}
					</p>
					<p className='text-xs text-muted-foreground'>
						پومودورو {toFaNumber(currentBlock)} · {toFaNumber(displayMinutes)} دقیقه
					</p>
					{completedPomodoros > 0 && (
						<p className='text-xs text-muted-foreground'>
							{toFaNumber(completedPomodoros)} راند تمام‌شده
						</p>
					)}
				</div>
				{isRunning && (
					<p className='text-xs text-muted-foreground'>
						باقی‌مانده:{' '}
						<span dir='ltr'>{formatPomodoroBlockRemaining(elapsedMs, displayMinutes)}</span>
					</p>
				)}
			</div>

			<FocusTimerRing progress={pomodoroProgress} isRunning={isRunning}>
				<p className='text-4xl font-black tabular-nums text-foreground' dir='ltr'>
					{formatElapsedClock(elapsedMs)}
				</p>
				<p className='mt-1 text-xs text-muted-foreground'>کل جلسه</p>
			</FocusTimerRing>

			<div className='mt-5 flex flex-col gap-2'>
				<div className='flex gap-2'>
					{isRunning ? (
						<Button type='button' variant='secondary' className='flex-1' haptic='light' onClick={pause}>
							<Pause size={18} aria-hidden />
							مکث
						</Button>
					) : (
						<Button type='button' className='flex-1' haptic='selection' onClick={resume}>
							<Play size={18} aria-hidden />
							{onPomodoroBreak ? 'ادامه (راند بعد)' : 'ادامه'}
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
						پایان و ثبت
					</Button>
				</div>
				<Button
					type='button'
					variant='ghost'
					className='w-full text-muted-foreground'
					haptic='light'
					onClick={cancelSession}
				>
					<X size={18} aria-hidden />
					لغو جلسه
				</Button>
			</div>

			{isPaused && !onPomodoroBreak && (
				<p className='mt-3 text-center text-xs text-muted-foreground'>
					مکث دستی · «پایان و ثبت» برای تایم‌شیت (حداقل یک دقیقه) · «لغو جلسه» بدون ثبت
				</p>
			)}
		</section>
	);
}
