import { z } from 'zod';

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاریخ نامعتبر است.');

export const createTimeEntrySchema = z.object({
	projectId: z.uuid('شناسه پروژه نامعتبر است.'),
	workDate: isoDateSchema,
	hours: z.coerce
		.number({ error: 'ساعات الزامی است.' })
		.positive('ساعات باید بیشتر از صفر باشد.')
		.max(24, 'حداکثر ۲۴ ساعت در روز'),
	description: z
		.string()
		.max(500, 'توضیحات حداکثر ۵۰۰ کاراکتر')
		.optional()
		.nullable()
		.transform((value) => value?.trim() || null),
});

export const updateTimeEntrySchema = createTimeEntrySchema
	.omit({ projectId: true })
	.extend({
		id: z.uuid('شناسه ردیف نامعتبر است.'),
	});

export const deleteTimeEntrySchema = z.object({
	id: z.uuid('شناسه ردیف نامعتبر است.'),
	projectId: z.uuid('شناسه پروژه نامعتبر است.'),
});

export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>;
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>;
export type DeleteTimeEntryInput = z.infer<typeof deleteTimeEntrySchema>;
