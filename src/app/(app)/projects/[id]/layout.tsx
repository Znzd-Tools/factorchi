import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { FilePlus2 } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { ProjectHealthBadge } from '@/features/projects/components/ProjectHealthBadge';
import { ProjectTabs } from '@/features/projects/components/ProjectTabs';
import { buildProjectHealthMap } from '@/features/projects/utils/project-health';
import { getCurrentJalaliMonth, getJalaliMonthRange } from '@/lib/jalali';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

interface IProjectLayoutProps {
	children: React.ReactNode;
	params: Promise<{ id: string }>;
}

export default async function ProjectLayout({ children, params }: IProjectLayoutProps) {
	const { id } = await params;
	await requireUser();
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.eq('user_id', user!.id)
		.single();

	if (!project) {
		notFound();
	}

	const { year, month } = getCurrentJalaliMonth();
	const monthRange = getJalaliMonthRange(year, month);

	const [{ data: invoices }, { data: timeEntries }] = await Promise.all([
		supabase.from('invoices').select('project_id, status, total').eq('project_id', project.id),
		supabase
			.from('time_entries')
			.select('project_id, hours, rate_at_entry, work_date')
			.eq('project_id', project.id),
	]);

	const healthMap = buildProjectHealthMap(
		[project],
		invoices ?? [],
		timeEntries ?? [],
		monthRange.startIso,
		monthRange.endIso,
	);
	const health = healthMap.get(project.id);

	return (
		<div className='space-y-5 pb-24 md:pb-6'>
			<div className='no-print space-y-2'>
				{health && <ProjectHealthBadge health={health} />}
				<div>
					<h1 className='text-xl font-black text-foreground sm:text-2xl'>{project.name}</h1>
					<p className='mt-1 text-sm text-muted-foreground'>{project.client_name}</p>
					{health && (
						<p className='mt-1 text-xs text-muted-foreground'>{health.hint}</p>
					)}
				</div>
			</div>

			<Suspense fallback={<div className='no-print h-12 animate-pulse rounded-2xl bg-muted' />}>
				<div className='no-print'>
					<ProjectTabs projectId={project.id} projectType={project.type} />
				</div>
			</Suspense>

			{children}

			<div className='no-print fixed inset-x-0 bottom-[calc(var(--safe-bottom)+0.75rem)] z-30 px-4 md:static md:z-auto md:px-0 md:pt-2'>
				<Link href={ROUTES.projectInvoiceNew(project.id)} className='mx-auto block max-w-lg md:max-w-none'>
					<Button className='w-full shadow-[var(--shadow-elevated)]' size='lg' haptic='medium'>
						<FilePlus2 size={18} />
						صدور فاکتور
					</Button>
				</Link>
			</div>
		</div>
	);
}
