export const formatCurrency = (value: number) => {
	return new Intl.NumberFormat("en-GB", {
		style: "currency",
		currency: "GBP",
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	}).format(value);
};

export const formatTurnover = (value: number) => {
	if (value >= 1000000) {
		return `£${(value / 1000000).toFixed(1)}M`;
	} else if (value >= 1000) {
		return `£${(value / 1000).toFixed(0)}K`;
	}
	return formatCurrency(value);
};
