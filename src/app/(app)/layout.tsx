import { AppShell } from '@/components/layout/AppShell';
import { CelebrationHost } from '@/features/engagement/components/CelebrationHost';
import { requireUser } from '@/lib/auth/require-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	await requireUser();

	return (
		<CelebrationHost>
			<AppShell>{children}</AppShell>
		</CelebrationHost>
	);
}
