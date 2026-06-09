import { MonthlyWrappedView } from '@/features/engagement/components/MonthlyWrappedView';
import { computeMonthlyWrapped } from '@/features/engagement/utils/monthly-wrapped';
import { buildMonthlyWrappedHref } from '@/features/engagement/utils/wrapped-month-href';
import { getAdjacentJalaliMonth, resolveJalaliMonthParams } from '@/features/timesheet/utils/month-params';
import { getCurrentJalaliMonth } from '@/lib/jalali';
import { requireUser } from '@/lib/auth/require-user';
import { createClient } from '@/lib/supabase/server';

interface IMonthlyWrappedPageProps {
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MonthlyWrappedPage({ searchParams }: IMonthlyWrappedPageProps) {
	const user = await requireUser();
	const supabase = await createClient();
	const { year, month } = resolveJalaliMonthParams(await searchParams);
	const current = getCurrentJalaliMonth();

	const [{ data: projects }, { data: timeEntries }, { data: invoices }] = await Promise.all([
		supabase.from('projects').select('id, name').eq('user_id', user.id),
		supabase
			.from('time_entries')
			.select('project_id, hours, work_date, rate_at_entry')
			.eq('user_id', user.id),
		supabase
			.from('invoices')
			.select('project_id, status, total, issue_date, period_end')
			.eq('user_id', user.id),
	]);

	const stats = computeMonthlyWrapped(year, month, projects ?? [], timeEntries ?? [], invoices ?? []);

	const prev = getAdjacentJalaliMonth(year, month, 'prev');
	const next = getAdjacentJalaliMonth(year, month, 'next');
	const canGoNext =
		next.year < current.year ||
		(next.year === current.year && next.month <= current.month);

	return (
		<MonthlyWrappedView
			stats={stats}
			prevHref={buildMonthlyWrappedHref(prev.year, prev.month)}
			nextHref={buildMonthlyWrappedHref(next.year, next.month)}
			canGoNext={canGoNext}
		/>
	);
}
