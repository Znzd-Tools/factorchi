'use client';

import { Clock } from 'lucide-react';
import { useState } from 'react';

import {
	formatDurationTyping,
	formatHoursAsDuration,
	isValidDuration,
	parseDurationToHours,
} from '@/lib/duration';
import { cn } from '@/lib/utils/cn';

interface IDurationInputProps {
	label?: string;
	value: number | '';
	onChange: (hours: number | '') => void;
	error?: string;
	className?: string;
	placeholder?: string;
	maxHours?: number;
}

function valueToText(value: number | ''): string {
	if (value === '' || value === 0) {
		return '';
	}

	return formatHoursAsDuration(Number(value));
}

export function DurationInput({
	label,
	value,
	onChange,
	error,
	className,
	placeholder = '0:00',
	maxHours = 24,
}: IDurationInputProps) {
	const [draft, setDraft] = useState(() => valueToText(value));
	const [focused, setFocused] = useState(false);
	const [localError, setLocalError] = useState<string>();

	const text = focused ? draft : valueToText(value);

	const handleChange = (next: string) => {
		const formatted = formatDurationTyping(next);
		setDraft(formatted);
		setLocalError(undefined);

		if (!formatted.trim()) {
			onChange('');
			return;
		}

		const parsed = parseDurationToHours(formatted);

		if (parsed !== null && parsed > 0 && parsed <= maxHours) {
			onChange(parsed);
		}
	};

	const handleFocus = () => {
		setDraft(valueToText(value));
		setFocused(true);
	};

	const handleBlur = () => {
		setFocused(false);

		if (!draft.trim()) {
			setLocalError(undefined);
			onChange('');
			return;
		}

		if (!isValidDuration(draft, maxHours)) {
			setLocalError(`فرمت HH:MM — حداکثر ${formatHoursAsDuration(maxHours)}`);
			return;
		}

		const parsed = parseDurationToHours(draft);

		if (parsed !== null) {
			onChange(parsed);
		}

		setLocalError(undefined);
	};

	const displayError = error ?? localError;

	return (
		<div className={cn('space-y-1', className)}>
			{label && <label className='block text-sm text-muted-foreground'>{label}</label>}
			<div className='relative'>
				<input
					type='text'
					inputMode='numeric'
					value={text}
					onChange={(event) => handleChange(event.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					dir='ltr'
					className={cn(
						'w-full rounded-xl border border-border bg-input py-2.5 pe-10 ps-3 text-left font-bold tabular-nums outline-none transition-all focus:ring-2 focus:ring-blue-500',
						displayError && 'border-red-400 focus:ring-red-400',
					)}
				/>
				<Clock
					size={16}
					className='pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground'
				/>
			</div>
			<p className='text-xs text-muted-foreground'>مثال: 2:30 برای دو ساعت و نیم</p>
			{displayError && <p className='text-xs text-red-500'>{displayError}</p>}
		</div>
	);
}
