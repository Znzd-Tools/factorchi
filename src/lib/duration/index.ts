import { normalizeAsciiDigits, toPersianDigits } from '@/lib/locale/persian-digits';

export function normalizeDurationDigits(value: string): string {
	return normalizeAsciiDigits(value).replace(/[^\d:]/g, '');
}

/** Formats raw digits while typing into HH:MM shape. */
export function formatDurationTyping(value: string): string {
	const normalized = normalizeDurationDigits(value).replace(/:/g, '');
	const digits = normalized.slice(0, 4);

	if (digits.length <= 2) {
		return digits;
	}

	return `${digits.slice(0, -2)}:${digits.slice(-2)}`;
}

export function parseDurationToHours(value: string): number | null {
	const normalized = normalizeDurationDigits(value.trim());

	if (!normalized) {
		return null;
	}

	if (normalized.includes(':')) {
		const [hoursPart, minutesPart = ''] = normalized.split(':');

		if (!hoursPart || minutesPart.length === 0) {
			return null;
		}

		const hours = Number(hoursPart);
		const minutes = Number(minutesPart);

		if (Number.isNaN(hours) || Number.isNaN(minutes) || minutes >= 60 || hours < 0) {
			return null;
		}

		return hours + minutes / 60;
	}

	const asNumber = Number(normalized);

	return Number.isNaN(asNumber) ? null : asNumber;
}

export function formatHoursAsDuration(hours: number): string {
	const totalMinutes = Math.round(Number(hours) * 60);
	const safeMinutes = Math.max(0, totalMinutes);
	const h = Math.floor(safeMinutes / 60);
	const m = safeMinutes % 60;

	return `${h}:${String(m).padStart(2, '0')}`;
}

export function formatHoursAsDurationFa(hours: number): string {
	return toPersianDigits(formatHoursAsDuration(hours));
}

export function isValidDuration(value: string, maxHours = 24): boolean {
	const hours = parseDurationToHours(value);

	return hours !== null && hours > 0 && hours <= maxHours;
}
