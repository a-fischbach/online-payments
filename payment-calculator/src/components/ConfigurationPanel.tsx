import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StripeConfig } from "@/lib/payment-calculator";
import TransactionDistributionSection from "./TransactionDistributionSection";
import TaxComplianceSection from "./TaxComplianceSection";
import HardcodedSettings from "./HardcodedSettings";

interface ConfigurationPanelProps {
	config: StripeConfig;
	setConfig: React.Dispatch<React.SetStateAction<StripeConfig>>;
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

export default function ConfigurationPanel({
	config,
	setConfig,
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
}: ConfigurationPanelProps) {
	return (
		<div className="xl:col-span-1 space-y-6">
			<Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-8">
				<CardHeader className="pb-4">
					<CardTitle className="text-xl font-semibold text-gray-900">Configuration</CardTitle>
					<CardDescription className="text-gray-600">
						Adjust settings to match your business requirements
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-8">
					<TransactionDistributionSection
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
					<TaxComplianceSection config={config} setConfig={setConfig} />
				</CardContent>
			</Card>
			<HardcodedSettings />
		</div>
	);
}
