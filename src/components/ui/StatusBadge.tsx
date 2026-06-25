import { cn } from '@/lib/utils/cn';

type StatusTone = 'healthy' | 'warning' | 'critical' | 'neutral' | 'info';

interface IStatusBadgeProps {
	label: string;
	tone?: StatusTone;
	className?: string;
}

const toneClasses: Record<StatusTone, string> = {
	healthy: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	critical: 'bg-destructive/10 text-destructive',
	neutral: 'bg-muted text-muted-foreground',
	info: 'bg-info/10 text-info',
};

export function StatusBadge({ label, tone = 'neutral', className }: IStatusBadgeProps) {
	return (
		<span
			className={cn(
				'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold',
				toneClasses[tone],
				className,
			)}
		>
			{label}
		</span>
	);
}
