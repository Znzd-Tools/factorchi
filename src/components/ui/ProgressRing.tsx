import { toFaNumber } from '@/lib/locale/persian-digits';
import { cn } from '@/lib/utils/cn';

interface IProgressRingProps {
	percent: number;
	label: string;
	subLabel: string;
	complete?: boolean;
	className?: string;
}

const SIZE = 88;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ProgressRing({ percent, label, subLabel, complete, className }: IProgressRingProps) {
	const clamped = Math.min(100, Math.max(0, percent));
	const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

	return (
		<div className={cn('flex flex-col items-center gap-2', className)}>
			<div className='relative' style={{ width: SIZE, height: SIZE }}>
				<svg width={SIZE} height={SIZE} className='-rotate-90' aria-hidden>
					<circle
						cx={SIZE / 2}
						cy={SIZE / 2}
						r={RADIUS}
						fill='none'
						stroke='currentColor'
						strokeWidth={STROKE}
						className='text-muted'
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
						className={cn(
							'transition-[stroke-dashoffset] duration-500',
							complete ? 'text-emerald-500' : 'text-primary',
						)}
					/>
				</svg>
				<div className='absolute inset-0 flex flex-col items-center justify-center'>
					<span className='text-lg font-black text-foreground'>{toFaNumber(clamped)}٪</span>
				</div>
			</div>
			<div className='text-center'>
				<p className='text-xs font-bold text-foreground'>{label}</p>
				<p className='mt-0.5 text-[11px] text-muted-foreground' dir='ltr'>
					{subLabel}
				</p>
			</div>
		</div>
	);
}
