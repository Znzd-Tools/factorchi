import { AppNav } from '@/components/layout/AppNav';
import { requireUser } from '@/lib/auth/require-user';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	await requireUser();

	return (
		<div className='min-h-screen bg-background'>
			<AppNav />
			<main className='mx-auto max-w-6xl px-4 py-6 sm:py-8 print:mx-0 print:max-w-none print:px-0 print:py-0'>
				{children}
			</main>
		</div>
	);
}
