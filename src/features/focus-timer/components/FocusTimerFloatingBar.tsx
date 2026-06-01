'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Pause, Play, Square } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { useFocusTimer } from '@/features/focus-timer/context/FocusTimerContext';
import { formatElapsedClock } from '@/features/focus-timer/utils/timer-format';
import { cn } from '@/lib/utils/cn';

export function FocusTimerFloatingBar() {
	const pathname = usePathname();
	const { timer, elapsedMs, isActive, pause, resume, requestStop } = useFocusTimer();

	if (!isActive || !timer) {
		return null;
	}

	const onThisProject = pathname.startsWith(`/projects/${timer.projectId}`);

	if (onThisProject) {
		return null;
	}

	const isRunning = timer.status === 'running';
	const onProjectDetail = /^\/projects\/[^/]+/.test(pathname);

	return (
		<div
			className={cn(
				'no-print fixed inset-x-4 z-40 mx-auto max-w-lg rounded-2xl border border-primary/30 bg-card/95 p-3 shadow-[var(--shadow-elevated)] backdrop-blur-xl',
				onProjectDetail
					? 'bottom-[calc(var(--safe-bottom)+5.25rem)]'
					: 'bottom-[calc(var(--safe-bottom)+var(--bottom-nav-height)+0.75rem)]',
				'md:bottom-[calc(var(--safe-bottom)+1rem)]',
			)}
			role='status'
			aria-live='polite'
		>
			<div className='flex items-center gap-3'>
				<Link
					href={ROUTES.project(timer.projectId)}
					className='min-w-0 flex-1 rounded-xl px-1 active:bg-muted'
				>
					<p className='truncate text-xs font-bold text-primary'>تمرکز</p>
					<p className='truncate text-sm font-black text-foreground'>{timer.projectName}</p>
					<p className='text-lg font-black tabular-nums text-foreground' dir='ltr'>
						{formatElapsedClock(elapsedMs)}
					</p>
				</Link>
				<div className='flex shrink-0 gap-1'>
					{isRunning ? (
						<Button type='button' variant='secondary' size='sm' haptic='light' onClick={pause} aria-label='مکث'>
							<Pause size={16} />
						</Button>
					) : (
						<Button type='button' size='sm' haptic='selection' onClick={resume} aria-label='ادامه'>
							<Play size={16} />
						</Button>
					)}
					<Button type='button' variant='danger' size='sm' haptic='warning' onClick={requestStop} aria-label='پایان'>
						<Square size={16} />
					</Button>
				</div>
			</div>
		</div>
	);
}
