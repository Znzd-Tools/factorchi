import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
	CalendarDays,
	CircleDollarSign,
	Clock,
	TrendingUp,
	Wallet,
} from 'lucide-react';

import { Card } from '@/components/atoms/Card';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import { computeDashboardStats } from '@/features/projects/utils/dashboard-stats';
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

	const [{ data: invoices }, { data: timeEntries }] = await Promise.all([
		supabase.from('invoices').select('status, total, percentage').eq('project_id', project.id),
		project.type === 'hourly'
			? supabase
					.from('time_entries')
					.select('hours, rate_at_entry')
					.eq('project_id', project.id)
			: Promise.resolve({ data: [] as { hours: number; rate_at_entry: number }[] }),
	]);

	const stats = computeDashboardStats(project, invoices ?? [], timeEntries ?? []);
	const currencySymbol = getCurrencySymbol(project.currency);

	const monthlyEntries =
		project.type === 'hourly' ? await getMonthlyEntries(project.id, sp.year, sp.month) : [];
	const monthlyTotals = aggregateMonthly(monthlyEntries);

	const statCards = [
		{
			title: 'کل قرارداد',
			description: project.type === 'hourly' ? 'ارزش کل ساعات' : 'مبلغ کل پروژه',
			value: `${formatMoney(stats.totalContract)} ${currencySymbol}`,
			icon: CircleDollarSign,
			className: 'text-foreground',
		},
		{
			title: 'پرداخت‌شده',
			value: `${formatMoney(stats.paid)} ${currencySymbol}`,
			icon: Wallet,
			className: 'text-emerald-600 dark:text-emerald-400',
		},
		{
			title: 'در انتظار',
			value: `${formatMoney(stats.pending)} ${currencySymbol}`,
			icon: TrendingUp,
			className: 'text-amber-600 dark:text-amber-400',
		},
		{
			title: 'باقی‌مانده',
			value: `${formatMoney(stats.remaining)} ${currencySymbol}`,
			icon: CircleDollarSign,
			className: 'text-foreground',
		},
	];

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
				{statCards.map((card) => {
					const Icon = card.icon;

					return (
						<Card key={card.title} title={card.title} description={card.description}>
							<div className='flex items-center gap-3'>
								<div className='rounded-xl bg-muted p-2.5'>
									<Icon size={20} className='text-primary' />
								</div>
								<p className={`text-xl font-black tabular-nums sm:text-2xl ${card.className}`}>
									{card.value}
								</p>
							</div>
						</Card>
					);
				})}
			</div>

			{project.type === 'hourly' && (
				<div className='space-y-4'>
					<div className='flex items-center gap-2'>
						<CalendarDays size={20} className='text-primary' aria-hidden />
						<h2 className='text-lg font-bold text-foreground'>گزارش ماهانه</h2>
					</div>
					<Suspense fallback={<MonthPickerFallback />}>
						<MonthPicker />
					</Suspense>
					<div key={`${sp.year}-${sp.month}`} className='grid gap-4 sm:grid-cols-2'>
						<Card title='ساعات این ماه'>
							<div className='flex items-center gap-3'>
								<Clock size={20} className='text-primary' aria-hidden />
								<p className='text-2xl font-black tabular-nums text-foreground' dir='ltr'>
									{formatHoursAsDurationFa(monthlyTotals.totalHours)}
								</p>
							</div>
						</Card>
						<Card title='مبلغ این ماه'>
							<div className='flex items-center gap-3'>
								<CircleDollarSign size={20} className='text-emerald-600' />
								<p className='text-2xl font-black tabular-nums text-foreground'>
									{formatMoney(monthlyTotals.totalAmount)} {currencySymbol}
								</p>
							</div>
						</Card>
					</div>
				</div>
			)}
		</div>
	);
}
