'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface IFocusTimerRingProps {
	progress: number;
	isRunning: boolean;
	children: ReactNode;
}

const SIZE = 220;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function FocusTimerRing({ progress, isRunning, children }: IFocusTimerRingProps) {
	const offset = CIRCUMFERENCE * (1 - Math.min(1, Math.max(0, progress)));

	return (
		<div className='relative mx-auto flex items-center justify-center' style={{ width: SIZE, height: SIZE }}>
			<svg
				width={SIZE}
				height={SIZE}
				className={cn('-rotate-90', isRunning && 'animate-[timer-ring-pulse_2.5s_ease-in-out_infinite]')}
				aria-hidden
			>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					fill='none'
					stroke='currentColor'
					strokeWidth={STROKE}
					className='text-muted/80'
				/>
				<circle
					cx={SIZE / 2}
					cy={SIZE / 2}
					r={RADIUS}
					fill='none'
					stroke='currentColor'
					strokeWidth={STROKE}
					strokeLinecap='round'
					strokeDasharray={CIRCUMFERENCE}
					strokeDashoffset={offset}
					className='text-primary transition-[stroke-dashoffset] duration-300'
				/>
			</svg>
			<div className='absolute inset-0 flex flex-col items-center justify-center'>{children}</div>
		</div>
	);
}
