import {
	Clock,
	FileText,
	TrendingUp,
	Wallet,
} from 'lucide-react';

import { MetricStrip } from '@/components/ui/MetricStrip';
import { NeedsAttention } from '@/features/dashboard/components/NeedsAttention';
import { RecentProjects } from '@/features/dashboard/components/RecentProjects';
import { TodayHeader } from '@/features/dashboard/components/TodayHeader';
import { DashboardSideColumn } from '@/features/dashboard/components/DashboardSideColumn';
import { DashboardMonthSnapshot } from '@/features/dashboard/components/DashboardMonthSnapshot';
import {
	buildDashboardAttentionItems,
	filterMonthlyInvoices,
} from '@/features/dashboard/utils/attention-items';
import {
	computeGlobalDashboardStats,
	getDashboardGreeting,
	getFunInsight,
} from '@/features/dashboard/utils/stats';
import {
	computeMonthlyWrapped,
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
			.select('id, project_id, status, total, issue_date, period_end')
			.eq('user_id', user.id),
	]);

	const monthlyTimeEntries = (timeEntries ?? []).filter(
		(entry) => entry.work_date >= monthRange.startIso && entry.work_date <= monthRange.endIso,
	);

	const monthlyInvoices = filterMonthlyInvoices(invoices ?? [], monthRange.startIso, monthRange.endIso);

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
	const insight = monthlyWrapped.hasActivity ? monthlyWrapped.subline : getFunInsight(stats);
	const profile = await supabase
		.from('profiles')
		.select('full_name, monthly_hours_goal, monthly_income_goal')
		.eq('id', user.id)
		.single();
	const displayName = profile.data?.full_name?.trim() || 'همکار';

	const attentionItems = buildDashboardAttentionItems({
		projects: projects ?? [],
		invoices: invoices ?? [],
		timeEntries: timeEntries ?? [],
		monthStartIso: monthRange.startIso,
		monthEndIso: monthRange.endIso,
	});

	const activeHourlyProject = (projects ?? []).find(
		(project) =>
			project.status === 'active' && project.type === 'hourly' && project.hourly_rate != null,
	);

	const metricItems = [
		{
			label: 'ساعات این ماه',
			value: formatHoursAsDurationFa(stats.monthlyHours),
			icon: Clock,
			tone: 'primary' as const,
		},
		{
			label: 'در انتظار',
			value: formatMoney(stats.monthlyPending),
			icon: FileText,
			tone: 'warning' as const,
		},
		{
			label: stats.monthlyPaid > 0 ? 'دریافت‌شده' : 'درآمد این ماه',
			value: formatMoney(stats.monthlyPaid > 0 ? stats.monthlyPaid : stats.monthlyIncome),
			icon: stats.monthlyPaid > 0 ? TrendingUp : Wallet,
			tone: 'success' as const,
		},
	];

	return (
		<div className='space-y-6 pb-2'>
			<TodayHeader
				greeting={greeting}
				displayName={displayName}
				monthLabel={`${formatJalaliMonthLabel(monthRange.start)} — گزارش ماه جاری`}
				insight={insight}
				invoiceCandidateProjectId={activeHourlyProject?.id ?? null}
			/>

			<MetricStrip items={metricItems} />

			<div className='grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start'>
				<div className='space-y-6'>
					<NeedsAttention items={attentionItems} />
					<DashboardMonthSnapshot stats={monthlyWrapped} />
					<RecentProjects projects={projects ?? []} monthRangeStart={monthRange.start} />
				</div>

				<DashboardSideColumn
					monthLabel={formatJalaliMonthLabel(monthRange.start)}
					hoursGoal={profile.data?.monthly_hours_goal ?? null}
					incomeGoal={
						profile.data?.monthly_income_goal != null
							? Number(profile.data.monthly_income_goal)
							: null
					}
					currentHours={stats.monthlyHours}
					currentIncome={stats.monthlyIncome}
					streak={streak}
					wrapped={{
						year: monthlyWrapped.year,
						month: monthlyWrapped.month,
						monthLabel: monthlyWrapped.monthLabel,
						headline: monthlyWrapped.headline,
						totalHours: monthlyWrapped.totalHours,
						incomeTotal: monthlyWrapped.incomeTotal,
						hasActivity: monthlyWrapped.hasActivity,
					}}
				/>
			</div>
		</div>
	);
}
