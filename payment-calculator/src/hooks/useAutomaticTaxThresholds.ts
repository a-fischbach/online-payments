import { useEffect } from "react";
import { StripeConfig } from "@/lib/payment-calculator";

interface AutomaticTaxThresholdsProps {
	europeanPercentage: number;
	usPercentage: number;
	ukPercentage: number;
	numberOfSales: number;
	blendedAverageAmount: number;
	setConfig: React.Dispatch<React.SetStateAction<StripeConfig>>;
}

export function useAutomaticTaxThresholds({
	europeanPercentage,
	usPercentage,
	ukPercentage,
	numberOfSales,
	blendedAverageAmount,
	setConfig,
}: AutomaticTaxThresholdsProps) {
	useEffect(() => {
		const turnover = numberOfSales * blendedAverageAmount;

		// Calculate sales values for each region
		const euSales = turnover * (europeanPercentage / 100);
		const usSales = turnover * (usPercentage / 100);
		const ukSales = turnover * (ukPercentage / 100);

		// Calculate number of sales per region
		const euSalesCount = numberOfSales * (europeanPercentage / 100);
		const usSalesCount = numberOfSales * (usPercentage / 100);
		const ukSalesCount = numberOfSales * (ukPercentage / 100);

		setConfig((prevConfig) => {
			// EU VAT OSS: turns on when EU sales >= 1%
			const euVatOssRequired = europeanPercentage >= 1;

			// UK VAT: turns on when UK sales value crosses £85,000
			const ukVatRequired = ukSales >= 85000;

			// US Sales Tax: turns on when number of US sales > 200
			const usSalesTaxRequired = usSalesCount > 200;

			// Number of nexuses: increases by 1 for every 200 US sales
			const numberOfUsStates = Math.max(1, Math.floor(usSalesCount / 200));

			return {
				...prevConfig,
				euVatOssRequired,
				ukVatRequired,
				usSalesTaxRequired,
				numberOfUsStates,
			};
		});
	}, [europeanPercentage, usPercentage, ukPercentage, numberOfSales, blendedAverageAmount, setConfig]);
}
