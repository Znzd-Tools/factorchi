import Link from 'next/link';

import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import { CURRENCIES } from '@/features/invoice/constants/currencies';
import { formatMoney } from '@/lib/money';
import type { Project } from '@/lib/supabase/database.types';

interface IProjectCardProps {
	project: Project;
}

const TYPE_LABELS: Record<Project['type'], string> = {
	hourly: 'ساعتی',
	total: 'مبلغ ثابت',
};

export function ProjectCard({ project }: IProjectCardProps) {
	const currencyLabel = CURRENCIES[project.currency as keyof typeof CURRENCIES]?.label ?? project.currency;
	const amountLabel =
		project.type === 'hourly'
			? `${formatMoney(project.hourly_rate ?? 0)} ${currencyLabel} / ساعت`
			: `${formatMoney(project.total_amount ?? 0)} ${currencyLabel}`;

	return (
		<Link href={ROUTES.project(project.id)} className='block transition-opacity hover:opacity-90'>
			<Card className='h-full'>
				<h3 className='text-lg font-bold text-slate-900'>{project.name}</h3>
				<p className='mt-1 text-sm text-slate-500'>{project.client_name}</p>
				<div className='mt-4 flex flex-wrap items-center gap-2 text-sm'>
					<span className='rounded-full bg-slate-100 px-3 py-1 text-slate-700'>
						{TYPE_LABELS[project.type]}
					</span>
					<span className='text-slate-600' dir='ltr'>
						{amountLabel}
					</span>
					{project.status === 'archived' && (
						<span className='rounded-full bg-amber-100 px-3 py-1 text-amber-800'>بایگانی</span>
					)}
				</div>
			</Card>
		</Link>
	);
}
