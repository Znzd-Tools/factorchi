import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
	return (
		<div className='flex min-h-[100dvh] flex-col bg-background'>
			<div className='pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/15 to-transparent' />
			<main className='relative flex flex-1 flex-col px-4 pb-[calc(1.5rem+var(--safe-bottom))] pt-[calc(2rem+var(--safe-top))]'>
				<div className='mx-auto mb-8 flex w-full max-w-md items-center gap-3'>
					<div className='flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-elevated)]'>
						<span className='text-lg font-black'>ف</span>
					</div>
					<div>
						<p className='text-xl font-black text-foreground'>فاکتورچی</p>
						<p className='text-sm text-muted-foreground'>مدیریت پروژه، زمان و فاکتور</p>
					</div>
				</div>
				<div className='mx-auto w-full max-w-md flex-1'>{children}</div>
			</main>
		</div>
	);
}
