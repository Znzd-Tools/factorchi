import { computeGlobalDashboardStats } from '@/features/dashboard/utils/stats';
import {
	computeTimeStreak,
	getStreakEncouragement,
} from '@/features/engagement/utils/time-streak';
import { getInvoiceAttributionDate } from '@/features/engagement/utils/monthly-wrapped';
import { INVOICE_STATUS_LABELS } from '@/features/invoice/constants/invoice-status';
import { buildProjectHealthMap } from '@/features/projects/utils/project-health';
import { ROUTES } from '@/config/routes';
import { getCurrentJalaliMonth, getJalaliMonthRange } from '@/lib/jalali';
import { createAdminClient } from '@/lib/supabase/admin';
import type { InvoiceStatus } from '@/lib/supabase/database.types';

const TEHRAN_TIMEZONE = 'Asia/Tehran';
const MAX_DRAFT_INVOICES = 3;
const MAX_OPEN_TODOS = 5;

export interface RoutinaInvoiceSnapshot {
	id: string;
	projectId: string;
	projectName: string;
	clientName: string;
	invoiceNo: string;
	status: Extract<InvoiceStatus, 'draft' | 'sent' | 'overdue'>;
	statusLabel: string;
	total: number;
	issueDate: string;
	deepLink: string;
}

export interface RoutinaProjectAlert {
	projectId: string;
	projectName: string;
	level: 'warning' | 'critical';
	label: string;
	hint: string;
	score: number;
}

export interface RoutinaOpenTodo {
	id: string;
	projectId: string;
	projectName: string;
	title: string;
	deepLink: string;
}

export interface RoutinaWorkNowSummary {
	generatedAt: string;
	timezone: typeof TEHRAN_TIMEZONE;
	summary: {
		pendingTotal: number;
		overdueCount: number;
		draftCount: number;
		sentCount: number;
		monthlyHours: number;
		monthlyIncome: number;
	};
	overdueInvoices: RoutinaInvoiceSnapshot[];
	draftInvoices: RoutinaInvoiceSnapshot[];
	sentInvoices: RoutinaInvoiceSnapshot[];
	projectAlerts: RoutinaProjectAlert[];
	streak: {
		current: number;
		loggedToday: boolean;
		encouragement: string;
	};
	openTodos: RoutinaOpenTodo[];
}

function toInvoiceSnapshot(
	invoice: {
		id: string;
		project_id: string;
		invoice_no: string;
		status: InvoiceStatus;
		total: number;
		issue_date: string;
	},
	projectName: string,
	clientName: string,
): RoutinaInvoiceSnapshot | null {
	if (
		invoice.status !== 'draft' &&
		invoice.status !== 'sent' &&
		invoice.status !== 'overdue'
	) {
		return null;
	}

	return {
		id: invoice.id,
		projectId: invoice.project_id,
		projectName,
		clientName,
		invoiceNo: invoice.invoice_no,
		status: invoice.status,
		statusLabel: INVOICE_STATUS_LABELS[invoice.status],
		total: Number(invoice.total),
		issueDate: invoice.issue_date,
		deepLink: ROUTES.projectInvoice(invoice.project_id, invoice.id),
	};
}

function sortInvoicesByUrgency(
	left: RoutinaInvoiceSnapshot,
	right: RoutinaInvoiceSnapshot,
): number {
	const statusRank: Record<RoutinaInvoiceSnapshot['status'], number> = {
		overdue: 0,
		sent: 1,
		draft: 2,
	};

	const statusDelta = statusRank[left.status] - statusRank[right.status];

	if (statusDelta !== 0) {
		return statusDelta;
	}

	return right.total - left.total;
}

