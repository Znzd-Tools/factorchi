import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/atoms/Button';
import { Disclosure } from '@/components/ui/Disclosure';
import { MetricStrip } from '@/components/ui/MetricStrip';
import { ROUTES } from '@/config/routes';
import { ProjectActionBar } from '@/features/projects/components/ProjectActionBar';
import { ProjectWorkShell } from '@/features/projects/components/ProjectWorkShell';
import { listOpenProjectTodos } from '@/features/todos/queries/project-todo.queries';
import { ProjectTodoList } from '@/features/todos/components/ProjectTodoList';
import { getMonthlyEntries } from '@/features/timesheet/queries/time-entry.queries';
import { MonthPicker, MonthPickerFallback } from '@/features/timesheet/components/MonthPicker';
import { TimesheetCsvPanel } from '@/features/timesheet/components/TimesheetCsvPanel';
import { TimesheetEntriesTable } from '@/features/timesheet/components/TimesheetEntriesTable';
import { aggregateMonthly } from '@/features/timesheet/utils/aggregate';
import { resolveJalaliMonthParams } from '@/features/timesheet/utils/month-params';
import { getCurrencyLabel } from '@/features/invoice/constants/currencies';
import { requireUser } from '@/lib/auth/require-user';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { getJalaliMonthRange } from '@/lib/jalali';
import { formatMoney } from '@/lib/money';
import { createClient } from '@/lib/supabase/server';
import { Clock } from 'lucide-react';

interface ITimesheetPageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export default async function TimesheetPage({ params, searchParams }: ITimesheetPageProps) {
	const user = await requireUser();
	const { id } = await params;
	const sp = await resolveJalaliMonthParams(await searchParams);
	const supabase = await createClient();

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	if (project.type !== 'hourly') {
		return (
			<div className='space-y-4'>
				<p className='text-sm leading-relaxed text-muted-foreground'>
					این پروژه از نوع «قرارداد کل» است. کارها را از بخش کار مدیریت کنید.
				</p>
				<Link href={ROUTES.projectTodos(id)}>
					<Button variant='secondary'>رفتن به کارها</Button>
				</Link>
			</div>
		);
	}

	const [entries, openTodos, todos] = await Promise.all([
		getMonthlyEntries(id, sp.year, sp.month),
		listOpenProjectTodos(id),
		supabase.from('project_todos').select('*').eq('project_id', id).order('created_at', { ascending: false }),
	]);
	const totals = aggregateMonthly(entries);
	const currencyLabel = getCurrencyLabel(project.currency);
	const monthRange = getJalaliMonthRange(sp.year, sp.month);

	const timeContent = (
		<div className='space-y-4'>
			<Suspense fallback={<MonthPickerFallback />}>
				<MonthPicker />
			</Suspense>

			<MetricStrip
				items={[
					{
						label: 'مجموع ساعات',
						value: formatHoursAsDurationFa(totals.totalHours),
						icon: Clock,
						tone: 'primary',
					},
					{
						label: 'مجموع مبلغ',
						value: `${formatMoney(totals.totalAmount)} ${currencyLabel}`,
						tone: 'success',
					},
					{
						label: 'ردیف‌ها',
						value: String(totals.entryCount),
						tone: 'default',
					},
				]}
			/>

			<Disclosure title='ورود و خروجی فایل' description='CSV import/export'>
				<TimesheetCsvPanel
					projectId={id}
					defaultStartDate={monthRange.startIso}
					defaultEndDate={monthRange.endIso}
				/>
			</Disclosure>

			<TimesheetEntriesTable
				projectId={id}
				currency={project.currency}
				year={sp.year}
				month={sp.month}
				entries={entries}
				openTodos={openTodos}
			/>
		</div>
	);

	const todosContent = (
		<ProjectTodoList
			projectId={id}
			projectType={project.type}
			initialTodos={todos.data ?? []}
		/>
	);

	return (
		<div className='space-y-4 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1rem)] md:pb-2'>
			<ProjectWorkShell
				projectId={id}
				projectType={project.type}
				timeContent={timeContent}
				todosContent={todosContent}
			/>
			<ProjectActionBar projectId={id} projectType={project.type} context='work' />
		</div>
	);
}
