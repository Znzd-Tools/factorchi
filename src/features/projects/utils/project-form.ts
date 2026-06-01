import { normalizePomodoroMinutes } from '@/features/focus-timer/constants';
import type { ProjectFormValues } from '@/features/projects/schemas/project.schema';
import type { Project } from '@/lib/supabase/database.types';

export function projectToFormValues(project: Project): ProjectFormValues {
	return {
		name: project.name,
		client_name: project.client_name,
		client_contact: project.client_contact ?? '',
		type: project.type,
		currency: project.currency,
		hourly_rate: project.hourly_rate,
		total_amount: project.total_amount,
		notes: project.notes ?? '',
		pomodoro_minutes: normalizePomodoroMinutes(project.pomodoro_minutes),
	};
}
