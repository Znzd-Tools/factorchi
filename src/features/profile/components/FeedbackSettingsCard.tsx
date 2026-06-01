'use client';

import type { ReactNode } from 'react';
import { Volume2, Vibrate } from 'lucide-react';

import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { useFeedbackPreferences } from '@/hooks/useFeedbackPreferences';
import { getFeedbackPaletteLabels, triggerFeedback } from '@/lib/feedback/trigger-feedback';
import { type HapticPattern } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

const PREVIEW_PATTERNS: HapticPattern[] = [
	'selection',
	'light',
	'medium',
	'success',
	'warning',
	'error',
	'celebration',
];

function ToggleRow({
	label,
	description,
	checked,
	onChange,
	icon,
}: {
	label: string;
	description: string;
	checked: boolean;
	onChange: (next: boolean) => void;
	icon: ReactNode;
}) {
	return (
		<label className='flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-colors active:bg-muted'>
			<div className='flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
				{icon}
			</div>
			<div className='min-w-0 flex-1'>
				<p className='font-bold text-foreground'>{label}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
			<input
				type='checkbox'
				checked={checked}
				onChange={(event) => onChange(event.target.checked)}
				className='size-5 shrink-0 accent-primary'
				aria-label={label}
			/>
		</label>
	);
}

export function FeedbackSettingsCard() {
	const { hapticsEnabled, soundsEnabled, setHapticsEnabled, setSoundsEnabled } = useFeedbackPreferences();
	const labels = getFeedbackPaletteLabels();

	return (
		<Card title='بازخورد لمسی و صدا' description='حس تعاملی اپ؛ هر دو را می‌توانی خاموش کنی'>
			<div className='space-y-3'>
				<ToggleRow
					label='لرزش (هپتیک)'
					description='روی دکمه‌ها، ناوبری و جشن‌ها'
					checked={hapticsEnabled}
					onChange={setHapticsEnabled}
					icon={<Vibrate size={18} aria-hidden />}
				/>
				<ToggleRow
					label='صداهای رابط'
					description='تیک‌های کوتاه؛ بعد از اولین لمس فعال می‌شود'
					checked={soundsEnabled}
					onChange={setSoundsEnabled}
					icon={<Volume2 size={18} aria-hidden />}
				/>
			</div>

			<div className='mt-5 space-y-2'>
				<p className='text-sm font-bold text-muted-foreground'>پیش‌نمایش پالت</p>
				<div className='flex flex-wrap gap-2'>
					{PREVIEW_PATTERNS.map((pattern) => (
						<Button
							key={pattern}
							type='button'
							variant='secondary'
							size='sm'
							haptic={false}
							className={cn('text-xs')}
							onClick={() => triggerFeedback(pattern)}
						>
							{labels[pattern]}
						</Button>
					))}
				</div>
			</div>
		</Card>
	);
}
