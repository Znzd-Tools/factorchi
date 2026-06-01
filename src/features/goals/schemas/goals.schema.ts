import { z } from 'zod';

export const monthlyGoalsSchema = z.object({
	hoursGoal: z
		.string()
		.optional()
		.transform((value) => {
			if (!value?.trim()) {
				return null;
			}

			const parsed = Number(value.replace(/,/g, ''));

			return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
		}),
	paidGoal: z
		.string()
		.optional()
		.transform((value) => {
			if (!value?.trim()) {
				return null;
			}

			const parsed = Number(value.replace(/,/g, ''));

			return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : null;
		}),
});

export type MonthlyGoalsInput = z.infer<typeof monthlyGoalsSchema>;
