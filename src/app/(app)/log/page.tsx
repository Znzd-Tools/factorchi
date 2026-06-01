import { PageHeader } from '@/components/ui/PageHeader';
import { QuickLogForm } from '@/features/timesheet/components/QuickLogForm';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function QuickLogPage() {
	const user = await requireUser();
	const supabase = await createClient();

	const { data: projects } = await supabase
		.from('projects')
		.select('id, name, client_name')
		.eq('user_id', user.id)
		.eq('status', 'active')
		.eq('type', 'hourly')
		.not('hourly_rate', 'is', null)
		.order('updated_at', { ascending: false });

	return (
		<div className='mx-auto max-w-md space-y-6 pb-8'>
			<PageHeader
				title='ثبت سریع'
				description='برای امروز؛ بدون فرم طولانی. از صفحه اصلی یا میان‌بر نصب‌شده باز کن.'
			/>
			<QuickLogForm
				projects={(projects ?? []).map((project) => ({
					id: project.id,
					name: project.name,
					client_name: project.client_name,
				}))}
			/>
		</div>
	);
}
