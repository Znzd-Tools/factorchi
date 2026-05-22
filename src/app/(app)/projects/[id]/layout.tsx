import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowRight, FilePlus2 } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';
import { ProjectTabs } from '@/features/projects/components/ProjectTabs';
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

	return (
		<div className='space-y-4'>
			<div className='no-print flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div>
					<Link
						href={ROUTES.projects}
						className='inline-flex items-center gap-1 text-sm text-blue-600 hover:underline'
					>
						<ArrowRight size={14} />
						همه پروژه‌ها
					</Link>
					<h1 className='mt-2 text-2xl font-black text-foreground'>{project.name}</h1>
					<p className='mt-1 text-sm text-muted-foreground'>{project.client_name}</p>
				</div>
				<Link href={ROUTES.projectInvoiceNew(project.id)} className='shrink-0'>
					<Button className='w-full sm:w-auto'>
						<FilePlus2 size={16} />
						صدور فاکتور
					</Button>
				</Link>
			</div>

			<Suspense
				fallback={<div className='no-print h-11 animate-pulse rounded-t-xl bg-muted' />}
			>
				<div className='no-print'>
					<ProjectTabs projectId={project.id} projectType={project.type} />
				</div>
			</Suspense>
			{children}
		</div>
	);
}
