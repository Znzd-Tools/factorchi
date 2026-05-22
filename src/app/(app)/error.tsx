'use client';

import { Button } from '@/components/atoms/Button';
import { ROUTES } from '@/config/routes';

export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	return (
		<div className='rounded-2xl border border-red-200 bg-red-50 p-8 text-center'>
			<h2 className='text-lg font-bold text-red-800'>خطا در بارگذاری</h2>
			<p className='mt-2 text-sm text-red-600'>{error.message}</p>
			<div className='mt-4 flex justify-center gap-3'>
				<Button onClick={reset} variant='secondary'>
					تلاش مجدد
				</Button>
				<Button onClick={() => (window.location.href = ROUTES.projects)} variant='ghost'>
					بازگشت به پروژه‌ها
				</Button>
			</div>
		</div>
	);
}
