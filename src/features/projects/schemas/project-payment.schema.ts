import { z } from 'zod';

export const createProjectPaymentSchema = z.object({
	projectId: z.string().uuid('شناسه پروژه نامعتبر است.'),
	amount: z.number().positive('مبلغ باید بزرگ‌تر از صفر باشد.'),
	paidAt: z.string().min(1, 'تاریخ پرداخت الزامی است.'),
	paymentMethodId: z.string().uuid().nullable().optional(),
	notes: z.string().trim().max(500).optional(),
});

export const deleteProjectPaymentSchema = z.object({
	id: z.string().uuid('شناسه پرداخت نامعتبر است.'),
	projectId: z.string().uuid('شناسه پروژه نامعتبر است.'),
});
