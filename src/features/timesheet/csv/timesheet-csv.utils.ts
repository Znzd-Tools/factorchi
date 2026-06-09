import { parseDurationToHours } from '@/lib/duration';
import { normalizeAsciiDigits } from '@/lib/locale/persian-digits';

import {
	TIMESHEET_CSV_HEADER_ALIASES,
	TIMESHEET_CSV_HEADERS,
	type TimesheetCsvHeader,
} from '@/features/timesheet/csv/timesheet-csv.constants';

const UTF8_BOM = '\uFEFF';

export interface ITimesheetCsvRow {
	work_date: string;
	hours: number;
	description: string | null;
}

export function stripCsvBom(content: string): string {
	return content.replace(/^\uFEFF/, '');
}

export function escapeCsvField(value: string): string {
	if (/[",\n\r]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}

	return value;
}

export function serializeTimesheetCsv(rows: string[][]): string {
	const body = rows.map((row) => row.map((cell) => escapeCsvField(cell)).join(',')).join('\n');

	return `${UTF8_BOM}${body}`;
}

export function buildTimesheetTemplateCsv(): string {
	return serializeTimesheetCsv([
		[...TIMESHEET_CSV_HEADERS],
		['2026-06-01', '2:30', 'طراحی رابط کاربری'],
		['2026-06-02', '1.5', ''],
	]);
}

export function parseCsvLine(line: string): string[] {
	const cells: string[] = [];
	let current = '';
	let inQuotes = false;

	for (let index = 0; index < line.length; index += 1) {
		const char = line[index];

		if (inQuotes) {
			if (char === '"') {
				if (line[index + 1] === '"') {
					current += '"';
					index += 1;
				} else {
					inQuotes = false;
				}
			} else {
				current += char;
			}

			continue;
		}

		if (char === '"') {
			inQuotes = true;
			continue;
		}

		if (char === ',') {
			cells.push(current.trim());
			current = '';
			continue;
		}

		current += char;
	}

	cells.push(current.trim());

	return cells;
}

export function parseTimesheetCsv(content: string): {
	rows: ITimesheetCsvRow[];
	errors: string[];
} {
	const errors: string[] = [];
	const lines = stripCsvBom(content)
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0);

	if (lines.length === 0) {
		return { rows: [], errors: ['فایل خالی است.'] };
	}

	const headerCells = parseCsvLine(lines[0]).map((cell) => normalizeHeaderKey(cell));
	const columnIndex: Partial<Record<TimesheetCsvHeader, number>> = {};

	for (const [index, key] of headerCells.entries()) {
		const mapped = TIMESHEET_CSV_HEADER_ALIASES[key];

		if (mapped) {
			columnIndex[mapped] = index;
		}
	}

	const missing = TIMESHEET_CSV_HEADERS.filter((header) => columnIndex[header] === undefined);

	if (missing.length > 0) {
		return {
			rows: [],
			errors: [`ستون‌های الزامی یافت نشد: ${missing.join(', ')}`],
		};
	}

	const rows: ITimesheetCsvRow[] = [];

	for (let lineIndex = 1; lineIndex < lines.length; lineIndex += 1) {
		const cells = parseCsvLine(lines[lineIndex]);
		const rowNumber = lineIndex + 1;

		const workDate = cells[columnIndex.work_date!] ?? '';
		const hoursRaw = cells[columnIndex.hours!] ?? '';
		const descriptionRaw = cells[columnIndex.description!] ?? '';

		if (!workDate && !hoursRaw && !descriptionRaw) {
			continue;
		}

		const normalizedDate = normalizeAsciiDigits(workDate.trim());
		const dateMatch = normalizedDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

		if (!dateMatch) {
			errors.push(`ردیف ${rowNumber}: تاریخ باید به صورت YYYY-MM-DD باشد.`);
			continue;
		}

		const hours = parseDurationToHours(hoursRaw);

		if (hours === null || hours <= 0 || hours > 24) {
			errors.push(`ردیف ${rowNumber}: ساعات نامعتبر (مثال 2:30 یا 1.5).`);
			continue;
		}

		const description = descriptionRaw.trim() || null;

		if (description && description.length > 500) {
			errors.push(`ردیف ${rowNumber}: توضیحات حداکثر ۵۰۰ کاراکتر.`);
			continue;
		}

		rows.push({
			work_date: normalizedDate,
			hours,
			description,
		});
	}

	return { rows, errors };
}

function normalizeHeaderKey(value: string): string {
	return value.trim().toLowerCase().replace(/\s+/g, '_');
}

export function downloadCsvFile(csv: string, filename: string): void {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = filename;
	anchor.click();
	URL.revokeObjectURL(url);
}
