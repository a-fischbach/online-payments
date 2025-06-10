import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StripeConfig } from "@/lib/payment-calculator";

interface TaxComplianceSectionProps {
	config: StripeConfig;
	setConfig: React.Dispatch<React.SetStateAction<StripeConfig>>;
}

export default function TaxComplianceSection({ config, setConfig }: TaxComplianceSectionProps) {
	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
				<div className="w-3 h-3 bg-green-500 rounded-full"></div>
				<h3 className="text-lg font-semibold text-gray-900">Tax & Compliance</h3>
			</div>

			<div className="space-y-4">
				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<Label htmlFor="euVatOssRequired" className="font-medium text-gray-700">
						EU VAT OSS Required
					</Label>
					<Switch
						id="euVatOssRequired"
						checked={config.euVatOssRequired}
						onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, euVatOssRequired: checked }))}
					/>
				</div>

				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<Label htmlFor="ukVatRequired" className="font-medium text-gray-700">
						UK VAT Registration
					</Label>
					<Switch
						id="ukVatRequired"
						checked={config.ukVatRequired}
						onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, ukVatRequired: checked }))}
					/>
				</div>

				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<Label htmlFor="usSalesTaxRequired" className="font-medium text-gray-700">
						US Sales Tax Compliance
					</Label>
					<Switch
						id="usSalesTaxRequired"
						checked={config.usSalesTaxRequired}
						onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, usSalesTaxRequired: checked }))}
					/>
				</div>

				{config.usSalesTaxRequired && (
					<div className="space-y-2 ml-4">
						<Label htmlFor="numberOfUsStates" className="font-medium text-gray-700">
							Number of US States Registered
						</Label>
						<Input
							id="numberOfUsStates"
							type="number"
							min="1"
							max="50"
							value={config.numberOfUsStates}
							onChange={(e) =>
								setConfig((prev) => ({
									...prev,
									numberOfUsStates: Math.max(1, Number(e.target.value)),
								}))
							}
							className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 w-24"
						/>
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
						onCheckedChange={(checked) => setConfig((prev) => ({ ...prev, includeChargebackFee: checked }))}
					/>
				</div>
			</div>
		</div>
	);
}
