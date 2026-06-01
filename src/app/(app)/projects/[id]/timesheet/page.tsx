import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import { listOpenProjectTodos } from '@/features/todos/queries/project-todo.queries';
import { getMonthlyEntries } from '@/features/timesheet/queries/time-entry.queries';
import { MonthPicker, MonthPickerFallback } from '@/features/timesheet/components/MonthPicker';
import { TimesheetEntriesTable } from '@/features/timesheet/components/TimesheetEntriesTable';
import { aggregateMonthly } from '@/features/timesheet/utils/aggregate';
import { resolveJalaliMonthParams } from '@/features/timesheet/utils/month-params';
import { getCurrencyLabel } from '@/features/invoice/constants/currencies';
import { requireUser } from '@/lib/auth/require-user';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { createClient } from '@/lib/supabase/server';

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
			<Card title='تایم‌شیت در دسترس نیست'>
				<p className='text-sm leading-relaxed text-muted-foreground'>
					این پروژه از نوع «قرارداد کل» است و ثبت ساعت برای آن فعال نیست.
				</p>
				<div className='mt-4'>
					<Link href={ROUTES.project(id)}>
						<Button variant='secondary'>بازگشت به داشبورد پروژه</Button>
					</Link>
				</div>
			</Card>
		);
	}

	const [entries, openTodos] = await Promise.all([
		getMonthlyEntries(id, sp.year, sp.month),
		listOpenProjectTodos(id),
	]);
	const totals = aggregateMonthly(entries);
	const currencyLabel = getCurrencyLabel(project.currency);

	return (
		<div className='space-y-5'>
			<Suspense fallback={<MonthPickerFallback />}>
				<MonthPicker />
			</Suspense>

			<div key={`${sp.year}-${sp.month}`} className='grid grid-cols-2 gap-3'>
				<Card title='مجموع ساعات' className='p-4'>
					<p className='text-2xl font-black tabular-nums text-foreground' dir='ltr'>
						{formatHoursAsDurationFa(totals.totalHours)}
					</p>
				</Card>
				<Card title='مجموع مبلغ' className='p-4'>
					<p className='text-2xl font-black tabular-nums text-foreground'>
						{formatMoney(totals.totalAmount)}{' '}
						<span className='text-sm font-bold text-muted-foreground'>{currencyLabel}</span>
					</p>
				</Card>
			</div>

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
}
