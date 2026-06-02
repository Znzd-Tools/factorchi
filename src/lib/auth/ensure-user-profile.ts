import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/supabase/database.types';

type ProfileRow = Pick<
	Database['public']['Tables']['profiles']['Row'],
	'full_name' | 'default_currency'
>;

export async function ensureUserProfile(
	supabase: SupabaseClient<Database>,
	userId: string,
	defaults?: { fullName?: string },
): Promise<ProfileRow | null> {
	const { data: profile } = await supabase
		.from('profiles')
		.select('full_name, default_currency')
		.eq('id', userId)
		.maybeSingle();

	if (profile) {
		return profile;
	}

	const { data: created, error } = await supabase
		.from('profiles')
		.insert({
			id: userId,
			full_name: defaults?.fullName ?? '',
		})
		.select('full_name, default_currency')
		.single();

	if (error) {
		return null;
	}

	return created;
}
