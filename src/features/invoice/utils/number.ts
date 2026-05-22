const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export const cleanNumber = (val: number | string | null | undefined): number | '' => {
	if (!val && val !== 0) {
		return '';
	}

	let str = String(val);

	for (let i = 0; i < 10; i += 1) {
		str = str.replaceAll(PERSIAN_DIGITS[i], String(i)).replaceAll(ARABIC_DIGITS[i], String(i));
	}

	str = str.replace(/[^\d.]/g, '');
	const parsed = parseFloat(str);

	return Number.isNaN(parsed) ? '' : parsed;
};
