'use client';

import Link from 'next/link';
import type { ComponentProps } from 'react';

import { type HapticPattern, triggerHaptic } from '@/lib/haptics';
import { cn } from '@/lib/utils/cn';

type HapticLinkProps = ComponentProps<typeof Link> & {
	haptic?: HapticPattern;
};

export function HapticLink({ haptic = 'selection', className, onClick, ...props }: HapticLinkProps) {
	return (
		<Link
			{...props}
			className={cn(className)}
			onClick={(event) => {
				triggerHaptic(haptic);
				onClick?.(event);
			}}
		/>
	);
}
