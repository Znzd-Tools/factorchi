import { Card } from '@/components/atoms/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectForm } from '@/features/projects/components/ProjectForm';

export default function NewProjectPage() {
	return (
		<div className='space-y-6 pb-2'>
			<PageHeader title='پروژه جدید' description='اطلاعات پروژه و کارفرما را وارد کنید.' />
			<Card>
				<ProjectForm mode='create' />
			</Card>
		</div>
	);
}
