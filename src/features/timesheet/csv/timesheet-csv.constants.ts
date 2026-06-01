export const TIMESHEET_CSV_HEADERS = ['work_date', 'hours', 'description'] as const;

export type TimesheetCsvHeader = (typeof TIMESHEET_CSV_HEADERS)[number];

/** Maps Persian / English header labels to canonical keys. */
export const TIMESHEET_CSV_HEADER_ALIASES: Record<string, TimesheetCsvHeader> = {
	work_date: 'work_date',
	date: 'work_date',
	تاریخ: 'work_date',
	hours: 'hours',
	hour: 'hours',
	ساعات: 'hours',
	مدت: 'hours',
	description: 'description',
	desc: 'description',
	توضیحات: 'description',
	شرح: 'description',
};

export const TIMESHEET_CSV_MAX_ROWS = 500;

export const TIMESHEET_CSV_TEMPLATE_FILENAME = 'timesheet-template.csv';
