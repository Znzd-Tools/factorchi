import Link from 'next/link';
import { FolderKanban, Plus } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/ui/PageHeader';
import { ROUTES } from '@/config/routes';
import { ProjectCard } from '@/features/projects/components/ProjectCard';
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
		.eq('status', 'active')
		.order('updated_at', { ascending: false });

	const activeProjects = projects ?? [];

	return (
		<div className='space-y-6 pb-2'>
			<PageHeader
				title='پروژه‌ها'
				description='مدیریت پروژه‌ها، زمان و فاکتورها'
				action={
					<Link href={ROUTES.projectNew}>
						<Button size='sm' haptic='medium'>
							<Plus size={16} />
							<span className='sr-only sm:not-sr-only'>جدید</span>
						</Button>
					</Link>
				}
			/>

			{activeProjects.length === 0 ? (
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
				<div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
					{activeProjects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}
		</div>
	);
}
