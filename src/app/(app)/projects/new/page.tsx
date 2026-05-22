import { Card } from '@/components/atoms/Card';
import { ProjectForm } from '@/features/projects/components/ProjectForm';
import { requireUser } from '@/lib/auth/require-user';

export default async function NewProjectPage() {
	await requireUser();

	return (
		<div className='mx-auto max-w-2xl space-y-6'>
			<div>
				<h1 className='text-2xl font-black text-slate-900'>پروژه جدید</h1>
				<p className='mt-1 text-sm text-slate-500'>اطلاعات پروژه و کارفرما را وارد کنید.</p>
			</div>
			<Card>
				<ProjectForm mode='create' />
			</Card>
		</div>
	);
}
