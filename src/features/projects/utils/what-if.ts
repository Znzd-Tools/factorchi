export interface IWhatIfProjection {
	extraHours: number;
	extraAmount: number;
	projectedMonthlyHours: number;
	projectedMonthlyAmount: number;
}

export function computeWhatIfProjection(
	currentMonthlyHours: number,
	currentMonthlyAmount: number,
	hourlyRate: number,
	extraHours: number,
): IWhatIfProjection {
	const safeExtra = Math.max(0, extraHours);
	const rate = Math.max(0, hourlyRate);
	const extraAmount = Math.round(safeExtra * rate * 100) / 100;

	return {
		extraHours: safeExtra,
		extraAmount,
		projectedMonthlyHours: currentMonthlyHours + safeExtra,
		projectedMonthlyAmount: currentMonthlyAmount + extraAmount,
	};
}
