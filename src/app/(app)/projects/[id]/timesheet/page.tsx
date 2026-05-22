import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { ROUTES } from '@/config/routes';
import { getMonthlyEntries } from '@/features/timesheet/queries/time-entry.queries';
import { MonthPicker, MonthPickerFallback } from '@/features/timesheet/components/MonthPicker';
import { TimesheetEntriesTable } from '@/features/timesheet/components/TimesheetEntriesTable';
import { aggregateMonthly } from '@/features/timesheet/utils/aggregate';
import { resolveJalaliMonthParams } from '@/features/timesheet/utils/month-params';
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
			<div className='space-y-6'>
				<div>
					<h1 className='text-2xl font-black text-slate-900'>تایم‌شیت</h1>
					<p className='mt-1 text-sm text-slate-500'>{project.name}</p>
				</div>
				<Card title='تایم‌شیت در دسترس نیست'>
					<p className='text-sm text-slate-600'>
						این پروژه از نوع «قرارداد کل» است و ثبت ساعت برای آن فعال نیست.
					</p>
					<div className='mt-4'>
						<Link href={ROUTES.project(id)}>
							<Button variant='secondary'>بازگشت به داشبورد پروژه</Button>
						</Link>
					</div>
				</Card>
			</div>
		);
	}

	const entries = await getMonthlyEntries(id, sp.year, sp.month);
	const totals = aggregateMonthly(entries);

	return (
		<div className='space-y-6'>
			<div className='flex flex-wrap items-start justify-between gap-4'>
				<div>
					<h1 className='text-2xl font-black text-slate-900'>تایم‌شیت</h1>
					<p className='mt-1 text-sm text-slate-500'>{project.name}</p>
				</div>
				<Link href={ROUTES.project(id)}>
					<Button variant='secondary'>بازگشت به داشبورد</Button>
				</Link>
			</div>

			<Suspense fallback={<MonthPickerFallback />}>
				<MonthPicker />
			</Suspense>

			<div className='space-y-4'>
				<div key={`${sp.year}-${sp.month}`} className='grid gap-4 sm:grid-cols-2'>
					<Card title='مجموع ساعات'>
						<p className='text-3xl font-black tabular-nums text-foreground' dir='ltr'>
							{formatHoursAsDurationFa(totals.totalHours)}
						</p>
					</Card>
					<Card title='مجموع مبلغ'>
						<p className='text-3xl font-black tabular-nums text-slate-900'>
							{formatMoney(totals.totalAmount)}{' '}
							<span className='text-base font-bold text-slate-500'>{project.currency}</span>
						</p>
					</Card>
				</div>

				<TimesheetEntriesTable
					projectId={id}
					currency={project.currency}
					year={sp.year}
					month={sp.month}
					entries={entries}
				/>
			</div>
		</div>
	);
}
