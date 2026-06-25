import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { ProjectsPortfolio } from '@/features/projects/components/ProjectsPortfolio';
import { buildProjectHealthMap } from '@/features/projects/utils/project-health';
import { getCurrentJalaliMonth, getJalaliMonthRange } from '@/lib/jalali';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function ProjectsPage() {
	await requireUser();
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	const { data: projects } = await supabase
		.from('projects')
		.select('*')
		.eq('user_id', user!.id)
		.order('updated_at', { ascending: false });

	const allProjects = projects ?? [];
	const projectIds = allProjects.map((project) => project.id);

	const { year, month } = getCurrentJalaliMonth();
	const monthRange = getJalaliMonthRange(year, month);

	const [{ data: invoices }, { data: timeEntries }] =
		projectIds.length > 0
			? await Promise.all([
					supabase
						.from('invoices')
						.select('project_id, status, total')
						.in('project_id', projectIds),
					supabase
						.from('time_entries')
						.select('project_id, hours, rate_at_entry, work_date')
						.in('project_id', projectIds),
				])
			: [{ data: [] }, { data: [] }];

	const healthByProject = buildProjectHealthMap(
		allProjects,
		invoices ?? [],
		timeEntries ?? [],
		monthRange.startIso,
		monthRange.endIso,
	);

	const activeCount = allProjects.filter((project) => project.status === 'active').length;

	return (
		<div className='space-y-6 pb-2'>
			<PageHeader
				title='پروژه‌ها'
				description='مدیریت مشتری‌ها، زمان و فاکتورها'
				action={
					<Link href={ROUTES.projectNew}>
						<Button size='sm' haptic='medium'>
							<Plus size={16} />
							<span className='sr-only sm:not-sr-only'>جدید</span>
						</Button>
					</Link>
				}
			/>

			{activeCount === 0 && allProjects.length === 0 ? (
				<EmptyState
					icon={FolderKanban}
					title='هنوز پروژه‌ای ندارید'
					description='اولین پروژه را بسازید تا ساعت و فاکتور را از همین‌جا مدیریت کنید.'
					action={
						<Link href={ROUTES.projectNew} className='block w-full'>
							<Button className='w-full' haptic='success'>
								ایجاد اولین پروژه
							</Button>
						</Link>
					}
				/>
			) : (
				<ProjectsPortfolio projects={allProjects} healthByProject={healthByProject} />
			)}
		</div>
	);
}
