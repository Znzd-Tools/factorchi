'use client';

import { useCallback, useEffect, useRef } from 'react';

import { cn } from '@/lib/utils/cn';

const ITEM_HEIGHT = 44;
const WHEEL_PADDING = 2;

interface IIosWheelColumnProps<T extends string | number> {
	items: T[];
	value: T;
	onChange: (value: T) => void;
	formatItem?: (item: T) => string;
	label?: string;
}

export function IosWheelColumn<T extends string | number>({
	items,
	value,
	onChange,
	formatItem,
	label,
}: IIosWheelColumnProps<T>) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isProgrammaticScroll = useRef(false);

	const valueIndex = items.indexOf(value);

	const scrollToIndex = useCallback((index: number, smooth = true) => {
		const element = scrollRef.current;

		if (!element) {
			return;
		}

		isProgrammaticScroll.current = true;
		element.scrollTo({
			top: index * ITEM_HEIGHT,
			behavior: smooth ? 'smooth' : 'auto',
		});

		window.setTimeout(() => {
			isProgrammaticScroll.current = false;
		}, smooth ? 180 : 0);
	}, []);

	useEffect(() => {
		if (valueIndex >= 0) {
			scrollToIndex(valueIndex, false);
		}
	}, [valueIndex, scrollToIndex]);

	const handleScroll = () => {
		if (isProgrammaticScroll.current) {
			return;
		}

		if (scrollEndTimer.current) {
			clearTimeout(scrollEndTimer.current);
		}

		scrollEndTimer.current = setTimeout(() => {
			const element = scrollRef.current;

			if (!element) {
				return;
			}

			const index = Math.round(element.scrollTop / ITEM_HEIGHT);
			const clamped = Math.max(0, Math.min(items.length - 1, index));
			const nextValue = items[clamped];

			if (nextValue !== undefined && nextValue !== value) {
				onChange(nextValue);
			}

			scrollToIndex(clamped);
		}, 90);
	};

	return (
		<div className='flex min-w-0 flex-1 flex-col items-center'>
			{label && <span className='mb-1 text-xs font-bold text-muted-foreground'>{label}</span>}
			<div className='relative h-[220px] w-full overflow-hidden'>
				<div className='pointer-events-none absolute inset-x-1 top-1/2 z-10 h-11 -translate-y-1/2 rounded-xl border border-border/80 bg-muted/50' />
				<div className='pointer-events-none absolute inset-x-0 top-0 z-[5] h-20 bg-gradient-to-b from-card via-card/80 to-transparent' />
				<div className='pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-20 bg-gradient-to-t from-card via-card/80 to-transparent' />
				<div
					ref={scrollRef}
					onScroll={handleScroll}
					className='h-full overflow-y-auto scroll-smooth snap-y snap-mandatory overscroll-y-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
				>
					{Array.from({ length: WHEEL_PADDING }).map((_, index) => (
						<div key={`top-${index}`} className='h-11 shrink-0 snap-none' aria-hidden />
					))}
					{items.map((item) => (
						<div
							key={String(item)}
							className={cn(
								'flex h-11 shrink-0 snap-center items-center justify-center px-1 text-base tabular-nums transition-all duration-150',
								item === value
									? 'scale-105 font-black text-foreground'
									: 'font-medium text-muted-foreground',
							)}
						>
							{formatItem ? formatItem(item) : String(item)}
						</div>
					))}
					{Array.from({ length: WHEEL_PADDING }).map((_, index) => (
						<div key={`bottom-${index}`} className='h-11 shrink-0 snap-none' aria-hidden />
					))}
				</div>
			</div>
		</div>
	);
}
