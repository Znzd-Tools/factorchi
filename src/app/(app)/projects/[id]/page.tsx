import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { CircleDollarSign, Clock, Scale, TrendingUp, Wallet } from 'lucide-react';

import { Disclosure } from '@/components/ui/Disclosure';
import { MetricStrip } from '@/components/ui/MetricStrip';
import { Surface } from '@/components/ui/Surface';
import { ROUTES } from '@/config/routes';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import { ProjectActionBar } from '@/features/projects/components/ProjectActionBar';
import {
	computeDashboardStats,
	getBalanceDescription,
} from '@/features/projects/utils/dashboard-stats';
import { listProjectPayments } from '@/features/projects/queries/project-payment.queries';
import { getMonthlyEntries } from '@/features/timesheet/queries/time-entry.queries';
import { MonthPicker, MonthPickerFallback } from '@/features/timesheet/components/MonthPicker';
import { aggregateMonthly } from '@/features/timesheet/utils/aggregate';
import { resolveJalaliMonthParams } from '@/features/timesheet/utils/month-params';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { createClient } from '@/lib/supabase/server';

interface IProjectDashboardPageProps {
	params: Promise<{ id: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = 'force-dynamic';

export default async function ProjectDashboardPage({
	params,
	searchParams,
}: IProjectDashboardPageProps) {
	const { id } = await params;
	const sp = await resolveJalaliMonthParams(await searchParams);
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		notFound();
	}

	const { data: project } = await supabase
		.from('projects')
		.select('*')
		.eq('id', id)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		notFound();
	}

	const [{ data: invoices }, { data: timeEntries }, payments] = await Promise.all([
		supabase
			.from('invoices')
			.select('status, total, percentage, issue_date')
			.eq('project_id', project.id),
		project.type === 'hourly'
			? supabase
					.from('time_entries')
					.select('hours, rate_at_entry')
					.eq('project_id', project.id)
			: Promise.resolve({ data: [] as { hours: number; rate_at_entry: number }[] }),
		listProjectPayments(project.id),
	]);

	const stats = computeDashboardStats(
		project,
		invoices ?? [],
		timeEntries ?? [],
		payments,
	);
	const currencySymbol = getCurrencySymbol(project.currency);

	const monthlyEntries =
		project.type === 'hourly' ? await getMonthlyEntries(project.id, sp.year, sp.month) : [];
	const monthlyTotals = aggregateMonthly(monthlyEntries);

	return (
		<div className='space-y-6 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1rem)] md:pb-2'>
			<Surface title='تراز پروژه' description={getBalanceDescription(stats.balance)}>
				<p
					className={`text-3xl font-black tabular-nums ${
						stats.balance <= 0 ? 'text-success' : 'text-foreground'
					}`}
					dir='ltr'
				>
					{formatMoney(stats.balance)} {currencySymbol}
				</p>
			</Surface>

			<MetricStrip
				items={[
					{
						label: 'پرداخت‌شده',
						value: `${formatMoney(stats.paid)} ${currencySymbol}`,
						icon: Wallet,
						tone: 'success',
					},
					{
						label: 'در انتظار',
						value: `${formatMoney(stats.pending)} ${currencySymbol}`,
						icon: TrendingUp,
						tone: 'warning',
					},
					{
						label: 'باقی‌مانده',
						value: `${formatMoney(stats.remaining)} ${currencySymbol}`,
						icon: Scale,
						tone: 'default',
					},
				]}
			/>

			<Disclosure title='جزئیات مالی' description='قرارداد، پیش‌پرداخت و تراز'>
				<div className='grid gap-3 sm:grid-cols-2'>
					<div className='rounded-lg bg-muted/50 px-3 py-3'>
						<p className='text-xs text-muted-foreground'>کل قرارداد</p>
						<p className='mt-1 text-lg font-black tabular-nums' dir='ltr'>
							{formatMoney(stats.totalContract)} {currencySymbol}
						</p>
					</div>
					<div className='rounded-lg bg-muted/50 px-3 py-3'>
						<p className='text-xs text-muted-foreground'>پیش‌پرداخت</p>
						<p className='mt-1 text-lg font-black tabular-nums' dir='ltr'>
							{formatMoney(stats.prepaid)} {currencySymbol}
						</p>
					</div>
				</div>
			</Disclosure>

			{project.type === 'hourly' && (
				<Surface title='خلاصه ماه جاری'>
					<Suspense fallback={<MonthPickerFallback />}>
						<MonthPicker />
					</Suspense>
					<div key={`${sp.year}-${sp.month}`} className='mt-4 grid grid-cols-2 gap-3'>
						<div className='rounded-lg bg-muted/50 px-3 py-3'>
							<div className='flex items-center gap-2 text-xs text-muted-foreground'>
								<Clock size={14} />
								ساعات
							</div>
							<p className='mt-1 text-xl font-black tabular-nums' dir='ltr'>
								{formatHoursAsDurationFa(monthlyTotals.totalHours)}
							</p>
						</div>
						<div className='rounded-lg bg-muted/50 px-3 py-3'>
							<div className='flex items-center gap-2 text-xs text-muted-foreground'>
								<CircleDollarSign size={14} />
								مبلغ
							</div>
							<p className='mt-1 text-xl font-black tabular-nums' dir='ltr'>
								{formatMoney(monthlyTotals.totalAmount)} {currencySymbol}
							</p>
						</div>
					</div>
					<div className='mt-4'>
						<Link
							href={ROUTES.projectTimesheet(project.id)}
							className='text-sm font-bold text-primary hover:underline'
						>
							مشاهده جزئیات کار و تایم‌شیت
						</Link>
					</div>
				</Surface>
			)}

			<ProjectActionBar
				projectId={project.id}
				projectType={project.type}
				context='overview'
			/>
		</div>
	);
}
