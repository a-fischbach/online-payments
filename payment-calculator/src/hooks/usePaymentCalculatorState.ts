import { useState, useMemo, useCallback } from "react";
import { StripeConfig } from "@/lib/payment-calculator";

export interface PaymentCalculatorState {
	config: StripeConfig;
	setConfig: React.Dispatch<React.SetStateAction<StripeConfig>>;
	subscriptionPercentage: number;
	setSubscriptionPercentage: (value: number) => void;
	averageSubscriptionAmount: number;
	setAverageSubscriptionAmount: (value: number) => void;
	averageTransactionAmount: number;
	setAverageTransactionAmount: (value: number) => void;
	europeanPercentage: number;
	setEuropeanPercentage: (value: number) => void;
	usPercentage: number;
	setUsPercentage: (value: number) => void;
	ukPercentage: number;
	setUkPercentage: (value: number) => void;
	maxTurnover: number;
	setMaxTurnover: (value: number) => void;
	numberOfSales: number;
	setNumberOfSales: (value: number) => void;
	blendedAverageAmount: number;
}

export function usePaymentCalculatorState(): PaymentCalculatorState {
	const [config, setConfig] = useState<StripeConfig>({
		includeChargebackFee: false,
		euVatOssRequired: true,
		ukVatRequired: false,
		usSalesTaxRequired: false,
		numberOfUsStates: 1,
	});

	const [subscriptionPercentage, setSubscriptionPercentage] = useState(0);
	const [averageSubscriptionAmount, setAverageSubscriptionAmount] = useState(30);
	const [averageTransactionAmount, setAverageTransactionAmount] = useState(50);
	const [europeanPercentage, setEuropeanPercentage] = useState(30);
	const [usPercentage, setUsPercentage] = useState(25);
	const [ukPercentage, setUkPercentage] = useState(45);
	const [maxTurnover, setMaxTurnover] = useState(100000); // £100K default
	const [numberOfSales, setNumberOfSales] = useState(1000); // Default 1000 sales

	// Calculate blended average transaction amount
	const blendedAverageAmount = useMemo(() => {
		const subscriptionPortion = (subscriptionPercentage / 100) * averageSubscriptionAmount;
		const nonSubscriptionPortion = ((100 - subscriptionPercentage) / 100) * averageTransactionAmount;
		return subscriptionPortion + nonSubscriptionPortion;
	}, [subscriptionPercentage, averageSubscriptionAmount, averageTransactionAmount]);

	// Memoize setter functions to prevent unnecessary re-renders
	const memoizedSetSubscriptionPercentage = useCallback((value: number) => {
		setSubscriptionPercentage(value);
	}, []);

	const memoizedSetAverageSubscriptionAmount = useCallback((value: number) => {
		setAverageSubscriptionAmount(value);
	}, []);

	const memoizedSetAverageTransactionAmount = useCallback((value: number) => {
		setAverageTransactionAmount(value);
	}, []);

	const memoizedSetEuropeanPercentage = useCallback((value: number) => {
		setEuropeanPercentage(value);
	}, []);

	const memoizedSetUsPercentage = useCallback((value: number) => {
		setUsPercentage(value);
	}, []);

	const memoizedSetUkPercentage = useCallback((value: number) => {
		setUkPercentage(value);
	}, []);

	const memoizedSetMaxTurnover = useCallback((value: number) => {
		setMaxTurnover(value);
	}, []);

	const memoizedSetNumberOfSales = useCallback((value: number) => {
		setNumberOfSales(value);
	}, []);

	return {
		config,
		setConfig,
		subscriptionPercentage,
		setSubscriptionPercentage: memoizedSetSubscriptionPercentage,
		averageSubscriptionAmount,
		setAverageSubscriptionAmount: memoizedSetAverageSubscriptionAmount,
		averageTransactionAmount,
		setAverageTransactionAmount: memoizedSetAverageTransactionAmount,
		europeanPercentage,
		setEuropeanPercentage: memoizedSetEuropeanPercentage,
		usPercentage,
		setUsPercentage: memoizedSetUsPercentage,
		ukPercentage,
		setUkPercentage: memoizedSetUkPercentage,
		maxTurnover,
		setMaxTurnover: memoizedSetMaxTurnover,
		numberOfSales,
		setNumberOfSales: memoizedSetNumberOfSales,
		blendedAverageAmount,
	};
}
