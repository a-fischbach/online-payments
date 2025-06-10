import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentProcessorCalculator, StripeConfig } from "@/lib/payment-calculator";
import { DEFAULT_PAYMENT_SETTINGS } from "@/lib/settings";
import { formatCurrency, formatTurnover } from "@/utils/formatters";

interface CostSummaryCardProps {
	numberOfSales: number;
	blendedAverageAmount: number;
	europeanPercentage: number;
	usPercentage: number;
	subscriptionPercentage: number;
	averageSubscriptionAmount: number;
	calculator: PaymentProcessorCalculator;
	config: StripeConfig;
}

export default function CostSummaryCard({
	numberOfSales,
	blendedAverageAmount,
	europeanPercentage,
	usPercentage,
	subscriptionPercentage,
	averageSubscriptionAmount,
	calculator,
	config,
}: CostSummaryCardProps) {
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

	const stripeMonthlyCost = stripeCosts.totalMonthlyCost;
	const morMonthlyCost = morCosts.totalMonthlyCost * usdToGbpRate;

	const isStripeWinner = stripeMonthlyCost < morMonthlyCost;
	const savings = Math.abs(stripeMonthlyCost - morMonthlyCost);
	const savingsPercentage = (savings / Math.max(stripeMonthlyCost, morMonthlyCost)) * 100;

	return (
		<Card className="shadow-lg border-0 bg-gradient-to-r from-blue-50 via-white to-green-50">
			<CardHeader className="pb-4 text-center">
				<CardTitle className="text-2xl font-bold text-gray-900">Cost Comparison Summary</CardTitle>
				<CardDescription className="text-gray-600 text-base">
					At {formatTurnover(turnover)} monthly turnover ({numberOfSales.toLocaleString()} sales)
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="text-center space-y-6">
					{/* Winner Badge */}
					<div
						className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${
							isStripeWinner
								? "bg-blue-100 text-blue-800 border-2 border-blue-300"
								: "bg-green-100 text-green-800 border-2 border-green-300"
						}`}
					>
						<div
							className={`w-3 h-3 rounded-full mr-3 ${isStripeWinner ? "bg-blue-500" : "bg-green-500"}`}
						></div>
						{isStripeWinner ? "Stripe is Better" : "Merchant of Record is Better"}
					</div>

					{/* Savings Amount */}
					<div className="space-y-2">
						<div className="text-3xl font-bold text-gray-900">Save {formatCurrency(savings)}</div>
						<div className="text-lg text-gray-600">per month ({savingsPercentage.toFixed(1)}% savings)</div>
						<div className="text-base text-gray-500">Annual savings: {formatCurrency(savings * 12)}</div>
					</div>

					{/* Cost Comparison */}
					<div className="grid grid-cols-2 gap-4 mt-6">
						<div
							className={`p-4 rounded-lg border-2 ${
								isStripeWinner ? "bg-blue-50 border-blue-300" : "bg-gray-50 border-gray-200"
							}`}
						>
							<div className="text-sm font-medium text-gray-600">Stripe</div>
							<div className={`text-xl font-bold ${isStripeWinner ? "text-blue-800" : "text-gray-800"}`}>
								{formatCurrency(stripeMonthlyCost)}
							</div>
							<div className="text-xs text-gray-500">per month</div>
						</div>
						<div
							className={`p-4 rounded-lg border-2 ${
								!isStripeWinner ? "bg-green-50 border-green-300" : "bg-gray-50 border-gray-200"
							}`}
						>
							<div className="text-sm font-medium text-gray-600">Merchant of Record</div>
							<div
								className={`text-xl font-bold ${!isStripeWinner ? "text-green-800" : "text-gray-800"}`}
							>
								{formatCurrency(morMonthlyCost)}
							</div>
							<div className="text-xs text-gray-500">per month</div>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
