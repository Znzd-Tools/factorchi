import { format } from 'date-fns';
import { notFound } from 'next/navigation';

import { Disclosure } from '@/components/ui/Disclosure';
import { Surface } from '@/components/ui/Surface';
import { getProjectInvoices, getUserPaymentMethods } from '@/features/invoice/actions/invoice.actions';
import { InvoiceList } from '@/features/invoice/components/InvoiceList';
import { ProjectActionBar } from '@/features/projects/components/ProjectActionBar';
import { ProjectPaymentPanel } from '@/features/projects/components/ProjectPaymentPanel';
import { computePrepaidSettlement } from '@/features/projects/utils/apply-advance-payments';
import { computeDashboardStats } from '@/features/projects/utils/dashboard-stats';
import { listProjectPayments } from '@/features/projects/queries/project-payment.queries';
import { getCurrencySymbol } from '@/features/invoice/constants/currencies';
import { createClient } from '@/lib/supabase/server';

interface IProjectInvoicesPageProps {
	params: Promise<{ id: string }>;
}

export default async function ProjectInvoicesPage({ params }: IProjectInvoicesPageProps) {
	const { id } = await params;
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

	const [invoices, payments, paymentMethods, { data: invoiceStats }] = await Promise.all([
		getProjectInvoices(project.id),
		listProjectPayments(project.id),
		getUserPaymentMethods(),
		supabase
			.from('invoices')
			.select('status, total, issue_date')
			.eq('project_id', project.id),
	]);

	const stats = computeDashboardStats(project, invoiceStats ?? [], [], payments);
	const prepaidSettlement = computePrepaidSettlement(
		payments.map((payment) => ({
			id: payment.id,
			amount: Number(payment.amount),
			paid_at: payment.paid_at,
		})),
		(invoiceStats ?? []).map((invoice) => ({
			status: invoice.status,
			total: Number(invoice.total),
			issue_date: invoice.issue_date,
		})),
	);
	const currencySymbol = getCurrencySymbol(project.currency);
	const todayIso = format(new Date(), 'yyyy-MM-dd');
	const showPrepaidPanel = stats.prepaid > 0 || stats.prepaidUnapplied > 0;

	return (
		<div className='space-y-5 pb-[calc(var(--bottom-nav-height)+var(--safe-bottom)+1rem)] md:pb-2'>
			<Surface>
				<InvoiceList projectId={project.id} invoices={invoices} currency={project.currency} />
			</Surface>

			<Disclosure
				id='prepaid-payments'
				title='پرداخت بدون فاکتور'
				description='پیش‌پرداخت از کارفرما — در تراز پروژه لحاظ می‌شود'
				defaultOpen={showPrepaidPanel || stats.prepaidUnapplied > 0}
			>
				<ProjectPaymentPanel
					projectId={project.id}
					currencySymbol={currencySymbol}
					paymentMethods={paymentMethods}
					initialPayments={payments}
					appliedByPaymentId={Object.fromEntries(prepaidSettlement.appliedByPaymentId)}
					defaultPaidAt={todayIso}
				/>
			</Disclosure>

			<ProjectActionBar projectId={project.id} projectType={project.type} context='billing' />
		</div>
	);
}
