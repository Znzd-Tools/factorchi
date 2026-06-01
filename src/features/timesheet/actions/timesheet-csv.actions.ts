'use server';

import { revalidatePath } from 'next/cache';

import { ROUTES } from '@/config/routes';
import {
	TIMESHEET_CSV_MAX_ROWS,
	TIMESHEET_CSV_TEMPLATE_FILENAME,
} from '@/features/timesheet/csv/timesheet-csv.constants';
import {
	buildTimesheetTemplateCsv,
	parseTimesheetCsv,
	serializeTimesheetCsv,
} from '@/features/timesheet/csv/timesheet-csv.utils';
import {
	timesheetExportRangeSchema,
	timesheetImportSchema,
} from '@/features/timesheet/csv/timesheet-csv.schema';
import { getEntriesInDateRange } from '@/features/timesheet/queries/time-entry.queries';
import { requireUser } from '@/lib/auth/require-user';
import { formatHoursAsDuration } from '@/lib/duration';
import { toFaNumber } from '@/lib/locale/persian-digits';
import { createClient } from '@/lib/supabase/server';

export interface ITimesheetCsvActionResult {
	error?: string;
	success?: string;
	csv?: string;
	filename?: string;
	importedCount?: number;
	skippedCount?: number;
	errors?: string[];
}

async function assertHourlyProject(projectId: string, userId: string) {
	const supabase = await createClient();
	const { data: project, error } = await supabase
		.from('projects')
		.select('id, name, type, hourly_rate, user_id')
		.eq('id', projectId)
		.single();

	if (error || !project || project.user_id !== userId) {
		return null;
	}

	if (project.type !== 'hourly' || project.hourly_rate == null) {
		return null;
	}

	return project;
}

function revalidateTimesheet(projectId: string) {
	revalidatePath(ROUTES.projectTimesheet(projectId));
	revalidatePath(ROUTES.project(projectId));
	revalidatePath(ROUTES.dashboard);
	revalidatePath(ROUTES.quickLog);
}

export async function getTimesheetTemplateCsv(): Promise<ITimesheetCsvActionResult> {
	await requireUser();

	return {
		csv: buildTimesheetTemplateCsv(),
		filename: TIMESHEET_CSV_TEMPLATE_FILENAME,
	};
}

export async function exportTimesheetCsv(input: unknown): Promise<ITimesheetCsvActionResult> {
	const parsed = timesheetExportRangeSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const project = await assertHourlyProject(parsed.data.projectId, user.id);

	if (!project) {
		return { error: 'پروژه ساعتی یافت نشد.' };
	}

	const entries = await getEntriesInDateRange(
		parsed.data.projectId,
		parsed.data.startDate,
		parsed.data.endDate,
	);

	const rows = [
		['work_date', 'hours', 'description'],
		...entries.map((entry) => [
			entry.work_date,
			formatHoursAsDuration(Number(entry.hours)),
			entry.description ?? '',
		]),
	];

	const safeName = project.name.replace(/[^\w\u0600-\u06FF-]+/g, '-').slice(0, 40);

	return {
		csv: serializeTimesheetCsv(rows),
		filename: `timesheet-${safeName}-${parsed.data.startDate}-${parsed.data.endDate}.csv`,
		success:
			entries.length > 0
				? `${toFaNumber(entries.length)} ردیف آماده دانلود است.`
				: 'ردیفی در این بازه نیست؛ فایل فقط با سرستون ساخته شد.',
	};
}

export async function importTimesheetCsv(input: unknown): Promise<ITimesheetCsvActionResult> {
	const parsed = timesheetImportSchema.safeParse(input);

	if (!parsed.success) {
		return { error: parsed.error.issues[0]?.message ?? 'ورودی نامعتبر است.' };
	}

	const user = await requireUser();
	const project = await assertHourlyProject(parsed.data.projectId, user.id);

	if (!project) {
		return { error: 'پروژه ساعتی یافت نشد.' };
	}

	const { rows, errors: parseErrors } = parseTimesheetCsv(parsed.data.csvContent);

	if (parseErrors.length > 0 && rows.length === 0) {
		return { error: parseErrors[0], errors: parseErrors };
	}

	if (rows.length === 0) {
		return { error: 'ردیف معتبری برای بارگذاری یافت نشد.' };
	}

	if (rows.length > TIMESHEET_CSV_MAX_ROWS) {
		return { error: `حداکثر ${toFaNumber(TIMESHEET_CSV_MAX_ROWS)} ردیف در هر بارگذاری مجاز است.` };
	}

	const supabase = await createClient();
	const payload = rows.map((row) => ({
		project_id: parsed.data.projectId,
		user_id: user.id,
		work_date: row.work_date,
		hours: row.hours,
		rate_at_entry: project.hourly_rate!,
		description: row.description,
	}));

	const { error } = await supabase.from('time_entries').insert(payload);

	if (error) {
		return { error: error.message };
	}

	await revalidateTimesheet(parsed.data.projectId);

	const message = `${toFaNumber(rows.length)} ردیف بارگذاری شد.`;

	return {
		success: parseErrors.length > 0 ? `${message} برخی ردیف‌ها رد شدند.` : message,
		importedCount: rows.length,
		skippedCount: parseErrors.length,
		errors: parseErrors.length > 0 ? parseErrors : undefined,
	};
}
