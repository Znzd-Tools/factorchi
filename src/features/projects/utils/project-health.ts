import { computeDashboardStats } from '@/features/projects/utils/dashboard-stats';
import { toFaNumber } from '@/lib/locale/persian-digits';
import type { Invoice, Project, TimeEntry } from '@/lib/supabase/database.types';

export type ProjectHealthLevel = 'healthy' | 'warning' | 'critical';

export interface IProjectHealth {
	level: ProjectHealthLevel;
	score: number;
	label: string;
	hint: string;
}

type InvoiceSlice = Pick<Invoice, 'status' | 'total'>;
type TimeEntrySlice = Pick<TimeEntry, 'hours' | 'rate_at_entry' | 'work_date'>;

export function computeProjectHealth(
	project: Pick<Project, 'type' | 'total_amount'>,
	invoices: InvoiceSlice[],
	timeEntries: TimeEntrySlice[],
	monthStartIso: string,
	monthEndIso: string,
): IProjectHealth {
	const stats = computeDashboardStats(project, invoices, timeEntries);
	const overdueCount = invoices.filter((invoice) => invoice.status === 'overdue').length;
	const monthlyHours = timeEntries
		.filter((entry) => entry.work_date >= monthStartIso && entry.work_date <= monthEndIso)
		.reduce((sum, entry) => sum + Number(entry.hours), 0);
	const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);

	const remainingRatio =
		stats.totalContract > 0 ? stats.remaining / stats.totalContract : 0;

	if (overdueCount > 0) {
		return {
			level: 'critical',
			score: 25,
			label: 'فوری',
			hint: `${toFaNumber(overdueCount)} فاکتور سررسید گذشته`,
		};
	}

	if (stats.pending > 0 && remainingRatio > 0.5) {
		return {
			level: 'warning',
			score: 50,
			label: 'توجه',
			hint: 'مبلغ در انتظار و فاکتور عقب‌افتاده',
		};
	}

	if (project.type === 'hourly') {
		if (totalHours === 0) {
			return {
				level: 'warning',
				score: 45,
				label: 'توجه',
				hint: 'هنوز ساعتی ثبت نشده',
			};
		}

		if (monthlyHours === 0) {
			return {
				level: 'warning',
				score: 55,
				label: 'توجه',
				hint: 'این ماه ساعتی ثبت نشده',
			};
		}
	}

	if (remainingRatio > 0.65 && stats.totalContract > 0) {
		return {
			level: 'warning',
			score: 55,
			label: 'توجه',
			hint: 'بخش زیادی هنوز فاکتور نشده',
		};
	}

	if (stats.pending > 0) {
		return {
			level: 'warning',
			score: 70,
			label: 'توجه',
			hint: 'فاکتور در انتظار پرداخت',
		};
	}

	return {
		level: 'healthy',
		score: 90,
		label: 'سالم',
		hint: 'وضعیت خوب — ادامه بده',
	};
}

export function buildProjectHealthMap(
	projects: Pick<Project, 'id' | 'type' | 'total_amount'>[],
	invoices: (InvoiceSlice & { project_id: string })[],
	timeEntries: (TimeEntrySlice & { project_id: string })[],
	monthStartIso: string,
	monthEndIso: string,
): Map<string, IProjectHealth> {
	const invoicesByProject = new Map<string, InvoiceSlice[]>();
	const entriesByProject = new Map<string, TimeEntrySlice[]>();

	for (const invoice of invoices) {
		const list = invoicesByProject.get(invoice.project_id) ?? [];
		list.push(invoice);
		invoicesByProject.set(invoice.project_id, list);
	}

	for (const entry of timeEntries) {
		const list = entriesByProject.get(entry.project_id) ?? [];
		list.push(entry);
		entriesByProject.set(entry.project_id, list);
	}

	const result = new Map<string, IProjectHealth>();

	for (const project of projects) {
		result.set(
			project.id,
			computeProjectHealth(
				project,
				invoicesByProject.get(project.id) ?? [],
				entriesByProject.get(project.id) ?? [],
				monthStartIso,
				monthEndIso,
			),
		);
	}

	return result;
}