export async function buildRoutinaWorkNowSummary(
	userId: string,
): Promise<RoutinaWorkNowSummary> {
	const supabase = createAdminClient();
	const { year, month } = getCurrentJalaliMonth();
	const monthRange = getJalaliMonthRange(year, month);
	const todayIso = new Intl.DateTimeFormat('en-CA', {
		timeZone: TEHRAN_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(new Date());

	const [
		{ data: projects },
		{ data: timeEntries },
		{ data: invoices },
		{ data: todos },
	] = await Promise.all([
		supabase
			.from('projects')
			.select('*')
			.eq('user_id', userId)
			.eq('status', 'active'),
		supabase
			.from('time_entries')
			.select('project_id, hours, work_date, rate_at_entry')
			.eq('user_id', userId),
		supabase
			.from('invoices')
			.select('id, project_id, invoice_no, status, total, issue_date, period_end')
			.eq('user_id', userId),
		supabase
			.from('project_todos')
			.select('id, project_id, title, created_at')
			.eq('user_id', userId)
			.eq('is_done', false)
			.order('created_at', { ascending: true })
			.limit(MAX_OPEN_TODOS),
	]);

	const projectById = new Map(
		(projects ?? []).map((project) => [project.id, project]),
	);

	const monthlyTimeEntries = (timeEntries ?? []).filter(
		(entry) =>
			entry.work_date >= monthRange.startIso &&
			entry.work_date <= monthRange.endIso,
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

	const invoiceSnapshots = (invoices ?? [])
		.map((invoice) => {
			const project = projectById.get(invoice.project_id);

			if (!project) {
				return null;
			}

			return toInvoiceSnapshot(invoice, project.name, project.client_name);
		})
		.filter((invoice): invoice is RoutinaInvoiceSnapshot => invoice !== null)
		.sort(sortInvoicesByUrgency);

	const overdueInvoices = invoiceSnapshots.filter(
		(invoice) => invoice.status === 'overdue',
	);
	const draftInvoices = invoiceSnapshots
		.filter((invoice) => invoice.status === 'draft')
		.slice(0, MAX_DRAFT_INVOICES);
	const sentInvoices = invoiceSnapshots.filter(
		(invoice) => invoice.status === 'sent',
	);

	const healthMap = buildProjectHealthMap(
		projects ?? [],
		(invoices ?? []).map((invoice) => ({
			project_id: invoice.project_id,
			status: invoice.status,
			total: invoice.total,
		})),
		timeEntries ?? [],
		monthRange.startIso,
		monthRange.endIso,
	);

	const projectAlerts: RoutinaProjectAlert[] = [];

	for (const project of projects ?? []) {
		const health = healthMap.get(project.id);

		if (!health || health.level === 'healthy') {
			continue;
		}

		projectAlerts.push({
			projectId: project.id,
			projectName: project.name,
			level: health.level,
			label: health.label,
			hint: health.hint,
			score: health.score,
		});
	}

	projectAlerts.sort((left, right) => left.score - right.score);

	const workDates = [...new Set((timeEntries ?? []).map((entry) => entry.work_date))];
	const streakStats = computeTimeStreak(workDates, todayIso);

	const openTodos: RoutinaOpenTodo[] = (todos ?? [])
		.map((todo) => {
			const project = projectById.get(todo.project_id);

			if (!project) {
				return null;
			}

			return {
				id: todo.id,
				projectId: todo.project_id,
				projectName: project.name,
				title: todo.title,
				deepLink: ROUTES.projectTodos(todo.project_id),
			};
		})
		.filter((todo): todo is RoutinaOpenTodo => todo !== null);

	return {
		generatedAt: new Date().toISOString(),
		timezone: TEHRAN_TIMEZONE,
		summary: {
			pendingTotal: stats.monthlyPending,
			overdueCount: overdueInvoices.length,
			draftCount: stats.monthlyDraftInvoiceCount,
			sentCount: sentInvoices.length,
			monthlyHours: stats.monthlyHours,
			monthlyIncome: stats.monthlyIncome,
		},
		overdueInvoices,
		draftInvoices,
		sentInvoices,
		projectAlerts,
		streak: {
			current: streakStats.current,
			loggedToday: streakStats.loggedToday,
			encouragement: getStreakEncouragement(streakStats),
		},
		openTodos,
	};
}
