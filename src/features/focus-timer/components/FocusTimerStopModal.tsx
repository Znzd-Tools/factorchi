'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/atoms/Button';
import { DurationInput } from '@/components/atoms/DurationInput';
import { Modal } from '@/components/atoms/Modal';
import { useCelebration } from '@/features/engagement/context/CelebrationContext';
import { useFocusTimer } from '@/features/focus-timer/context/FocusTimerContext';
import { createTimeEntry } from '@/features/timesheet/actions/time-entry.actions';
import { formatHoursAsDurationFa } from '@/lib/duration';
import { formatJalaliDate } from '@/lib/jalali';

export function FocusTimerStopModal() {
	const router = useRouter();
	const { trigger: triggerCelebration } = useCelebration();
	const { stopDraft, dismissStop, discardSession, updateStopHours } = useFocusTimer();
	const [pending, startTransition] = useTransition();

	if (!stopDraft) {
		return null;
	}

	const handleConfirm = () => {
		if (stopDraft.hours <= 0) {
			toast.error('حداقل یک دقیقه برای ثبت لازم است.');
			return;
		}

		startTransition(async () => {
			const result = await createTimeEntry({
				projectId: stopDraft.projectId,
				workDate: stopDraft.workDate,
				hours: stopDraft.hours,
				description: 'جلسه تمرکز',
			});

			if (result.error) {
				toast.error(result.error);
				return;
			}

			toast.success(result.success);

			if (result.celebration) {
				triggerCelebration(result.celebration);
			}

			discardSession();
			router.refresh();
		});
	};

	return (
		<Modal open title='ثبت در تایم‌شیت؟' onClose={dismissStop}>
			<div className='space-y-4'>
				<p className='text-sm leading-relaxed text-muted-foreground'>
					ساعت جلسه تمرکز برای{' '}
					<span className='font-bold text-foreground'>{stopDraft.projectName}</span> را تأیید کن.
				</p>

				<div className='rounded-2xl border border-border bg-muted/50 px-4 py-3'>
					<p className='text-xs font-bold text-muted-foreground'>تاریخ</p>
					<p className='mt-1 font-black text-foreground'>{formatJalaliDate(stopDraft.workDate)}</p>
				</div>

				<DurationInput
					label='مدت قابل ثبت'
					value={stopDraft.hours}
					onChange={(hours) => {
						if (hours !== '') {
							updateStopHours(Number(hours));
						}
					}}
					maxHours={24}
				/>

				<p className='text-center text-sm text-muted-foreground'>
					معادل{' '}
					<span className='font-bold text-foreground' dir='ltr'>
						{formatHoursAsDurationFa(stopDraft.hours)}
					</span>
				</p>

				<div className='flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end'>
					<Button type='button' variant='ghost' disabled={pending} onClick={discardSession}>
						حذف جلسه
					</Button>
					<Button type='button' variant='secondary' disabled={pending} onClick={dismissStop}>
						ادامه بعداً
					</Button>
					<Button type='button' haptic='success' disabled={pending} onClick={handleConfirm}>
						{pending ? 'در حال ثبت…' : 'ثبت در تایم‌شیت'}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
