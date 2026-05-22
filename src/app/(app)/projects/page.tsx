import Link from 'next/link';

import { Button } from '@/components/atoms/Button';
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
		<div className='space-y-6'>
			<div className='flex flex-wrap items-center justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-black text-slate-900'>پروژه‌ها</h1>
					<p className='mt-1 text-sm text-slate-500'>مدیریت پروژه‌ها، زمان و فاکتورها</p>
				</div>
				<Link href={ROUTES.projectNew}>
					<Button>پروژه جدید</Button>
				</Link>
			</div>

			{activeProjects.length === 0 ? (
				<div className='rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center'>
					<p className='text-slate-600'>هنوز پروژه‌ای ثبت نشده است.</p>
					<Link href={ROUTES.projectNew} className='mt-4 inline-block'>
						<Button>ایجاد اولین پروژه</Button>
					</Link>
				</div>
			) : (
				<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
					{activeProjects.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}
		</div>
	);
}
