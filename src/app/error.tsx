'use client';

import { Button } from '@/components/atoms/Button';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center'>
			<h2 className='text-xl font-bold text-slate-800'>خطایی رخ داد</h2>
			<p className='max-w-md text-sm text-slate-500'>{error.message}</p>
			<Button onClick={reset}>تلاش مجدد</Button>
		</div>
	);
}
