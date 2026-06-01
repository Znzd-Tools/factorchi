import { z } from 'zod';

import {
	DEFAULT_POMODORO_MINUTES,
	MAX_POMODORO_MINUTES,
	MIN_POMODORO_MINUTES,
} from '@/features/focus-timer/constants';

const projectTypeSchema = z.enum(['hourly', 'total']);

export const projectFormSchema = z
	.object({
		name: z.string().trim().min(1, 'نام پروژه الزامی است.'),
		client_name: z.string().trim().min(1, 'نام کارفرما الزامی است.'),
		client_contact: z.string().trim().optional(),
		type: projectTypeSchema,
		currency: z.string().min(1, 'ارز الزامی است.'),
		hourly_rate: z.number().positive('نرخ ساعتی باید بزرگ‌تر از صفر باشد.').nullable().optional(),
		total_amount: z.number().positive('مبلغ کل باید بزرگ‌تر از صفر باشد.').nullable().optional(),
		notes: z.string().trim().optional(),
		pomodoro_minutes: z
			.number({ error: 'مدت پومودورو الزامی است.' })
			.int('مدت پومودورو باید عدد صحیح باشد.')
			.min(MIN_POMODORO_MINUTES, `حداقل ${MIN_POMODORO_MINUTES} دقیقه`)
			.max(MAX_POMODORO_MINUTES, `حداکثر ${MAX_POMODORO_MINUTES} دقیقه`),
	})
	.superRefine((data, ctx) => {
		if (data.type === 'hourly') {
			if (data.hourly_rate == null) {
				ctx.addIssue({
					code: 'custom',
					message: 'نرخ ساعتی برای پروژه ساعتی الزامی است.',
					path: ['hourly_rate'],
				});
			}
			return;
		}

		if (data.total_amount == null) {
			ctx.addIssue({
				code: 'custom',
				message: 'مبلغ کل برای پروژه مبلغ ثابت الزامی است.',
				path: ['total_amount'],
			});
		}
	});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

export const projectFormDefaults: ProjectFormValues = {
	name: '',
	client_name: '',
	client_contact: '',
	type: 'hourly',
	currency: 'toman',
	hourly_rate: null,
	total_amount: null,
	notes: '',
	pomodoro_minutes: DEFAULT_POMODORO_MINUTES,
};
