const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/** Converts Persian/Arabic-Indic digits to ASCII (0–9). */
export function normalizeAsciiDigits(value: string): string {
	let result = value;

	for (let index = 0; index < 10; index += 1) {
		result = result.replaceAll(PERSIAN_DIGITS[index], String(index)).replaceAll(
			ARABIC_DIGITS[index],
			String(index),
		);
	}

	return result;
}

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
