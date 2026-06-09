import { aggregateMonthly } from '@/features/timesheet/utils/aggregate';
import { formatJalaliDate, formatJalaliMonthLabel, getJalaliMonthRange } from '@/lib/jalali';
import { toFaNumber } from '@/lib/locale/persian-digits';
import type { Invoice, TimeEntry } from '@/lib/supabase/database.types';

type ProjectNameSlice = { id: string; name: string };

export interface IMonthlyWrappedStats {
	year: number;
	month: number;
	monthLabel: string;
	hasActivity: boolean;
	totalHours: number;
	timeEntryDays: number;
	topProject: { name: string; hours: number } | null;
	busiestDay: { dateIso: string; dateLabel: string; hours: number } | null;
	invoicesCount: number;
	incomeTotal: number;
	paidTotal: number;
	pendingTotal: number;
	invoicedTotal: number;
	biggestInvoice: { total: number; projectName: string } | null;
	headline: string;
	subline: string;
}

type TimeEntrySlice = Pick<TimeEntry, 'project_id' | 'hours' | 'work_date' | 'rate_at_entry'>;
type InvoiceSlice = Pick<Invoice, 'project_id' | 'status' | 'total' | 'issue_date' | 'period_end'>;

function isInMonth(isoDate: string, startIso: string, endIso: string): boolean {
	return isoDate >= startIso && isoDate <= endIso;
}

/** Month bucket for invoice stats/goals: billing period end, else issue date. */
export function getInvoiceAttributionDate(
	invoice: Pick<Invoice, 'period_end' | 'issue_date'>,
): string {
	return invoice.period_end ?? invoice.issue_date;
}

function buildHeadline(
	hours: number,
	paidTotal: number,
	topProject: IMonthlyWrappedStats['topProject'],
): { headline: string; subline: string } {
	if (hours === 0 && paidTotal === 0) {
		return {
			headline: 'ماهی برای شروع تازه',
			subline: 'هنوز چیزی ثبت نشده — اولین ساعتت می‌تونه همین امروز باشه.',
		};
	}

	if (hours >= 160) {
		return {
			headline: 'ماه فول‌تایمر',
			subline: 'انرژی بالا بود — بدنت هم استراحت بخواد.',
		};
	}

	if (paidTotal > 0 && hours >= 40) {
		return {
			headline: 'هم کار کردی، هم پول اومد',
			subline: 'ترکیب خوبی از ثبت ساعت و دریافت بود.',
		};
	}

	if (paidTotal > 0) {
		return {
			headline: 'جریان درآمدی فعال',
			subline: 'فاکتورها به پول تبدیل شدن — ادامه بده.',
		};
	}

	if (topProject) {
		return {
			headline: `${topProject.name} قهرمان ماه`,
			subline: 'بیشترین ساعت روی یک پروژه متمرکز بود.',
		};
	}

	return {
		headline: 'ماه پرکار',
		subline: 'ساعت‌ها ثبت شد — قدم بعدی: فاکتور و پیگیری.',
	};
}

export function computeMonthlyWrapped(
	year: number,
	month: number,
	projects: ProjectNameSlice[],
	timeEntries: TimeEntrySlice[],
	invoices: InvoiceSlice[],
): IMonthlyWrappedStats {
	const { start, startIso, endIso } = getJalaliMonthRange(year, month);
	const projectNames = new Map(projects.map((project) => [project.id, project.name]));

	const monthlyEntries = timeEntries.filter((entry) => isInMonth(entry.work_date, startIso, endIso));
	const monthlyInvoices = invoices.filter(
		(invoice) =>
			invoice.status !== 'canceled' &&
			isInMonth(getInvoiceAttributionDate(invoice), startIso, endIso),
	);

	const totalHours = monthlyEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);
	const incomeTotal = aggregateMonthly(monthlyEntries).totalAmount;
	const timeEntryDays = new Set(monthlyEntries.map((entry) => entry.work_date)).size;

	const hoursByProject = new Map<string, number>();
	const hoursByDay = new Map<string, number>();

	for (const entry of monthlyEntries) {
		hoursByProject.set(
			entry.project_id,
			(hoursByProject.get(entry.project_id) ?? 0) + Number(entry.hours),
		);
		hoursByDay.set(entry.work_date, (hoursByDay.get(entry.work_date) ?? 0) + Number(entry.hours));
	}

	let topProject: IMonthlyWrappedStats['topProject'] = null;

	for (const [projectId, hours] of hoursByProject) {
		const name = projectNames.get(projectId) ?? 'پروژه';

		if (!topProject || hours > topProject.hours) {
			topProject = { name, hours };
		}
	}

	let busiestDay: IMonthlyWrappedStats['busiestDay'] = null;

	for (const [dateIso, hours] of hoursByDay) {
		if (!busiestDay || hours > busiestDay.hours) {
			busiestDay = {
				dateIso,
				dateLabel: formatJalaliDate(dateIso),
				hours,
			};
		}
	}

	const paidTotal = monthlyInvoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const pendingTotal = monthlyInvoices
		.filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const invoicedTotal = monthlyInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	let biggestInvoice: IMonthlyWrappedStats['biggestInvoice'] = null;

	for (const invoice of monthlyInvoices) {
		const total = Number(invoice.total);
		const projectName = projectNames.get(invoice.project_id) ?? 'پروژه';

		if (!biggestInvoice || total > biggestInvoice.total) {
			biggestInvoice = { total, projectName };
		}
	}

	const { headline, subline } = buildHeadline(totalHours, paidTotal, topProject);

	return {
		year,
		month,
		monthLabel: formatJalaliMonthLabel(start),
		hasActivity: totalHours > 0 || monthlyInvoices.length > 0,
		totalHours,
		timeEntryDays,
		topProject,
		busiestDay,
		invoicesCount: monthlyInvoices.length,
		incomeTotal,
		paidTotal,
		pendingTotal,
		invoicedTotal,
		biggestInvoice,
		headline,
		subline,
	};
}

export function buildWrappedShareText(stats: IMonthlyWrappedStats, formatHours: (h: number) => string, formatMoney: (n: number) => string): string {
	const lines = [
		`خلاصه ${stats.monthLabel} — فاکتورچی`,
		'',
		stats.headline,
		stats.subline,
		'',
		`ساعات: ${formatHours(stats.totalHours)}`,
	];

	if (stats.topProject) {
		lines.push(`پروژه برتر: ${stats.topProject.name} (${formatHours(stats.topProject.hours)})`);
	}

	if (stats.busiestDay) {
		lines.push(`پرکارترین روز: ${stats.busiestDay.dateLabel} — ${formatHours(stats.busiestDay.hours)}`);
	}

	lines.push(`فاکتورها: ${toFaNumber(stats.invoicesCount)}`);
	lines.push(`دریافت‌شده: ${formatMoney(stats.paidTotal)}`);

	if (stats.pendingTotal > 0) {
		lines.push(`در انتظار: ${formatMoney(stats.pendingTotal)}`);
	}

	return lines.join('\n');
}
