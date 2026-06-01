'use client';

import { useEffect, useMemo } from 'react';

import { CELEBRATIONS } from '@/features/engagement/constants/celebrations';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

const BURST_COLORS = ['#6366f1', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6'];

function ConfettiBurst() {
	const pieces = useMemo(
		() =>
			Array.from({ length: 28 }, (_, index) => ({
				id: index,
				left: `${(index * 17) % 100}%`,
				delay: `${(index % 7) * 40}ms`,
				color: BURST_COLORS[index % BURST_COLORS.length],
				rotate: `${(index * 23) % 360}deg`,
			})),
		[],
	);

	return (
		<div className='pointer-events-none absolute inset-0 overflow-hidden' aria-hidden>
			{pieces.map((piece) => (
				<span
					key={piece.id}
					className='absolute top-0 size-2.5 animate-[confetti-fall_1.4s_ease-out_forwards] rounded-sm opacity-90'
					style={{
						left: piece.left,
						backgroundColor: piece.color,
						animationDelay: piece.delay,
						transform: `rotate(${piece.rotate})`,
					}}
				/>
			))}
		</div>
	);
}

export function CelebrationOverlay() {
	const { activeId, dismiss } = useCelebration();

	useEffect(() => {
		if (!activeId) {
			return;
		}

		const config = CELEBRATIONS[activeId];
		triggerHaptic(config.intensity === 'burst' ? 'celebration' : 'medium');

		const timer = window.setTimeout(dismiss, config.intensity === 'burst' ? 2800 : 1600);

		return () => window.clearTimeout(timer);
	}, [activeId, dismiss]);

	if (!activeId) {
		return null;
	}

	const config = CELEBRATIONS[activeId];

	return (
		<div
			className='fixed inset-0 z-[200] flex items-end justify-center p-4 pb-[calc(5rem+var(--safe-bottom))] sm:items-center sm:p-6'
			role='status'
			aria-live='polite'
		>
			<button
				type='button'
				className='absolute inset-0 bg-foreground/25 backdrop-blur-[2px]'
				onClick={dismiss}
				aria-label='بستن'
			/>
			<div
				className={cn(
					'relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card p-6 text-center shadow-[var(--shadow-elevated)]',
					config.intensity === 'burst' && 'animate-[celebration-pop_0.45s_ease-out]',
				)}
			>
				{config.intensity === 'burst' && <ConfettiBurst />}
				<div className='relative z-10'>
					<p className='text-4xl' aria-hidden>
						{config.intensity === 'burst' ? '🎉' : '✓'}
					</p>
					<h2 className='mt-3 text-xl font-black text-foreground'>{config.title}</h2>
					<p className='mt-2 text-sm leading-relaxed text-muted-foreground'>{config.message}</p>
					<button
						type='button'
						onClick={dismiss}
						className='mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-opacity active:opacity-90'
					>
						عالیه!
					</button>
				</div>
			</div>
		</div>
	);
}
