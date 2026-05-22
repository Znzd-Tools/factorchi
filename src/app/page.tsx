import { redirect } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { getOptionalUser } from '@/lib/auth/require-user';

export default async function HomePage() {
	const user = await getOptionalUser();

	if (user) {
		redirect(ROUTES.dashboard);
	}

	redirect(ROUTES.login);
}
