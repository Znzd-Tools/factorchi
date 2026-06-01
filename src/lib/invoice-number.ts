const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function formatInvoiceNumber(sequence: number): string {
	const padded = String(Math.max(1, sequence)).padStart(3, '0');
	const fa = padded.replace(/\d/g, (digit) => FA_DIGITS[Number(digit)]);

	return `فاک-${fa}`;
}
