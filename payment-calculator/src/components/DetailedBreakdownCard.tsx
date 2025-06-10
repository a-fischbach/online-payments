import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentProcessorCalculator, StripeConfig } from "@/lib/payment-calculator";
import { DEFAULT_PAYMENT_SETTINGS } from "@/lib/settings";
import { formatCurrency, formatTurnover } from "@/utils/formatters";

interface DetailedBreakdownCardProps {
	numberOfSales: number;
	blendedAverageAmount: number;
	europeanPercentage: number;
	usPercentage: number;
	subscriptionPercentage: number;
	averageSubscriptionAmount: number;
	averageTransactionAmount: number;
	calculator: PaymentProcessorCalculator;
	config: StripeConfig;
	chartData: Array<{ turnover: number; stripeCost: number; morCost: number }>;
}

export default function DetailedBreakdownCard({
	numberOfSales,
	blendedAverageAmount,
	europeanPercentage,
	usPercentage,
	subscriptionPercentage,
	averageSubscriptionAmount,
	averageTransactionAmount,
	calculator,
	config,
	chartData,
}: DetailedBreakdownCardProps) {
	const turnover = numberOfSales * blendedAverageAmount;

	const data = {
		amount: blendedAverageAmount,
		volume: numberOfSales,
		europeanPercentage,
		usPercentage,
		subscriptionPercentage,
		averageSubscriptionAmount,
	};

	const stripeCosts = calculator.calculateStripeCosts(data, config);
	const morCosts = calculator.calculateMoRCosts(data);
	const usdToGbpRate = DEFAULT_PAYMENT_SETTINGS.assumptions.usdToGbpRate;

	// Find break-even point
	let breakEvenPoint = null;
	for (let i = 0; i < chartData.length - 1; i++) {
		const current = chartData[i];
		const next = chartData[i + 1];

		if (
			(current.stripeCost >= current.morCost && next.stripeCost <= next.morCost) ||
			(current.stripeCost <= current.morCost && next.stripeCost >= next.morCost)
		) {
			breakEvenPoint = current.turnover;
			break;
		}
	}

	return (
		<Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
			<CardHeader className="pb-6">
				<CardTitle className="text-2xl font-semibold text-gray-900">Cost Breakdown Details</CardTitle>
				<CardDescription className="text-gray-600 text-base">
					Detailed analysis at selected turnover points with comprehensive fee breakdown
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="space-y-6">
					<div className="text-center p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg">
						<h4 className="text-2xl font-bold text-gray-900">{numberOfSales.toLocaleString()} Sales</h4>
						<p className="text-gray-600">{formatCurrency(turnover)} Monthly Turnover</p>
					</div>

					{/* Turnover and Profit Summary */}
					<div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
						<div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
							<div className="text-lg font-semibold text-gray-900">Average Sale</div>
							<div className="text-2xl font-bold text-gray-800">
								{formatCurrency(blendedAverageAmount)}
							</div>
							<div className="text-sm text-gray-600">{numberOfSales.toLocaleString()} transactions</div>
							<div className="text-xs text-gray-500">
								{subscriptionPercentage}% subs (£{averageSubscriptionAmount}),{" "}
								{100 - subscriptionPercentage}% one-time (£{averageTransactionAmount})
							</div>
						</div>
						<div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
							<div className="text-lg font-semibold text-blue-900">Stripe Profit</div>
							<div className="text-2xl font-bold text-blue-800">
								{formatCurrency(turnover - stripeCosts.totalMonthlyCost)}
							</div>
							<div className="text-sm text-blue-600">
								{(((turnover - stripeCosts.totalMonthlyCost) / turnover) * 100).toFixed(1)}% margin
							</div>
						</div>
						<div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
							<div className="text-lg font-semibold text-green-900">MoR Profit</div>
							<div className="text-2xl font-bold text-green-800">
								{formatCurrency(turnover - morCosts.totalMonthlyCost * usdToGbpRate)}
							</div>
							<div className="text-sm text-green-600">
								{(((turnover - morCosts.totalMonthlyCost * usdToGbpRate) / turnover) * 100).toFixed(1)}%
								margin
							</div>
						</div>
						<div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
							<div className="text-lg font-semibold text-purple-900">Break-even Point</div>
							<div className="text-2xl font-bold text-purple-800">
								{breakEvenPoint ? formatTurnover(breakEvenPoint) : "No break-even"}
							</div>
							<div className="text-sm text-purple-600">monthly turnover</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div className="space-y-4">
							<div className="flex items-center space-x-2 pb-2 border-b border-blue-200">
								<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
								<h5 className="font-semibold text-blue-900">Stripe Breakdown</h5>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Core Processing Fees:</span>
									<span className="font-medium">
										{formatCurrency(
											stripeCosts.baseProcessingFees +
												stripeCosts.europeanFees +
												stripeCosts.nonEuropeanFees
										)}
									</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• UK Domestic:</span>
									<span className="text-gray-500">
										{formatCurrency(stripeCosts.baseProcessingFees)}
									</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• EU Cards:</span>
									<span className="text-gray-500">{formatCurrency(stripeCosts.europeanFees)}</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• International:</span>
									<span className="text-gray-500">{formatCurrency(stripeCosts.nonEuropeanFees)}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Subscription Surcharge:</span>
									<span className="font-medium">
										{formatCurrency(stripeCosts.subscriptionSurcharge)}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Stripe Tax Cost:</span>
									<span className="font-medium">
										{formatCurrency(stripeCosts.stripeTaxSurcharge)}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Chargeback Protection:</span>
									<span className="font-medium">{formatCurrency(stripeCosts.chargebackFees)}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Dispute Fees:</span>
									<span className="font-medium">{formatCurrency(stripeCosts.additionalFees)}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Payout Fees:</span>
									<span className="font-medium text-blue-600">Included</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Account & Tax Fees:</span>
									<span className="font-medium">
										{formatCurrency(
											(stripeCosts.baseAccountantFee + stripeCosts.stripeNexusFilingFee) / 12 +
												stripeCosts.monthlyTaxComplianceCost
										)}
									</span>
								</div>
								<hr className="my-3 border-blue-200" />
								<div className="flex justify-between py-2 bg-blue-50 px-3 rounded font-semibold text-blue-900">
									<span>Total Monthly:</span>
									<span>{formatCurrency(stripeCosts.totalMonthlyCost)}</span>
								</div>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-center space-x-2 pb-2 border-b border-green-200">
								<div className="w-3 h-3 bg-green-500 rounded-full"></div>
								<h5 className="font-semibold text-green-900">Merchant of Record</h5>
							</div>
							<div className="space-y-2 text-sm">
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Core Processing Fees:</span>
									<span className="font-medium">
										{formatCurrency((morCosts.platformFee + morCosts.europeanFees) * usdToGbpRate)}
									</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• Platform Fee:</span>
									<span className="text-gray-500">
										{formatCurrency(morCosts.platformFee * usdToGbpRate)}
									</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• International:</span>
									<span className="text-gray-500">
										{formatCurrency(morCosts.europeanFees * usdToGbpRate)}
									</span>
								</div>
								<div className="flex justify-between py-1 text-xs pl-4">
									<span className="text-gray-500">• EU/Other:</span>
									<span className="text-gray-500">{formatCurrency(0)}</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Subscription Surcharge:</span>
									<span className="font-medium">
										{formatCurrency(morCosts.subscriptionSurcharge * usdToGbpRate)}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Tax & Compliance:</span>
									<span className="font-medium text-green-600">Included</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Chargeback Protection:</span>
									<span className="font-medium text-green-600">Included</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Dispute Fees:</span>
									<span className="font-medium text-green-600">Included</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Payout Fees:</span>
									<span className="font-medium">
										{formatCurrency(morCosts.payoutFee * usdToGbpRate)}
									</span>
								</div>
								<div className="flex justify-between py-1">
									<span className="text-gray-600">Account Fees:</span>
									<span className="font-medium">
										{formatCurrency((morCosts.baseAccountantFee / 12) * usdToGbpRate)}
									</span>
								</div>
								<hr className="my-3 border-green-200" />
								<div className="flex justify-between py-2 bg-green-50 px-3 rounded font-semibold text-green-900">
									<span>Total Monthly:</span>
									<span>{formatCurrency(morCosts.totalMonthlyCost * usdToGbpRate)}</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
