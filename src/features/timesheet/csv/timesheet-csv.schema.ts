import { z } from 'zod';

export const timesheetExportRangeSchema = z
	.object({
		projectId: z.uuid('شناسه پروژه نامعتبر است.'),
		startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ شروع نامعتبر است.'),
		endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ پایان نامعتبر است.'),
	})
	.refine((value) => value.startDate <= value.endDate, {
		message: 'تاریخ شروع باید قبل از پایان باشد.',
	});

export const timesheetImportSchema = z.object({
	projectId: z.uuid('شناسه پروژه نامعتبر است.'),
	csvContent: z.string().min(1, 'فایل CSV خالی است.'),
});
