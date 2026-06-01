const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/** Converts ASCII/Arabic-Indic digits in any string to Persian (۰–۹). */
export function toPersianDigits(value: string | number): string {
	return String(value).replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);
}

export function toFaNumber(value: number | string | null | undefined): string {
	if (value === null || value === undefined || value === '') {
		return '';
	}

	if (typeof value === 'number') {
		return toPersianDigits(value.toLocaleString('fa-IR'));
	}

	return toPersianDigits(value);
}
