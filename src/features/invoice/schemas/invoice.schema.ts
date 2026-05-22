import { z } from 'zod';

export const invoiceGeneratorSchema = z
	.object({
		paymentMethodId: z.string().uuid().nullable().optional(),
		taxRate: z.coerce.number().min(0).max(100),
		showProjectName: z.boolean(),
		showOwnerName: z.boolean(),
		notes: z.string().max(2000).optional(),
		periodStart: z.string().optional(),
		periodEnd: z.string().optional(),
		percentage: z.coerce.number().min(0.01).max(100).optional(),
		altCurrencyEnabled: z.boolean(),
		altCurrency: z.enum(['toman', 'rial', 'usd', 'eur', 'try']).optional(),
		exchangeRate: z.coerce.number().positive().optional(),
		exchangeMethod: z.enum(['divide', 'multiply']).optional(),
	})
	.superRefine((data, ctx) => {
		if (data.altCurrencyEnabled) {
			if (!data.altCurrency) {
				ctx.addIssue({
					code: 'custom',
					message: 'ارز جایگزین را انتخاب کنید.',
					path: ['altCurrency'],
				});
			}
			if (!data.exchangeRate || data.exchangeRate <= 0) {
				ctx.addIssue({
					code: 'custom',
					message: 'نرخ تبدیل باید بزرگ‌تر از صفر باشد.',
					path: ['exchangeRate'],
				});
			}
			if (!data.exchangeMethod) {
				ctx.addIssue({
					code: 'custom',
					message: 'روش تبدیل را انتخاب کنید.',
					path: ['exchangeMethod'],
				});
			}
		}
	});

export const hourlyInvoiceSchema = invoiceGeneratorSchema.superRefine((data, ctx) => {
	if (!data.periodStart) {
		ctx.addIssue({
			code: 'custom',
			message: 'تاریخ شروع بازه الزامی است.',
			path: ['periodStart'],
		});
	}
	if (!data.periodEnd) {
		ctx.addIssue({
			code: 'custom',
			message: 'تاریخ پایان بازه الزامی است.',
			path: ['periodEnd'],
		});
	}
	if (data.periodStart && data.periodEnd && data.periodStart > data.periodEnd) {
		ctx.addIssue({
			code: 'custom',
			message: 'تاریخ پایان باید بعد از تاریخ شروع باشد.',
			path: ['periodEnd'],
		});
	}
});

export const totalInvoiceSchema = invoiceGeneratorSchema.superRefine((data, ctx) => {
	if (data.percentage === undefined || data.percentage <= 0) {
		ctx.addIssue({
			code: 'custom',
			message: 'درصد فاکتور باید بین ۰.۰۱ تا ۱۰۰ باشد.',
			path: ['percentage'],
		});
	}
});

export type InvoiceGeneratorInput = z.infer<typeof invoiceGeneratorSchema>;

export type HourlyInvoiceInput = z.infer<typeof hourlyInvoiceSchema>;
export type TotalInvoiceInput = z.infer<typeof totalInvoiceSchema>;
