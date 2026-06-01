import { z } from 'zod';

export const createProjectTodoSchema = z.object({
	projectId: z.uuid('شناسه پروژه نامعتبر است.'),
	title: z
		.string()
		.trim()
		.min(1, 'عنوان کار الزامی است.')
		.max(200, 'عنوان حداکثر ۲۰۰ کاراکتر'),
});

export const projectTodoIdSchema = z.object({
	id: z.uuid('شناسه کار نامعتبر است.'),
	projectId: z.uuid('شناسه پروژه نامعتبر است.'),
});
