import { AppShell } from '@/components/layout/AppShell';
import { CelebrationHost } from '@/features/engagement/components/CelebrationHost';
import { FocusTimerHost } from '@/features/focus-timer/components/FocusTimerHost';
import { requireUser } from '@/lib/auth/require-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	await requireUser();

	return (
		<CelebrationHost>
			<FocusTimerHost>
				<AppShell>{children}</AppShell>
			</FocusTimerHost>
		</CelebrationHost>
	);
}
