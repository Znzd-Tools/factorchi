import { ROUTES } from '@/config/routes';
import { buildProjectHealthMap } from '@/features/projects/utils/project-health';
import { getInvoiceAttributionDate } from '@/features/engagement/utils/monthly-wrapped';
import type { Invoice, Project, TimeEntry } from '@/lib/supabase/database.types';

export type AttentionKind = 'overdue_invoice' | 'pending_invoice' | 'project_health';

export interface IAttentionItem {
	id: string;
	kind: AttentionKind;
	title: string;
	subtitle: string;
	href: string;
	priority: number;
}

interface IBuildAttentionItemsInput {
	projects: Project[];
	invoices: Pick<
		Invoice,
		'project_id' | 'status' | 'total' | 'issue_date' | 'period_end' | 'id'
	>[];
	timeEntries: Pick<TimeEntry, 'project_id' | 'hours' | 'rate_at_entry' | 'work_date'>[];
	monthStartIso: string;
	monthEndIso: string;
}

export function buildDashboardAttentionItems({
	projects,
	invoices,
	timeEntries,
	monthStartIso,
	monthEndIso,
}: IBuildAttentionItemsInput): IAttentionItem[] {
	const activeProjects = projects.filter((project) => project.status === 'active');
	const projectById = new Map(activeProjects.map((project) => [project.id, project]));
	const items: IAttentionItem[] = [];

	for (const invoice of invoices) {
		if (invoice.status !== 'overdue' && invoice.status !== 'sent') {
			continue;
		}

		const project = projectById.get(invoice.project_id);
		if (!project) {
			continue;
		}

		items.push({
			id: `invoice-${invoice.id}`,
			kind: invoice.status === 'overdue' ? 'overdue_invoice' : 'pending_invoice',
			title:
				invoice.status === 'overdue'
					? `فاکتور سررسید گذشته — ${project.name}`
					: `در انتظار پرداخت — ${project.name}`,
			subtitle: project.client_name,
			href: ROUTES.projectInvoice(project.id, invoice.id),
			priority: invoice.status === 'overdue' ? 1 : 2,
		});
	}

	const healthMap = buildProjectHealthMap(
		activeProjects,
		invoices.map((invoice) => ({
			project_id: invoice.project_id,
			status: invoice.status,
			total: invoice.total,
		})),
		timeEntries,
		monthStartIso,
		monthEndIso,
	);

	for (const project of activeProjects) {
		const health = healthMap.get(project.id);
		if (!health || health.level === 'healthy') {
			continue;
		}

		const alreadyListed = items.some(
			(item) => item.kind !== 'project_health' && item.href.includes(project.id),
		);

		if (alreadyListed && health.level === 'warning') {
			continue;
		}

		items.push({
			id: `health-${project.id}`,
			kind: 'project_health',
			title: `${project.name} — ${health.label}`,
			subtitle: health.hint,
			href: ROUTES.project(project.id),
			priority: health.level === 'critical' ? 1 : 3,
		});
	}

	return items
		.sort((a, b) => a.priority - b.priority)
		.slice(0, 8);
}

export function filterMonthlyInvoices<T extends Pick<Invoice, 'status' | 'issue_date' | 'period_end'>>(
	invoices: T[],
	monthStartIso: string,
	monthEndIso: string,
): T[] {
	return invoices.filter(
		(invoice) =>
			invoice.status !== 'canceled' &&
			getInvoiceAttributionDate(invoice) >= monthStartIso &&
			getInvoiceAttributionDate(invoice) <= monthEndIso,
	);
}
