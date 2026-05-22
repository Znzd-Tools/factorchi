import { unstable_noStore as noStore } from 'next/cache';

import { requireUser } from '@/lib/auth/require-user';
import { getJalaliMonthRange } from '@/lib/jalali';
import { createClient } from '@/lib/supabase/server';
import type { TimeEntry } from '@/lib/supabase/database.types';

export async function getMonthlyEntries(
	projectId: string,
	year: number,
	month: number,
): Promise<TimeEntry[]> {
	noStore();

	const user = await requireUser();
	const supabase = await createClient();
	const { startIso, endIso } = getJalaliMonthRange(year, month);

	const { data: project } = await supabase
		.from('projects')
		.select('id')
		.eq('id', projectId)
		.eq('user_id', user.id)
		.single();

	if (!project) {
		return [];
	}

	const { data, error } = await supabase
		.from('time_entries')
		.select('*')
		.eq('project_id', projectId)
		.eq('user_id', user.id)
		.gte('work_date', startIso)
		.lte('work_date', endIso)
		.order('work_date', { ascending: false });

	if (error) {
		return [];
	}

	return data ?? [];
}
