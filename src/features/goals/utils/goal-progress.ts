export interface IGoalProgress {
	current: number;
	target: number;
	percent: number;
	complete: boolean;
}

export function computeGoalProgress(current: number, target: number | null | undefined): IGoalProgress | null {
	if (target == null || target <= 0) {
		return null;
	}

	const percent = Math.min(100, Math.round((current / target) * 100));

	return {
		current,
		target,
		percent,
		complete: current >= target,
	};
}
