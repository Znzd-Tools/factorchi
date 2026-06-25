import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { ProjectHealthBadge } from '@/features/projects/components/ProjectHealthBadge';
import { WorkspaceNav } from '@/features/projects/components/WorkspaceNav';
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
		<div className='space-y-5 pb-6 md:pb-2'>
			<div className='no-print space-y-2'>
				{health && <ProjectHealthBadge health={health} />}
				<div>
					<h1 className='text-xl font-black text-foreground sm:text-2xl'>{project.name}</h1>
					<p className='mt-1 text-sm text-muted-foreground'>{project.client_name}</p>
					{health && <p className='mt-1 text-xs text-muted-foreground'>{health.hint}</p>}
				</div>
			</div>

			<div className='no-print flex flex-col gap-5 md:flex-row-reverse md:items-start'>
				<Suspense fallback={<div className='h-12 animate-pulse rounded-xl bg-muted md:w-44' />}>
					<WorkspaceNav projectId={project.id} projectType={project.type} />
				</Suspense>

				<div className='min-w-0 flex-1'>{children}</div>
			</div>
		</div>
	);
}
