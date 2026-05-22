'use client';

import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { IosWheelColumn } from '@/components/atoms/IosWheelColumn';
import { formatJalaliDate } from '@/lib/jalali';
import {
	JALALI_MONTHS,
	buildDayRange,
	buildMonthRange,
	buildYearRange,
	clampJalaliParts,
	getCurrentJalaliParts,
	isoToJalaliParts,
	jalaliPartsToIso,
	type IJalaliDateParts,
} from '@/lib/jalali/picker';
import { cn } from '@/lib/utils/cn';

interface IJalaliDatePickerProps {
	label?: string;
	value: string;
	onChange: (value: string) => void;
	error?: string;
	className?: string;
	placeholder?: string;
}

export function JalaliDatePicker({
	label,
	value,
	onChange,
	error,
	className,
	placeholder = 'انتخاب تاریخ',
}: IJalaliDatePickerProps) {
	const [open, setOpen] = useState(false);
	const [draft, setDraft] = useState<IJalaliDateParts>(getCurrentJalaliParts());

	const currentParts = useMemo(
		() => (value ? isoToJalaliParts(value) : getCurrentJalaliParts()),
		[value],
	);

	const years = useMemo(() => buildYearRange(currentParts.year), [currentParts.year]);
	const months = useMemo(() => buildMonthRange(), []);
	const days = useMemo(
		() => buildDayRange(draft.year, draft.month),
		[draft.year, draft.month],
	);

	const openPicker = () => {
		setDraft(value ? isoToJalaliParts(value) : getCurrentJalaliParts());
		setOpen(true);
	};

	const closePicker = () => setOpen(false);

	const handleConfirm = () => {
		onChange(jalaliPartsToIso(clampJalaliParts(draft)));
		closePicker();
	};

	const updateDraft = (patch: Partial<IJalaliDateParts>) => {
		setDraft((current) => clampJalaliParts({ ...current, ...patch }));
	};

	return (
		<div className={cn('space-y-1', className)}>
			{label && <label className='block text-sm text-muted-foreground'>{label}</label>}

			<button
				type='button'
				onClick={openPicker}
				className={cn(
					'flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-input px-3 py-2.5 text-start transition-colors hover:bg-muted/60',
					error && 'border-red-400',
				)}
			>
				<span className={cn('tabular-nums', value ? 'font-bold text-foreground' : 'text-muted-foreground')}>
					{value ? formatJalaliDate(value) : placeholder}
				</span>
				<CalendarDays size={18} className='shrink-0 text-blue-600 dark:text-blue-400' />
			</button>

			{error && <p className='text-xs text-red-500'>{error}</p>}

			{open && (
				<div className='fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4'>
					<button
						type='button'
						className='absolute inset-0 bg-slate-900/50 backdrop-blur-[1px]'
						onClick={closePicker}
						aria-label='بستن'
					/>
					<div className='relative z-10 w-full max-w-md rounded-t-3xl bg-card p-4 shadow-2xl sm:rounded-3xl sm:p-5'>
						<div className='mx-auto mb-4 h-1 w-10 rounded-full bg-border sm:hidden' />
						<div className='mb-4 text-center'>
							<p className='text-sm font-bold text-muted-foreground'>انتخاب تاریخ</p>
							<p className='mt-1 text-lg font-black tabular-nums text-foreground'>
								{formatJalaliDate(jalaliPartsToIso(draft))}
							</p>
						</div>

						<div className='flex gap-1 sm:gap-2'>
							<IosWheelColumn
								label='روز'
								items={days}
								value={draft.day}
								onChange={(day) => updateDraft({ day })}
							/>
							<IosWheelColumn
								label='ماه'
								items={months}
								value={draft.month}
								onChange={(month) => updateDraft({ month })}
								formatItem={(month) => JALALI_MONTHS[month] ?? String(month)}
							/>
							<IosWheelColumn
								label='سال'
								items={years}
								value={draft.year}
								onChange={(year) => updateDraft({ year })}
								formatItem={(year) => year.toLocaleString('fa-IR')}
							/>
						</div>

						<div className='mt-5 flex gap-2'>
							<Button type='button' variant='ghost' className='flex-1' onClick={closePicker}>
								انصراف
							</Button>
							<Button type='button' className='flex-1' onClick={handleConfirm}>
								تأیید
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
