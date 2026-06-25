import { ChevronLeft, FolderKanban } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { ProjectHealthBadge } from '@/features/projects/components/ProjectHealthBadge';
import { ROUTES } from '@/config/routes';
import { getCurrencyLabel } from '@/features/invoice/constants/currencies';
import type { IProjectHealth } from '@/features/projects/utils/project-health';
import { formatMoney } from '@/lib/money';
import type { Project } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IProjectListItemProps {
	project: Project;
	health: IProjectHealth;
}

const TYPE_LABELS: Record<Project['type'], string> = {
	hourly: 'ساعتی',
	total: 'مبلغ ثابت',
};

export function ProjectListItem({ project, health }: IProjectListItemProps) {
	const currencyLabel = getCurrencyLabel(project.currency);
	const amountLabel =
		project.type === 'hourly'
			? `${formatMoney(project.hourly_rate ?? 0)} ${currencyLabel} / ساعت`
			: `${formatMoney(project.total_amount ?? 0)} ${currencyLabel}`;

	return (
		<HapticLink
			href={ROUTES.project(project.id)}
			haptic='light'
			className={cn(
				'flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 transition-colors active:bg-muted',
				health.level === 'critical' && 'border-destructive/30',
				health.level === 'warning' && 'border-warning/30',
			)}
		>
			<div className='flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
				<FolderKanban size={18} aria-hidden />
			</div>
			<div className='min-w-0 flex-1'>
				<div className='flex flex-wrap items-center gap-2'>
					<p className='truncate text-sm font-bold text-foreground'>{project.name}</p>
					<ProjectHealthBadge health={health} />
				</div>
				<p className='mt-0.5 truncate text-xs text-muted-foreground'>{project.client_name}</p>
				<div className='mt-1.5 flex flex-wrap items-center gap-2'>
					<span className='text-[10px] font-bold text-muted-foreground'>
						{TYPE_LABELS[project.type]}
					</span>
					<span className='text-[10px] text-muted-foreground' dir='ltr'>
						{amountLabel}
					</span>
					{project.status === 'archived' && (
						<span className='rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-bold text-warning'>
							بایگانی
						</span>
					)}
				</div>
			</div>
			<ChevronLeft size={16} className='shrink-0 text-muted-foreground' aria-hidden />
		</HapticLink>
	);
}
