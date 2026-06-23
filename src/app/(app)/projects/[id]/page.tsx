import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import {
	CalendarDays,
	CircleDollarSign,
	Clock,
	HandCoins,
	Scale,
	TrendingUp,
	Wallet,
} from 'lucide-react';

import { Card } from '@/components/atoms/Card';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import { getUserPaymentMethods } from '@/features/invoice/actions/invoice.actions';
import { ProjectPaymentPanel } from '@/features/projects/components/ProjectPaymentPanel';
import { ProjectWhatIfCalculator } from '@/features/projects/components/ProjectWhatIfCalculator';
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

	const [{ data: invoices }, { data: timeEntries }, payments, paymentMethods] = await Promise.all([
		supabase.from('invoices').select('status, total, percentage').eq('project_id', project.id),
		project.type === 'hourly'
			? supabase
					.from('time_entries')
					.select('hours, rate_at_entry')
					.eq('project_id', project.id)
			: Promise.resolve({ data: [] as { hours: number; rate_at_entry: number }[] }),
		listProjectPayments(project.id),
		getUserPaymentMethods(),
	]);

	const stats = computeDashboardStats(
		project,
		invoices ?? [],
		timeEntries ?? [],
		payments,
	);
	const currencySymbol = getCurrencySymbol(project.currency);
	const todayIso = format(new Date(), 'yyyy-MM-dd');

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
			description: 'فاکتورهای پرداخت‌شده',
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
			description: 'هنوز فاکتور نشده',
			value: `${formatMoney(stats.remaining)} ${currencySymbol}`,
			icon: CircleDollarSign,
			className: 'text-foreground',
		},
		{
			title: 'پیش‌پرداخت',
			description:
				stats.prepaidUnapplied > 0
					? `${formatMoney(stats.prepaidUnapplied)} ${currencySymbol} هنوز تسویه نشده`
					: 'کل پیش‌پرداخت دریافت‌شده',
			value: `${formatMoney(stats.prepaid)} ${currencySymbol}`,
			icon: HandCoins,
			className: 'text-sky-600 dark:text-sky-400',
		},
		{
			title: 'تراز پروژه',
			description: getBalanceDescription(stats.balance),
			value: `${formatMoney(stats.balance)} ${currencySymbol}`,
			icon: Scale,
			className:
				stats.balance <= 0
					? 'text-emerald-600 dark:text-emerald-400'
					: 'text-foreground',
		},
	];

	return (
		<div className='space-y-6'>
			<div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6'>
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

			<Card
				title='پرداخت بدون فاکتور'
				description='پیش‌پرداخت از کارفرما — در تراز پروژه لحاظ می‌شود'
			>
				<ProjectPaymentPanel
					projectId={project.id}
					currencySymbol={currencySymbol}
					paymentMethods={paymentMethods}
					initialPayments={payments}
					defaultPaidAt={todayIso}
				/>
			</Card>

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

					{project.hourly_rate != null && (
						<ProjectWhatIfCalculator
							monthlyHours={monthlyTotals.totalHours}
							monthlyAmount={monthlyTotals.totalAmount}
							hourlyRate={Number(project.hourly_rate)}
							currencySymbol={currencySymbol}
						/>
					)}
				</div>
			)}
		</div>
	);
}
