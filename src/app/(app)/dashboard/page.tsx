import Link from 'next/link';
import {
	Clock,
	FileText,
	FolderKanban,
	PartyPopper,
	Sparkles,
	Timer,
	TrendingUp,
	Wallet,
} from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { HapticLink } from '@/components/ui/HapticLink';
import { StatTile } from '@/components/ui/StatTile';
import { ROUTES } from '@/config/routes';
import { DashboardMonthSnapshot } from '@/features/dashboard/components/DashboardMonthSnapshot';
import {
	computeGlobalDashboardStats,
	getDashboardGreeting,
	getFunInsight,
} from '@/features/dashboard/utils/stats';
import { StreakCard } from '@/features/engagement/components/StreakCard';
import { MonthlyGoalsCard } from '@/features/goals/components/MonthlyGoalsCard';
import { QuickLogTeaser } from '@/features/timesheet/components/QuickLogTeaser';
import { WrappedTeaser } from '@/features/engagement/components/WrappedTeaser';
import {
	computeMonthlyWrapped,
	getInvoiceAttributionDate,
} from '@/features/engagement/utils/monthly-wrapped';
import { computeTimeStreak } from '@/features/engagement/utils/time-streak';
import {
	formatJalaliMonthLabel,
	getCurrentJalaliMonth,
	getJalaliMonthRange,
} from '@/lib/jalali';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatMoney } from '@/lib/money';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
	const user = await requireUser();
	const supabase = await createClient();
	const { year, month } = getCurrentJalaliMonth();
	const monthRange = getJalaliMonthRange(year, month);

	const [{ data: projects }, { data: timeEntries }, { data: invoices }] = await Promise.all([
		supabase.from('projects').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
		supabase
			.from('time_entries')
			.select('project_id, hours, work_date, rate_at_entry')
			.eq('user_id', user.id),
		supabase
			.from('invoices')
			.select('project_id, status, total, issue_date, period_end')
			.eq('user_id', user.id),
	]);

	const monthlyTimeEntries = (timeEntries ?? []).filter(
		(entry) => entry.work_date >= monthRange.startIso && entry.work_date <= monthRange.endIso,
	);

	const monthlyInvoices = (invoices ?? []).filter(
		(invoice) =>
			invoice.status !== 'canceled' &&
			getInvoiceAttributionDate(invoice) >= monthRange.startIso &&
			getInvoiceAttributionDate(invoice) <= monthRange.endIso,
	);

	const stats = computeGlobalDashboardStats({
		projects: projects ?? [],
		monthlyTimeEntries,
		monthlyInvoices,
	});

	const workDates = [...new Set((timeEntries ?? []).map((entry) => entry.work_date))];
	const streak = computeTimeStreak(workDates);
	const monthlyWrapped = computeMonthlyWrapped(
		year,
		month,
		projects ?? [],
		timeEntries ?? [],
		invoices ?? [],
	);

	const greeting = getDashboardGreeting();
	const insight = monthlyWrapped.hasActivity
		? monthlyWrapped.subline
		: getFunInsight(stats);
	const profile = await supabase
		.from('profiles')
		.select('full_name, monthly_hours_goal, monthly_income_goal')
		.eq('id', user.id)
		.single();
	const displayName = profile.data?.full_name?.trim() || 'همکار';

	const quickStats = [
		{
			label: 'ساعات این ماه',
			value: formatHoursAsDurationFa(stats.monthlyHours),
			icon: Clock,
			tone: 'primary' as const,
		},
		{
			label: 'درآمد این ماه',
			value: formatMoney(stats.monthlyIncome),
			icon: Wallet,
			tone: 'success' as const,
		},
		{
			label: 'دریافت‌شده',
			value: formatMoney(stats.monthlyPaid),
			icon: TrendingUp,
			tone: 'default' as const,
		},
		{
			label: 'در انتظار',
			value: formatMoney(stats.monthlyPending),
			icon: FileText,
			tone: 'warning' as const,
		},
	];

	return (
		<div className='space-y-6 pb-2'>
			<section className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-indigo-600 to-violet-700 p-5 text-primary-foreground shadow-[var(--shadow-elevated)] sm:p-7'>
				<div className='relative z-10 max-w-2xl'>
					<p className='flex items-center gap-2 text-sm opacity-90'>
						<Sparkles size={16} aria-hidden />
						{formatJalaliMonthLabel(monthRange.start)} — گزارش ماه جاری
					</p>
					<h1 className='mt-2 text-2xl font-black sm:text-3xl'>
						{greeting}، {displayName}
					</h1>
					<p className='mt-1 text-lg font-bold opacity-95'>
						{monthlyWrapped.hasActivity ? monthlyWrapped.headline : 'ماه تازه‌ست، بزن بریم!'}
					</p>
					<p className='mt-3 flex items-start gap-2 text-sm leading-relaxed opacity-90'>
						<PartyPopper size={18} className='mt-0.5 shrink-0' aria-hidden />
						{insight}
					</p>
					<div className='mt-5 flex flex-wrap gap-2'>
						<Link href={ROUTES.quickLog}>
							<Button className='bg-accent text-accent-foreground hover:opacity-95' haptic='success'>
								<Timer size={16} />
								ثبت سریع
							</Button>
						</Link>
						<Link href={ROUTES.projectNew}>
							<Button className='bg-card text-primary hover:opacity-95' haptic='medium'>
								<FolderKanban size={16} />
								پروژه جدید
							</Button>
						</Link>
						<Link href={ROUTES.projects}>
							<Button
								variant='secondary'
								className='border-white/25 bg-white/15 text-primary-foreground hover:bg-white/25'
								haptic='light'
							>
								<FileText size={16} />
								پروژه‌ها
							</Button>
						</Link>
					</div>
				</div>
			</section>

			<StreakCard streak={streak} />

			<QuickLogTeaser />

			<DashboardMonthSnapshot stats={monthlyWrapped} />

			<WrappedTeaser
				stats={{
					year: monthlyWrapped.year,
					month: monthlyWrapped.month,
					monthLabel: monthlyWrapped.monthLabel,
					headline: monthlyWrapped.headline,
					totalHours: monthlyWrapped.totalHours,
					incomeTotal: monthlyWrapped.incomeTotal,
					hasActivity: monthlyWrapped.hasActivity,
				}}
			/>

			<MonthlyGoalsCard
				monthLabel={formatJalaliMonthLabel(monthRange.start)}
				hoursGoal={profile.data?.monthly_hours_goal ?? null}
				incomeGoal={
					profile.data?.monthly_income_goal != null
						? Number(profile.data.monthly_income_goal)
						: null
				}
				currentHours={stats.monthlyHours}
				currentIncome={stats.monthlyIncome}
			/>

			<div className='grid grid-cols-2 gap-3 lg:grid-cols-4'>
				{quickStats.map((item) => (
					<StatTile
						key={item.label}
						label={item.label}
						value={item.value}
						icon={item.icon}
						tone={item.tone}
					/>
				))}
			</div>

			{(projects ?? []).length > 0 && (
				<Card title='پروژه‌های اخیر' description={`فعال در ${formatJalaliMonthLabel(monthRange.start)}`}>
					<div className='space-y-2'>
						{(projects ?? []).slice(0, 4).map((project) => (
							<HapticLink
								key={project.id}
								href={ROUTES.project(project.id)}
								haptic='light'
								className='flex items-center gap-3 rounded-xl border border-border bg-muted/40 p-4 transition-colors active:bg-muted'
							>
								<div className='flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary'>
									<FolderKanban size={20} aria-hidden />
								</div>
								<div className='min-w-0 flex-1'>
									<p className='truncate font-bold text-foreground'>{project.name}</p>
									<p className='truncate text-xs text-muted-foreground'>{project.client_name}</p>
								</div>
							</HapticLink>
						))}
					</div>
				</Card>
			)}
		</div>
	);
}
