export const toFa = (num: number | string | null | undefined): string => {
	if (num === null || num === undefined || num === '') {
		return '';
	}

	return Number(num).toLocaleString('fa-IR');
};
