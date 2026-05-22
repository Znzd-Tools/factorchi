'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	canTransitionInvoiceStatus,
} from '@/features/invoice/constants/invoice-status';
import type {
	CreateInvoicePayload,
	IInvoiceActionState,
	InvoiceDetail,
	InvoiceWithLineItems,
} from '@/features/invoice/interface/invoice-db.types';
import {
	calculateInvoiceTotals,
	generateHourlyLines,
	generateTotalLine,
} from '@/features/invoice/services/invoice-generator';
import type { InvoiceStatus } from '@/lib/supabase/database.types';
import { createClient } from '@/lib/supabase/server';

async function getNextInvoiceNo(projectId: string): Promise<string> {
	const supabase = await createClient();
	const { count, error } = await supabase
		.from('invoices')
		.select('*', { count: 'exact', head: true })
		.eq('project_id', projectId);

	if (error) {
		throw new Error(error.message);
	}

	const next = (count ?? 0) + 1;
	return `INV-${String(next).padStart(3, '0')}`;
}

export async function getProjectInvoices(
	projectId: string,
	status?: InvoiceStatus,
): Promise<InvoiceWithLineItems[]> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return [];
	}

	let query = supabase
		.from('invoices')
		.select('*, line_items:invoice_line_items(*)')
		.eq('project_id', projectId)
		.eq('user_id', user.id)
		.order('created_at', { ascending: false });

	if (status) {
		query = query.eq('status', status);
	}

	const { data, error } = await query;

	if (error) {
		throw new Error(error.message);
	}

	return ((data ?? []) as Array<InvoiceWithLineItems & { line_items?: InvoiceWithLineItems['line_items'] }>).map(
		(row) => ({
			...row,
			line_items: row.line_items ?? [],
		}),
	);
}

export async function getInvoiceDetail(
	projectId: string,
	invoiceId: string,
): Promise<InvoiceDetail | null> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return null;
	}

	const { data, error } = await supabase
		.from('invoices')
		.select(
			`
			*,
			line_items:invoice_line_items(*),
			project:projects(id, name, client_name, client_contact, currency, type),
			payment_method:payment_methods(*)
		`,
		)
		.eq('id', invoiceId)
		.eq('project_id', projectId)
		.eq('user_id', user.id)
		.single();

	if (error || !data) {
		return null;
	}

	return data as unknown as InvoiceDetail;
}

export async function createInvoice(
	payload: CreateInvoicePayload,
): Promise<IInvoiceActionState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { data: project, error: projectError } = await supabase
		.from('projects')
		.select('*')
		.eq('id', payload.projectId)
		.eq('user_id', user.id)
		.single();

	if (projectError || !project) {
		return { error: 'پروژه یافت نشد.' };
	}

	let lines;

	if (project.type === 'hourly') {
		if (!payload.periodStart || !payload.periodEnd) {
			return { error: 'بازه زمانی برای پروژه ساعتی الزامی است.' };
		}

		const { data: entries, error: entriesError } = await supabase
			.from('time_entries')
			.select('hours, rate_at_entry')
			.eq('project_id', project.id)
			.gte('work_date', payload.periodStart)
			.lte('work_date', payload.periodEnd);

		if (entriesError) {
			return { error: entriesError.message };
		}

		if (!entries?.length) {
			return { error: 'در این بازه زمانی ثبت ساعتی وجود ندارد.' };
		}

		lines = generateHourlyLines(entries);
	} else {
		if (!payload.percentage || !project.total_amount) {
			return { error: 'درصد فاکتور برای پروژه مبلغی الزامی است.' };
		}

		lines = [generateTotalLine(Number(project.total_amount), payload.percentage)];
	}

	const altCurrencyConfig =
		payload.altCurrency && payload.exchangeRate && payload.exchangeMethod
			? {
					exchangeRate: Number(payload.exchangeRate),
					exchangeMethod: payload.exchangeMethod,
				}
			: undefined;

	const totals = calculateInvoiceTotals(lines, payload.taxRate, altCurrencyConfig);
	const invoiceNo = await getNextInvoiceNo(project.id);

	const { data: invoice, error: invoiceError } = await supabase
		.from('invoices')
		.insert({
			project_id: project.id,
			user_id: user.id,
			payment_method_id: payload.paymentMethodId ?? null,
			invoice_no: invoiceNo,
			period_start: payload.periodStart ?? null,
			period_end: payload.periodEnd ?? null,
			percentage: payload.percentage ?? null,
			status: 'draft',
			subtotal: totals.subtotal,
			tax_rate: payload.taxRate,
			tax_amount: totals.taxAmount,
			total: totals.total,
			alt_currency: payload.altCurrency ?? null,
			exchange_rate: payload.exchangeRate ?? null,
			exchange_method: payload.exchangeMethod ?? null,
			show_project_name: payload.showProjectName,
			show_owner_name: payload.showOwnerName,
			notes: payload.notes ?? null,
		})
		.select('id')
		.single();

	if (invoiceError || !invoice) {
		return { error: invoiceError?.message ?? 'خطا در ایجاد فاکتور.' };
	}

	const lineRows = lines.map((line) => ({
		invoice_id: invoice.id,
		title: line.title,
		type: line.type,
		hours: line.hours,
		rate: line.rate,
		total: line.total,
	}));

	const { error: linesError } = await supabase.from('invoice_line_items').insert(lineRows);

	if (linesError) {
		await supabase.from('invoices').delete().eq('id', invoice.id);
		return { error: linesError.message };
	}

	revalidatePath(ROUTES.projectInvoices(project.id));
	revalidatePath(ROUTES.project(project.id));

	return {
		success: 'فاکتور با موفقیت ایجاد شد.',
		invoiceId: invoice.id,
	};
}

export async function updateInvoiceStatus(
	projectId: string,
	invoiceId: string,
	nextStatus: InvoiceStatus,
): Promise<IInvoiceActionState> {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return { error: 'لطفاً وارد شوید.' };
	}

	const { data: invoice, error: fetchError } = await supabase
		.from('invoices')
		.select('id, status')
		.eq('id', invoiceId)
		.eq('project_id', projectId)
		.eq('user_id', user.id)
		.single();

	if (fetchError || !invoice) {
		return { error: 'فاکتور یافت نشد.' };
	}

	if (!canTransitionInvoiceStatus(invoice.status, nextStatus)) {
		return { error: 'تغییر وضعیت مجاز نیست.' };
	}

	const { error: updateError } = await supabase
		.from('invoices')
		.update({ status: nextStatus })
		.eq('id', invoiceId);

	if (updateError) {
		return { error: updateError.message };
	}

	revalidatePath(ROUTES.projectInvoices(projectId));
	revalidatePath(ROUTES.projectInvoice(projectId, invoiceId));
	revalidatePath(ROUTES.project(projectId));

	return { success: 'وضعیت فاکتور به‌روزرسانی شد.' };
}

export async function getUserPaymentMethods() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		return [];
	}

	const { data, error } = await supabase
		.from('payment_methods')
		.select('*')
		.eq('user_id', user.id)
		.order('is_default', { ascending: false })
		.order('created_at', { ascending: true });

	if (error) {
		throw new Error(error.message);
	}

	return data ?? [];
}
