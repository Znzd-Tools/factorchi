import { toFaNumber } from '@/lib/locale/persian-digits';
import type { Invoice, Project, TimeEntry } from '@/lib/supabase/database.types';

export interface IGlobalDashboardStats {
	activeProjectCount: number;
	monthlyHours: number;
	monthlyIncome: number;
	monthlyInvoiced: number;
	monthlyPaid: number;
	monthlyPending: number;
	monthlyPaidInvoiceCount: number;
	monthlyDraftInvoiceCount: number;
	topProjectByHours: { name: string; hours: number } | null;
}

export function computeGlobalDashboardStats({
	projects,
	monthlyTimeEntries,
	monthlyInvoices,
}: {
	projects: Project[];
	monthlyTimeEntries: Pick<TimeEntry, 'project_id' | 'hours' | 'rate_at_entry'>[];
	monthlyInvoices: Pick<Invoice, 'status' | 'total'>[];
}): IGlobalDashboardStats {
	const hoursByProject = new Map<string, number>();

	for (const entry of monthlyTimeEntries) {
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

	const monthlyPaid = monthlyInvoices
		.filter((invoice) => invoice.status === 'paid')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const monthlyPending = monthlyInvoices
		.filter((invoice) => invoice.status === 'sent' || invoice.status === 'overdue')
		.reduce((sum, invoice) => sum + Number(invoice.total), 0);

	const monthlyIncome = monthlyTimeEntries.reduce(
		(sum, entry) => sum + Number(entry.hours) * Number(entry.rate_at_entry),
		0,
	);

	return {
		activeProjectCount: projects.filter((project) => project.status === 'active').length,
		monthlyHours: monthlyTimeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0),
		monthlyIncome,
		monthlyInvoiced: monthlyInvoices.reduce((sum, invoice) => sum + Number(invoice.total), 0),
		monthlyPaid,
		monthlyPending,
		monthlyPaidInvoiceCount: monthlyInvoices.filter((invoice) => invoice.status === 'paid').length,
		monthlyDraftInvoiceCount: monthlyInvoices.filter((invoice) => invoice.status === 'draft').length,
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
	if (stats.activeProjectCount === 0) {
		return 'هنوز پروژه‌ای نداری؟ یکی بساز و ماجرای این ماه رو شروع کن!';
	}

	if (stats.monthlyHours === 0) {
		return 'این ماه هنوز ساعتی ثبت نشده — یه لاگ سریع بزن و ببین چقدر جالب می‌شه.';
	}

	if (stats.monthlyHours >= 160) {
		return 'وای! این ماه مثل فول‌تایمر کار کردی. قهرمانی — حالا یه استراحت هم بکن.';
	}

	if (stats.monthlyIncome > 0 && stats.monthlyPaid === 0) {
		return 'درآمدت داره جمع می‌شه — وقتشه فاکتور بزنی و پول رو بیاری خونه.';
	}

	if (stats.monthlyPending > 0) {
		return 'یه مقدار پول این ماه هنوز تو راهه — یه پیگیری کوچیک شاید کار رو تموم کنه.';
	}

	if (stats.monthlyPaid > 0 && stats.monthlyPending === 0) {
		return 'این ماه تسویه‌ات تمیزه. آفرین!';
	}

	if (stats.monthlyDraftInvoiceCount > 0) {
		return `${toFaNumber(stats.monthlyDraftInvoiceCount)} پیش‌نویس این ماه داری — بفرستش بیرون!`;
	}

	if (stats.topProjectByHours) {
		return `بیشتر انرژیت رفت سمت «${stats.topProjectByHours.name}» — ماهِ تمرکز!`;
	}

	return 'ماه خوبی داری می‌سازی؛ هر ساعت ثبت‌شده یه قدم به جلوئه.';
}
