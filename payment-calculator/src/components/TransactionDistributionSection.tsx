import React, { useMemo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatCurrency, formatTurnover } from "@/utils/formatters";
import {
	turnoverToSliderValue,
	sliderValueToTurnover,
	salesToSliderValue,
	sliderValueToSales,
} from "@/utils/sliderHelpers";

interface TransactionDistributionSectionProps {
	europeanPercentage: number;
	usPercentage: number;
	ukPercentage: number;
	adjustPercentages: (newValue: number, changedField: "eu" | "us" | "uk") => void;
	averageSubscriptionAmount: number;
	setAverageSubscriptionAmount: (value: number) => void;
	averageTransactionAmount: number;
	setAverageTransactionAmount: (value: number) => void;
	blendedAverageAmount: number;
	maxTurnover: number;
	setMaxTurnover: (value: number) => void;
	numberOfSales: number;
	setNumberOfSales: (value: number) => void;
	subscriptionPercentage: number;
	setSubscriptionPercentage: (value: number) => void;
}

const TransactionDistributionSection = React.memo(function TransactionDistributionSection({
	europeanPercentage,
	usPercentage,
	ukPercentage,
	adjustPercentages,
	averageSubscriptionAmount,
	setAverageSubscriptionAmount,
	averageTransactionAmount,
	setAverageTransactionAmount,
	blendedAverageAmount,
	maxTurnover,
	setMaxTurnover,
	numberOfSales,
	setNumberOfSales,
	subscriptionPercentage,
	setSubscriptionPercentage,
}: TransactionDistributionSectionProps) {
	// Memoize expensive calculations
	const memoizedTurnoverSliderValue = useMemo(() => turnoverToSliderValue(maxTurnover), [maxTurnover]);
	const memoizedSalesSliderValue = useMemo(() => salesToSliderValue(numberOfSales), [numberOfSales]);
	const memoizedFormattedTurnover = useMemo(() => formatTurnover(maxTurnover), [maxTurnover]);
	const memoizedFormattedCurrency = useMemo(
		() => formatCurrency(numberOfSales * blendedAverageAmount),
		[numberOfSales, blendedAverageAmount]
	);

	// Memoize callback functions to prevent unnecessary re-renders
	const handleEuPercentageChange = useCallback(
		(value: number[]) => {
			adjustPercentages(value[0], "eu");
		},
		[adjustPercentages]
	);

	const handleUsPercentageChange = useCallback(
		(value: number[]) => {
			adjustPercentages(value[0], "us");
		},
		[adjustPercentages]
	);

	const handleUkPercentageChange = useCallback(
		(value: number[]) => {
			adjustPercentages(value[0], "uk");
		},
		[adjustPercentages]
	);

	const handleMaxTurnoverChange = useCallback(
		(value: number[]) => {
			setMaxTurnover(sliderValueToTurnover(value[0]));
		},
		[setMaxTurnover]
	);

	const handleNumberOfSalesChange = useCallback(
		(value: number[]) => {
			setNumberOfSales(sliderValueToSales(value[0]));
		},
		[setNumberOfSales]
	);

	const handleSubscriptionPercentageChange = useCallback(
		(value: number[]) => {
			setSubscriptionPercentage(value[0]);
		},
		[setSubscriptionPercentage]
	);

	const handleAverageSubscriptionAmountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setAverageSubscriptionAmount(Number(e.target.value));
		},
		[setAverageSubscriptionAmount]
	);

	const handleAverageTransactionAmountChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			setAverageTransactionAmount(Number(e.target.value));
		},
		[setAverageTransactionAmount]
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
				<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
				<h3 className="text-lg font-semibold text-gray-900">Transaction Distribution</h3>
			</div>

			<div className="space-y-5">
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="europeanPercentage" className="font-medium text-gray-700">
							EU Transactions
						</Label>
						<span className="text-sm font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
							{europeanPercentage}%
						</span>
					</div>
					<Slider
						id="europeanPercentage"
						min={0}
						max={100}
						step={1}
						value={[europeanPercentage]}
						onValueChange={handleEuPercentageChange}
						className="w-full"
					/>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="usPercentage" className="font-medium text-gray-700">
							US Transactions
						</Label>
						<span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
							{usPercentage}%
						</span>
					</div>
					<Slider
						id="usPercentage"
						min={0}
						max={100}
						step={1}
						value={[usPercentage]}
						onValueChange={handleUsPercentageChange}
						className="w-full"
					/>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="ukPercentage" className="font-medium text-gray-700">
							UK Transactions
						</Label>
						<span className="text-sm font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">
							{ukPercentage}%
						</span>
					</div>
					<Slider
						id="ukPercentage"
						min={0}
						max={100}
						step={1}
						value={[ukPercentage]}
						onValueChange={handleUkPercentageChange}
						className="w-full"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="averageSubscriptionAmount" className="font-medium text-gray-700">
						Average Subscription Amount (£)
					</Label>
					<Input
						id="averageSubscriptionAmount"
						type="number"
						min="0"
						value={averageSubscriptionAmount}
						onChange={handleAverageSubscriptionAmountChange}
						className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="averageTransactionAmount" className="font-medium text-gray-700">
						Average Non-Subscription Sale (£)
					</Label>
					<Input
						id="averageTransactionAmount"
						type="number"
						min="0"
						value={averageTransactionAmount}
						onChange={handleAverageTransactionAmountChange}
						className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
					/>
					<div className="text-xs text-gray-600">Blended average: £{blendedAverageAmount.toFixed(2)}</div>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="maxTurnover" className="font-medium text-gray-700">
							Chart Max Turnover
						</Label>
						<span className="text-sm font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded">
							{memoizedFormattedTurnover}
						</span>
					</div>
					<Slider
						id="maxTurnover"
						min={0}
						max={100}
						step={1}
						value={[memoizedTurnoverSliderValue]}
						onValueChange={handleMaxTurnoverChange}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-gray-500">
						<span>£1K</span>
						<span>£100K</span>
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="numberOfSales" className="font-medium text-gray-700">
							Number of Sales (Breakdown)
						</Label>
						<span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
							{numberOfSales.toLocaleString()}
						</span>
					</div>
					<Slider
						id="numberOfSales"
						min={0}
						max={100}
						step={1}
						value={[memoizedSalesSliderValue]}
						onValueChange={handleNumberOfSalesChange}
						className="w-full"
					/>
					<div className="flex justify-between text-xs text-gray-500">
						<span>1</span>
						<span>10,000</span>
					</div>
					<div className="text-xs text-gray-600 mt-1">Turnover: {memoizedFormattedCurrency}</div>
				</div>

				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<Label htmlFor="subscriptionPercentage" className="font-medium text-gray-700">
							Subscription Transactions
						</Label>
						<span className="text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
							{subscriptionPercentage}%
						</span>
					</div>
					<Slider
						id="subscriptionPercentage"
						min={0}
						max={100}
						step={1}
						value={[subscriptionPercentage]}
						onValueChange={handleSubscriptionPercentageChange}
						className="w-full"
					/>
				</div>
			</div>
		</div>
	);
});

export default TransactionDistributionSection;
