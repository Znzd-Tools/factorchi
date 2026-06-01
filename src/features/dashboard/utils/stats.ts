import { toFaNumber } from '@/lib/locale/persian-digits';
import type { Invoice, Project, TimeEntry } from '@/lib/supabase/database.types';

export interface IGlobalDashboardStats {
	projectCount: number;
	activeProjectCount: number;
	totalHours: number;
	monthlyHours: number;
	totalInvoiced: number;
	totalPaid: number;
	totalPending: number;
	paidInvoiceCount: number;
	draftInvoiceCount: number;
	topProjectByHours: { name: string; hours: number } | null;
}

export function computeGlobalDashboardStats({
	projects,
	timeEntries,
	monthlyTimeEntries,
	invoices,
}: {
	projects: Project[];
	timeEntries: Pick<TimeEntry, 'project_id' | 'hours'>[];
	monthlyTimeEntries: Pick<TimeEntry, 'hours'>[];
	invoices: Pick<Invoice, 'status' | 'total'>[];
}): IGlobalDashboardStats {
	const hoursByProject = new Map<string, number>();

	for (const entry of timeEntries) {
		hoursByProject.set(
			entry.project_id,
			(hoursByProject.get(entry.project_id) ?? 0) + Number(entry.hours),
		);
	}

	let topProjectByHours: IGlobalDashboardStats['topProjectByHours'] = null;

	for (const project of projects) {
		const hours = hoursByProject.get(project.id) ?? 0;

		if (!topProjectByHours || hours > topProjectByHours.hours) {
			topProjectByHours = { name: project.name, hours };
		}
	}

	const totalPaid = invoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const totalPending = invoices
		.filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	return {
		projectCount: projects.length,
		activeProjectCount: projects.filter((project) => project.status === 'active').length,
		totalHours: timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0),
		monthlyHours: monthlyTimeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0),
		totalInvoiced: invoices.reduce((sum, invoice) => sum + Number(invoice.total), 0),
		totalPaid,
		totalPending,
		paidInvoiceCount: invoices.filter((invoice) => invoice.status === 'paid').length,
		draftInvoiceCount: invoices.filter((invoice) => invoice.status === 'draft').length,
		topProjectByHours: topProjectByHours && topProjectByHours.hours > 0 ? topProjectByHours : null,
	};
}

export function getDashboardGreeting(): string {
	const hour = new Date().getHours();

	if (hour < 12) {
		return 'صبح بخیر';
	}

	if (hour < 17) {
		return 'ظهر بخیر';
	}

	if (hour < 21) {
		return 'عصر بخیر';
	}

	return 'شب بخیر';
}

export function getFunInsight(stats: IGlobalDashboardStats): string {
	if (stats.projectCount === 0) {
		return 'اولین پروژه‌ات رو بساز و سفر فاکتورسازی رو شروع کن!';
	}

	if (stats.monthlyHours >= 160) {
		return 'این ماه مثل یک فول‌تایمر کار کردی. قهرمانی!';
	}

	if (stats.totalPending > 0) {
		return 'یه مقدار پول هنوز تو راهه — پیگیری فاکتورها رو فراموش نکن.';
	}

	if (stats.paidInvoiceCount > 0 && stats.totalPending === 0) {
		return 'همه چیز تسویه شده. آفرین!';
	}

	if (stats.draftInvoiceCount > 0) {
		return `${toFaNumber(stats.draftInvoiceCount)} فاکتور پیش‌نویس داری — وقت ارسالشه.`;
	}

	return 'ادامه بده؛ هر ساعت ثبت‌شده، فاکتور بعدی رو دقیق‌تر می‌کنه.';
}
