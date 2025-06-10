// Helper functions for non-linear (logarithmic) slider scaling
const minTurnoverLog = Math.log(1000); // £1K
const maxTurnoverLog = Math.log(100000); // £100K

export const turnoverToSliderValue = (turnover: number) => {
	const logValue = Math.log(Math.max(turnover, 1000));
	return ((logValue - minTurnoverLog) / (maxTurnoverLog - minTurnoverLog)) * 100;
};

export const sliderValueToTurnover = (sliderValue: number) => {
	const logValue = minTurnoverLog + (sliderValue / 100) * (maxTurnoverLog - minTurnoverLog);
	return Math.round(Math.exp(logValue) / 1000) * 1000; // Round to nearest £1K
};

// Helper functions for non-linear (logarithmic) number of sales slider scaling
const minSalesLog = Math.log(1); // 1 sale
const maxSalesLog = Math.log(10000); // 10K sales

export const salesToSliderValue = (sales: number) => {
	const logValue = Math.log(Math.max(sales, 1));
	return ((logValue - minSalesLog) / (maxSalesLog - minSalesLog)) * 100;
};

export const sliderValueToSales = (sliderValue: number) => {
	const logValue = minSalesLog + (sliderValue / 100) * (maxSalesLog - minSalesLog);
	const result = Math.exp(logValue);
	// Round to reasonable increments based on scale
	if (result < 10) return Math.round(result);
	if (result < 100) return Math.round(result / 5) * 5;
	if (result < 1000) return Math.round(result / 10) * 10;
	return Math.round(result / 50) * 50;
};
