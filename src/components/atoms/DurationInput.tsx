'use client';

import { Clock } from 'lucide-react';
import { useState } from 'react';

import {
	formatDurationTyping,
	formatHoursAsDuration,
	formatHoursAsDurationFa,
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
	size?: 'default' | 'lg';
}

function valueToText(value: number | ''): string {
	if (value === '' || value === 0) {
		return '';
	}

	return formatHoursAsDurationFa(Number(value));
}

export function DurationInput({
	label,
	value,
	onChange,
	error,
	className,
	placeholder = '۰:۰۰',
	maxHours = 24,
	size = 'default',
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
		<div className={cn('space-y-1.5', className)}>
			{label && (
				<label className='block text-sm font-bold text-muted-foreground'>{label}</label>
			)}
			<div
				dir='ltr'
				className={cn(
					'relative rounded-xl border border-border bg-input transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-ring/30',
					displayError && 'border-destructive focus-within:ring-destructive/30',
				)}
			>
				<Clock
					size={size === 'lg' ? 20 : 16}
					className='pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground'
					aria-hidden
				/>
				<input
					type='text'
					inputMode='numeric'
					value={text}
					onChange={(event) => handleChange(event.target.value)}
					onFocus={handleFocus}
					onBlur={handleBlur}
					placeholder={placeholder}
					className={cn(
						'w-full bg-transparent text-center font-black tabular-nums text-foreground outline-none',
						size === 'lg' ? 'min-h-14 px-12 text-2xl' : 'min-h-12 px-10 text-lg',
					)}
					aria-invalid={Boolean(displayError)}
				/>
			</div>
			<p className='text-start text-xs text-muted-foreground'>
				مثال: <span dir='ltr' className='tabular-nums'>۲:۳۰</span> برای دو ساعت و نیم
			</p>
			{displayError && <p className='text-xs text-destructive'>{displayError}</p>}
		</div>
	);
}
