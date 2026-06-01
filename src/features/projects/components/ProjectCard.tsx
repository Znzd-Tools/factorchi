import { ChevronLeft, FolderKanban } from 'lucide-react';

import { HapticLink } from '@/components/ui/HapticLink';
import { ROUTES } from '@/config/routes';
import { getCurrencyLabel } from '@/features/invoice/constants/currencies';
import { formatMoney } from '@/lib/money';
import type { Project } from '@/lib/supabase/database.types';
import { cn } from '@/lib/utils/cn';

interface IProjectCardProps {
	project: Project;
}

const TYPE_LABELS: Record<Project['type'], string> = {
	hourly: 'ساعتی',
	total: 'مبلغ ثابت',
};

export function ProjectCard({ project }: IProjectCardProps) {
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
				'block rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-transform active:scale-[0.99]',
			)}
		>
			<div className='flex items-start gap-3'>
				<div className='flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
					<FolderKanban size={20} aria-hidden />
				</div>
				<div className='min-w-0 flex-1'>
					<h3 className='truncate text-base font-bold text-foreground'>{project.name}</h3>
					<p className='mt-0.5 truncate text-sm text-muted-foreground'>{project.client_name}</p>
				</div>
				<ChevronLeft size={18} className='shrink-0 text-muted-foreground' aria-hidden />
			</div>
			<div className='mt-4 flex flex-wrap items-center gap-2'>
				<span className='rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground'>
					{TYPE_LABELS[project.type]}
				</span>
				<span className='text-xs font-medium text-muted-foreground' dir='ltr'>
					{amountLabel}
				</span>
				{project.status === 'archived' && (
					<span className='rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-300'>
						بایگانی
					</span>
				)}
			</div>
		</HapticLink>
	);
}
