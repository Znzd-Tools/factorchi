import { format, parseISO } from 'date-fns';
import {
	endOfMonth,
	getDate,
	getMonth,
	getYear,
	newDate,
} from 'date-fns-jalali';

export const JALALI_MONTHS = [
	'فروردین',
	'اردیبهشت',
	'خرداد',
	'تیر',
	'مرداد',
	'شهریور',
	'مهر',
	'آبان',
	'آذر',
	'دی',
	'بهمن',
	'اسفند',
] as const;

export interface IJalaliDateParts {
	year: number;
	month: number;
	day: number;
}

export function getTodayIso(): string {
	return format(new Date(), 'yyyy-MM-dd');
}

export function isoToJalaliParts(iso: string): IJalaliDateParts {
	const date = parseISO(iso);

	return {
		year: getYear(date),
		month: getMonth(date),
		day: getDate(date),
	};
}

export function getCurrentJalaliParts(): IJalaliDateParts {
	return isoToJalaliParts(getTodayIso());
}

export function getJalaliDaysInMonth(year: number, month: number): number {
	return getDate(endOfMonth(newDate(year, month, 1)));
}

export function jalaliPartsToIso(parts: IJalaliDateParts): string {
	const maxDay = getJalaliDaysInMonth(parts.year, parts.month);
	const day = Math.min(parts.day, maxDay);

	return format(newDate(parts.year, parts.month, day), 'yyyy-MM-dd');
}

export function clampJalaliParts(parts: IJalaliDateParts): IJalaliDateParts {
	const maxDay = getJalaliDaysInMonth(parts.year, parts.month);

	return {
		year: parts.year,
		month: parts.month,
		day: Math.min(Math.max(1, parts.day), maxDay),
	};
}

export function buildYearRange(centerYear: number, span = 12): number[] {
	const start = centerYear - span;
	const end = centerYear + span;

	return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function buildDayRange(year: number, month: number): number[] {
	const count = getJalaliDaysInMonth(year, month);

	return Array.from({ length: count }, (_, index) => index + 1);
}

export function buildMonthRange(): number[] {
	return Array.from({ length: 12 }, (_, index) => index);
}
