import type { IProjectHealth } from '@/features/projects/utils/project-health';
import { cn } from '@/lib/utils/cn';

interface IProjectHealthBadgeProps {
	health: IProjectHealth;
	className?: string;
}

const levelStyles = {
	healthy: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
	warning: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
	critical: 'bg-red-500/15 text-red-700 dark:text-red-300',
} as const;

const levelEmoji = {
	healthy: '🟢',
	warning: '🟡',
	critical: '🔴',
} as const;

export function ProjectHealthBadge({ health, className }: IProjectHealthBadgeProps) {
	return (
		<div
			className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5', levelStyles[health.level], className)}
			title={health.hint}
		>
			<span aria-hidden>{levelEmoji[health.level]}</span>
			<span className='text-[10px] font-black'>{health.label}</span>
		</div>
	);
}
