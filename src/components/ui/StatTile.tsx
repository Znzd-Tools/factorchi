import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

interface IStatTileProps {
	label: string;
	value: string;
	icon: LucideIcon;
	tone?: 'default' | 'primary' | 'success' | 'warning';
	className?: string;
}

const toneClasses = {
	default: 'text-foreground',
	primary: 'text-primary',
	success: 'text-success',
	warning: 'text-warning',
} as const;

export function StatTile({ label, value, icon: Icon, tone = 'default', className }: IStatTileProps) {
	return (
		<div
			className={cn(
				'rounded-xl border border-border bg-card p-4',
				className,
			)}
		>
			<div className='flex items-center justify-between gap-2'>
				<span className='text-xs font-medium text-muted-foreground'>{label}</span>
				<Icon size={16} className='text-muted-foreground' aria-hidden />
			</div>
			<p
				className={cn('mt-2 text-xl font-black tabular-nums sm:text-2xl', toneClasses[tone])}
				dir='ltr'
			>
				{value}
			</p>
		</div>
	);
}
