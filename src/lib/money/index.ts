import { toPersianDigits } from '@/lib/locale/persian-digits';

/** Store money as integer in smallest currency unit (e.g. rials/toman base). */
export const toMinorUnits = (amount: number): number => Math.round(amount);

export const fromMinorUnits = (amount: number | bigint): number => Number(amount);

export const formatMoney = (amount: number | bigint, locale = 'fa-IR'): string => {
	return toPersianDigits(fromMinorUnits(amount).toLocaleString(locale));
};

export const parseMoneyInput = (value: string): number | null => {
	const normalized = value
		.replace(/[^\d.]/g, '')
		.replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
		.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

	if (!normalized) {
		return null;
	}

	const parsed = parseFloat(normalized);

	return Number.isNaN(parsed) ? null : toMinorUnits(parsed);
};
