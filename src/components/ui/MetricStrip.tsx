import type { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils/cn';

export interface IMetricItem {
	label: string;
	value: string;
	icon?: LucideIcon;
	tone?: 'default' | 'primary' | 'success' | 'warning';
}

interface IMetricStripProps {
	items: IMetricItem[];
	className?: string;
}

const toneValueClasses = {
	default: 'text-foreground',
	primary: 'text-primary',
	success: 'text-success',
	warning: 'text-warning',
} as const;

export function MetricStrip({ items, className }: IMetricStripProps) {
	return (
		<div className={cn('grid grid-cols-3 gap-2 sm:gap-3', className)}>
			{items.map((item) => {
				const Icon = item.icon;
				const tone = item.tone ?? 'default';

				return (
					<div
						key={item.label}
						className='rounded-xl border border-border bg-card px-3 py-3 sm:px-4 sm:py-4'
					>
						<div className='flex items-center justify-between gap-1'>
							<span className='text-[11px] font-medium text-muted-foreground sm:text-xs'>
								{item.label}
							</span>
							{Icon && (
								<Icon size={14} className='shrink-0 text-muted-foreground' aria-hidden />
							)}
						</div>
						<p
							className={cn(
								'mt-1.5 text-base font-black tabular-nums sm:text-lg',
								toneValueClasses[tone],
							)}
							dir='ltr'
						>
							{item.value}
						</p>
					</div>
				);
			})}
		</div>
	);
}
