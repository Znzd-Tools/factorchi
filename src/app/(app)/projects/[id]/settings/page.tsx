import { notFound } from 'next/navigation';

import { Surface } from '@/components/ui/Surface';
import { projectToFormValues } from '@/features/projects/utils/project-form';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

interface IProjectSettingsPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectSettingsPage({ params }: IProjectSettingsPageProps) {
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
		<div className='mx-auto max-w-2xl pb-6'>
			<Surface title='تنظیمات پروژه' description='ویرایش اطلاعات یا بایگانی'>
				<ProjectForm
					mode='edit'
					projectId={project.id}
					defaultValues={projectToFormValues(project)}
				/>
			</Surface>
		</div>
	);
}
