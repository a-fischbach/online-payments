import React, { useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StripeConfig } from "@/lib/payment-calculator";

interface TaxComplianceSectionProps {
	config: StripeConfig;
	setConfig: React.Dispatch<React.SetStateAction<StripeConfig>>;
	europeanPercentage?: number;
	usPercentage?: number;
	ukPercentage?: number;
	numberOfSales?: number;
	blendedAverageAmount?: number;
}

const TaxComplianceSection = React.memo(function TaxComplianceSection({
	config,
	setConfig,
	europeanPercentage = 0,
	usPercentage = 0,
	ukPercentage = 0,
	numberOfSales = 0,
	blendedAverageAmount = 0,
}: TaxComplianceSectionProps) {
	// Memoize expensive calculations
	const { turnover, ukSales, usSalesCount } = useMemo(() => {
		const calculatedTurnover = numberOfSales * blendedAverageAmount;
		const calculatedUkSales = calculatedTurnover * (ukPercentage / 100);
		const calculatedUsSalesCount = numberOfSales * (usPercentage / 100);

		return {
			turnover: calculatedTurnover,
			ukSales: calculatedUkSales,
			usSalesCount: calculatedUsSalesCount,
		};
	}, [numberOfSales, blendedAverageAmount, ukPercentage, usPercentage]);

	const handleChargebackFeeChange = useCallback(
		(checked: boolean) => {
			setConfig((prev) => ({ ...prev, includeChargebackFee: checked }));
		},
		[setConfig]
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
				<div className="w-3 h-3 bg-green-500 rounded-full"></div>
				<h3 className="text-lg font-semibold text-gray-900">Tax & Compliance</h3>
				<span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Auto-managed</span>
			</div>

			<div className="space-y-4">
				<div className="p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<Label htmlFor="euVatOssRequired" className="font-medium text-gray-700">
							EU VAT OSS Required
						</Label>
						<Switch id="euVatOssRequired" checked={config.euVatOssRequired} disabled={true} />
					</div>
					<div className="text-xs text-gray-600">
						{config.euVatOssRequired
							? `✓ Active: EU sales are ${europeanPercentage.toFixed(1)}% (≥1% threshold)`
							: `Inactive: EU sales are ${europeanPercentage.toFixed(1)}% (<1% threshold)`}
					</div>
				</div>

				<div className="p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<Label htmlFor="ukVatRequired" className="font-medium text-gray-700">
							UK VAT Registration
						</Label>
						<Switch id="ukVatRequired" checked={config.ukVatRequired} disabled={true} />
					</div>
					<div className="text-xs text-gray-600">
						{config.ukVatRequired
							? `✓ Active: UK sales £${ukSales.toLocaleString()} (≥£85,000 threshold)`
							: `Inactive: UK sales £${ukSales.toLocaleString()} (<£85,000 threshold)`}
					</div>
				</div>

				<div className="p-3 bg-gray-50 rounded-lg">
					<div className="flex items-center justify-between mb-2">
						<Label htmlFor="usSalesTaxRequired" className="font-medium text-gray-700">
							US Sales Tax Compliance
						</Label>
						<Switch id="usSalesTaxRequired" checked={config.usSalesTaxRequired} disabled={true} />
					</div>
					<div className="text-xs text-gray-600">
						{config.usSalesTaxRequired
							? `✓ Active: ${Math.round(usSalesCount)} US sales (>200 threshold)`
							: `Inactive: ${Math.round(usSalesCount)} US sales (≤200 threshold)`}
					</div>
				</div>

				{config.usSalesTaxRequired && (
					<div className="space-y-2 ml-4 p-3 bg-blue-50 rounded-lg">
						<Label htmlFor="numberOfUsStates" className="font-medium text-gray-700">
							Number of US States Registered
						</Label>
						<div className="flex items-center space-x-3">
							<Input
								id="numberOfUsStates"
								type="number"
								min="1"
								max="50"
								value={config.numberOfUsStates}
								disabled={true}
								className="border-gray-300 bg-gray-100 w-24"
							/>
							<div className="text-xs text-gray-600">Auto-calculated: 1 nexus per 200 US sales</div>
						</div>
						<div className="text-xs text-gray-600">
							Monthly: £{(160 * config.numberOfUsStates).toLocaleString()}/month
						</div>
					</div>
				)}

				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<Label htmlFor="includeChargebackFee" className="font-medium text-gray-700">
						Include Chargeback Fees
					</Label>
					<Switch
						id="includeChargebackFee"
						checked={config.includeChargebackFee}
						onCheckedChange={handleChargebackFeeChange}
					/>
				</div>
			</div>
		</div>
	);
});

export default TaxComplianceSection;
