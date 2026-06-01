import { AppShell } from '@/components/layout/AppShell';
import { requireUser } from '@/lib/auth/require-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	await requireUser();

	return <AppShell>{children}</AppShell>;
}
