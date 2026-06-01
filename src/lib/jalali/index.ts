import { format, parseISO } from 'date-fns';
import { toPersianDigits } from '@/lib/locale/persian-digits';
import {
	endOfMonth,
	format as formatJalali,
	getMonth as getJalaliMonth,
	getYear as getJalaliYear,
	newDate as newJalaliDate,
	startOfMonth,
} from 'date-fns-jalali';

export const formatJalaliDate = (date: Date | string, pattern = 'yyyy/MM/dd'): string => {
	const value = typeof date === 'string' ? parseISO(date) : date;
	return toPersianDigits(formatJalali(value, pattern));
};

export const formatJalaliMonthLabel = (date: Date): string => {
	return toPersianDigits(formatJalali(date, 'MMMM yyyy'));
};

export const getJalaliMonthRange = (year: number, month: number) => {
	const start = newJalaliDate(year, month, 1);
	const end = endOfMonth(start);

	return {
		start,
		end,
		startIso: format(start, 'yyyy-MM-dd'),
		endIso: format(end, 'yyyy-MM-dd'),
	};
};

export const getCurrentJalaliMonth = () => {
	const now = new Date();

	return {
		year: getJalaliYear(now),
		month: getJalaliMonth(now),
		start: startOfMonth(now),
	};
};

export const parseIsoDate = (value: string): Date => parseISO(value);
