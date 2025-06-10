"use client";

import React, { useMemo, useCallback, useEffect, useState } from "react";
import { PaymentProcessorCalculator } from "@/lib/payment-calculator";
import { usePaymentCalculatorState } from "@/hooks/usePaymentCalculatorState";
import { usePercentageAdjustment } from "@/hooks/usePercentageAdjustment";
import { useAutomaticTaxThresholds } from "@/hooks/useAutomaticTaxThresholds";
import PaymentCalculatorHeader from "@/components/PaymentCalculatorHeader";
import ConfigurationPanel from "@/components/ConfigurationPanel";
import CostComparisonChart from "@/components/CostComparisonChart";
import CostSummaryCard from "@/components/CostSummaryCard";
import DetailedBreakdownCard from "@/components/DetailedBreakdownCard";

// Debounce hook for expensive calculations
function useDebounce<T>(value: T, delay: number) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

export default function PaymentCalculatorPage() {
	const state = usePaymentCalculatorState();
	const {
		config,
		setConfig,
		subscriptionPercentage,
		setSubscriptionPercentage,
		averageSubscriptionAmount,
		setAverageSubscriptionAmount,
		averageTransactionAmount,
		setAverageTransactionAmount,
		europeanPercentage,
		setEuropeanPercentage,
		usPercentage,
		setUsPercentage,
		ukPercentage,
		setUkPercentage,
		maxTurnover,
		setMaxTurnover,
		numberOfSales,
		setNumberOfSales,
		blendedAverageAmount,
	} = state;

	const { adjustPercentages } = usePercentageAdjustment(
		europeanPercentage,
		setEuropeanPercentage,
		usPercentage,
		setUsPercentage,
		ukPercentage,
		setUkPercentage
	);

	// Automatically adjust tax compliance settings based on thresholds
	useAutomaticTaxThresholds({
		europeanPercentage,
		usPercentage,
		ukPercentage,
		numberOfSales,
		blendedAverageAmount,
		setConfig,
	});

	const calculator = useMemo(() => new PaymentProcessorCalculator(), []);

	// Create a debounced version of the key values for chart calculation
	const debouncedChartInputs = useDebounce(
		{
			config,
			subscriptionPercentage,
			averageSubscriptionAmount,
			europeanPercentage,
			usPercentage,
			maxTurnover,
			blendedAverageAmount,
		},
		100 // 100ms debounce
	);

	const chartData = useMemo(() => {
		return calculator.generateChartData(
			debouncedChartInputs.config,
			debouncedChartInputs.subscriptionPercentage,
			debouncedChartInputs.averageSubscriptionAmount,
			debouncedChartInputs.europeanPercentage,
			debouncedChartInputs.usPercentage,
			debouncedChartInputs.maxTurnover,
			debouncedChartInputs.blendedAverageAmount
		);
	}, [
		calculator,
		debouncedChartInputs.config,
		debouncedChartInputs.subscriptionPercentage,
		debouncedChartInputs.averageSubscriptionAmount,
		debouncedChartInputs.blendedAverageAmount,
		debouncedChartInputs.europeanPercentage,
		debouncedChartInputs.usPercentage,
		debouncedChartInputs.maxTurnover,
	]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
			<PaymentCalculatorHeader />

			{/* Main Content */}
			<div className="container mx-auto px-6 py-8">
				<div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
					<ConfigurationPanel
						config={config}
						setConfig={setConfig}
						europeanPercentage={europeanPercentage}
						usPercentage={usPercentage}
						ukPercentage={ukPercentage}
						adjustPercentages={adjustPercentages}
						averageSubscriptionAmount={averageSubscriptionAmount}
						setAverageSubscriptionAmount={setAverageSubscriptionAmount}
						averageTransactionAmount={averageTransactionAmount}
						setAverageTransactionAmount={setAverageTransactionAmount}
						blendedAverageAmount={blendedAverageAmount}
						maxTurnover={maxTurnover}
						setMaxTurnover={setMaxTurnover}
						numberOfSales={numberOfSales}
						setNumberOfSales={setNumberOfSales}
						subscriptionPercentage={subscriptionPercentage}
						setSubscriptionPercentage={setSubscriptionPercentage}
					/>

					{/* Chart and Analysis */}
					<div className="xl:col-span-3 space-y-8">
						<CostComparisonChart chartData={chartData} />

						<CostSummaryCard
							numberOfSales={numberOfSales}
							blendedAverageAmount={blendedAverageAmount}
							europeanPercentage={europeanPercentage}
							usPercentage={usPercentage}
							subscriptionPercentage={subscriptionPercentage}
							averageSubscriptionAmount={averageSubscriptionAmount}
							calculator={calculator}
							config={config}
						/>

						<DetailedBreakdownCard
							numberOfSales={numberOfSales}
							blendedAverageAmount={blendedAverageAmount}
							europeanPercentage={europeanPercentage}
							usPercentage={usPercentage}
							subscriptionPercentage={subscriptionPercentage}
							averageSubscriptionAmount={averageSubscriptionAmount}
							averageTransactionAmount={averageTransactionAmount}
							calculator={calculator}
							config={config}
							chartData={chartData}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
