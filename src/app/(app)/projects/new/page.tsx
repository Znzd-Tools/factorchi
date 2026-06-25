import { PageHeader } from '@/components/ui/PageHeader';
import { ProjectForm } from '@/features/projects/components/ProjectForm';

export default function NewProjectPage() {
	return (
		<div className='space-y-6 pb-2'>
			<PageHeader title='پروژه جدید' description='در دو مرحله: اطلاعات پایه، سپس مالی.' />
			<ProjectForm mode='create' />
		</div>
	);
}
