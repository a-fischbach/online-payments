interface TransactionData {
	amount: number;
	volume: number; // transactions per month
	europeanPercentage: number; // percentage of EU transactions (excluding UK)
	usPercentage: number; // percentage of US transactions
	subscriptionPercentage: number; // percentage that are subscriptions
	averageSubscriptionAmount: number;
}

interface StripeConfig {
	includeChargebackFee: boolean;
	euVatOssRequired: boolean; // whether EU VAT OSS registration is needed (required from first EU sale)
	ukVatRequired: boolean; // whether UK VAT registration is needed (optional, threshold-based)
	usSalesTaxRequired: boolean; // whether US sales tax compliance is needed (optional, nexus-based)
}

interface StripeCosts {
	vatRegistrationCost: number;
	ongoingVatComplianceCost: number;
	baseProcessingFees: number;
	europeanFees: number;
	nonEuropeanFees: number;
	subscriptionSurcharge: number;
	stripeTaxSurcharge: number;
	chargebackFees: number;
	additionalFees: number; // dispute fees, SEPA fees, etc.
	accountantFee: number; // flat accountant fee
	totalMonthlyCost: number;
	totalAnnualCost: number;
	monthlyTurnover: number;
	annualTurnover: number;
	monthlyProfit: number;
	annualProfit: number;
}

interface MerchantOfRecordCosts {
	platformFee: number;
	europeanFees: number;
	nonEuropeanFees: number;
	subscriptionSurcharge: number;
	payoutFee: number;
	totalMonthlyCost: number;
	totalAnnualCost: number;
	monthlyTurnover: number;
	annualTurnover: number;
	monthlyProfit: number;
	annualProfit: number;
}

class PaymentProcessorCalculator {
	private stripeRatesUK = {
		// UK rates as of 2024
		baseRate: 0.015, // 1.5% for UK domestic cards
		baseFixedFee: 0.2, // £0.20 per transaction
		europeanRate: 0.025, // 2.5% for European cards
		europeanFixedFee: 0.2, // £0.20 per transaction
		nonEuropeanRate: 0.0325, // 3.25% for non-European cards
		nonEuropeanFixedFee: 0.2, // £0.20 per transaction
		subscriptionSurcharge: 0.005, // 0.5% additional for subscriptions
		stripeTaxRate: 0.005, // 0.5% for Stripe Tax
		chargebackFee: 15.0, // £15 per chargeback
		disputeFee: 15.0, // £15 per dispute
		// EU VAT OSS compliance costs (required from first EU sale)
		euVatOssRegistrationCost: 200, // £200 one-time registration fee for EU VAT OSS
		monthlyEuVatCompliance: 180, // £180/month for accountant/software for EU VAT OSS compliance
		quarterlyEuVatFiling: 80, // £80 per quarter for EU VAT OSS filing
		// UK VAT compliance costs (optional, threshold-based at £85k)
		ukVatRegistrationCost: 0, // Free to register for VAT in UK
		monthlyUkVatCompliance: 120, // £120/month for UK VAT accounting/software
		quarterlyUkVatFiling: 40, // £40 per quarter for UK VAT filing
		// US Sales Tax compliance costs (optional, nexus-based, averaged across states)
		usSalesTaxRegistrationCost: 250, // £250 (~$300) average setup for 5-7 states
		monthlyUsSalesTaxCompliance: 160, // £160/month for multi-state sales tax software & accounting
		monthlyUsSalesTaxFiling: 60, // £60/month average filing costs across states
	};

	//This should be US Dollars
	private morRatesUK = {
		platformFeeRate: 0.05, // 5% platform fee
		platformFixedFee: 0.5, // $0.50 per transaction
		internationalFeeRate: 0.015, // 1.5% for international transactions outside US
		subscriptionSurchargeRate: 0.005, // 0.5% additional for subscriptions
		payoutFeeRate: 0.01, // 1% of payout amount
	};

	calculateStripeCosts(data: TransactionData, config: StripeConfig): StripeCosts {
		const monthlyVolume = data.volume;
		const monthlyRevenue = data.amount * monthlyVolume;

		// Separate transaction volumes by region
		const euTransactions = monthlyVolume * (data.europeanPercentage / 100);
		const usTransactions = monthlyVolume * (data.usPercentage / 100);
		const ukTransactions = monthlyVolume - euTransactions - usTransactions;
		const otherNonEuropeanTransactions = monthlyVolume - ukTransactions - euTransactions - usTransactions;

		const subscriptionTransactions = monthlyVolume * (data.subscriptionPercentage / 100);
		const subscriptionRevenue = data.averageSubscriptionAmount * subscriptionTransactions;

		// UK domestic processing fees
		const ukRevenue = ukTransactions * data.amount;
		const ukProcessingFees =
			ukTransactions * this.stripeRatesUK.baseFixedFee + ukRevenue * this.stripeRatesUK.baseRate;

		// European fees (EU cards)
		const euRevenue = euTransactions * data.amount;
		const europeanFees =
			euTransactions * this.stripeRatesUK.europeanFixedFee + euRevenue * this.stripeRatesUK.europeanRate;

		// US fees (non-European rate)
		const usRevenue = usTransactions * data.amount;
		const usFees =
			usTransactions * this.stripeRatesUK.nonEuropeanFixedFee + usRevenue * this.stripeRatesUK.nonEuropeanRate;

		// Other non-European fees (rest of world)
		const otherNonEuropeanRevenue = otherNonEuropeanTransactions * data.amount;
		const otherNonEuropeanFees =
			otherNonEuropeanTransactions * this.stripeRatesUK.nonEuropeanFixedFee +
			otherNonEuropeanRevenue * this.stripeRatesUK.nonEuropeanRate;

		const nonEuropeanFees = usFees + otherNonEuropeanFees;

		// Subscription surcharge
		const subscriptionSurcharge = subscriptionRevenue * this.stripeRatesUK.subscriptionSurcharge;

		// Stripe Tax surcharge (for VAT handling)
		const stripeTaxSurcharge = monthlyRevenue * this.stripeRatesUK.stripeTaxRate;

		// Tax compliance costs (EU VAT OSS, UK VAT, US Sales Tax)
		const euVatOssRegistrationCost = config.euVatOssRequired ? this.stripeRatesUK.euVatOssRegistrationCost : 0;
		const ukVatRegistrationCost = config.ukVatRequired ? this.stripeRatesUK.ukVatRegistrationCost : 0;
		const usSalesTaxRegistrationCost = config.usSalesTaxRequired
			? this.stripeRatesUK.usSalesTaxRegistrationCost
			: 0;
		const totalRegistrationCost = euVatOssRegistrationCost + ukVatRegistrationCost + usSalesTaxRegistrationCost;

		const monthlyEuVatCompliance = config.euVatOssRequired
			? this.stripeRatesUK.monthlyEuVatCompliance + this.stripeRatesUK.quarterlyEuVatFiling / 3
			: 0;
		const monthlyUkVatCompliance = config.ukVatRequired
			? this.stripeRatesUK.monthlyUkVatCompliance + this.stripeRatesUK.quarterlyUkVatFiling / 3
			: 0;
		const monthlyUsSalesTaxCompliance = config.usSalesTaxRequired
			? this.stripeRatesUK.monthlyUsSalesTaxCompliance + this.stripeRatesUK.monthlyUsSalesTaxFiling
			: 0;

		const totalMonthlyTaxCompliance = monthlyEuVatCompliance + monthlyUkVatCompliance + monthlyUsSalesTaxCompliance;

		// Chargeback fees (optional)
		const estimatedChargebacks = config.includeChargebackFee ? monthlyVolume * 0.006 : 0; // 0.6% chargeback rate
		const chargebackFees = estimatedChargebacks * this.stripeRatesUK.chargebackFee;

		// Additional fees (disputes only)
		const disputeFees = monthlyVolume * 0.002 * this.stripeRatesUK.disputeFee; // 0.2% dispute rate
		const additionalFees = disputeFees;

		// Accountant fee (averaged monthly)
		const monthlyAccountantFee = 500 / 12; // £500 annual fee averaged to monthly (£41.67/month)

		const baseProcessingFees = ukProcessingFees;
		const totalMonthlyCost =
			baseProcessingFees +
			europeanFees +
			nonEuropeanFees +
			subscriptionSurcharge +
			stripeTaxSurcharge +
			chargebackFees +
			additionalFees +
			totalMonthlyTaxCompliance +
			monthlyAccountantFee;

		const totalAnnualCost = totalMonthlyCost * 12 + totalRegistrationCost;

		return {
			vatRegistrationCost: totalRegistrationCost,
			ongoingVatComplianceCost: totalMonthlyTaxCompliance * 12,
			baseProcessingFees,
			europeanFees,
			nonEuropeanFees,
			subscriptionSurcharge,
			stripeTaxSurcharge,
			chargebackFees,
			additionalFees,
			accountantFee: monthlyAccountantFee * 12, // Return annual total for consistency
			totalMonthlyCost,
			totalAnnualCost,
			monthlyTurnover: monthlyRevenue,
			annualTurnover: monthlyRevenue * 12,
			monthlyProfit: monthlyRevenue - totalMonthlyCost,
			annualProfit: monthlyRevenue * 12 - totalAnnualCost,
		};
	}

	calculateMoRCosts(data: TransactionData): MerchantOfRecordCosts {
		const monthlyVolume = data.volume;
		const monthlyRevenue = data.amount * monthlyVolume;
		const subscriptionTransactions = monthlyVolume * (data.subscriptionPercentage / 100);
		const subscriptionRevenue = data.averageSubscriptionAmount * subscriptionTransactions;

		// For MoR, US transactions are typically domestic (lower fees)
		const usTransactions = monthlyVolume * (data.usPercentage / 100);
		const usRevenue = usTransactions * data.amount;
		const internationalTransactions = monthlyVolume - usTransactions;
		const internationalRevenue = internationalTransactions * data.amount;

		// Platform fee (percentage + fixed fee per transaction) - in USD
		const platformPercentageFee = monthlyRevenue * this.morRatesUK.platformFeeRate;
		const platformFixedFees = monthlyVolume * this.morRatesUK.platformFixedFee;
		const platformFee = platformPercentageFee + platformFixedFees;

		// International fees (outside US) - EU and other regions
		const europeanFees = internationalRevenue * this.morRatesUK.internationalFeeRate;
		const nonEuropeanFees = 0; // Simplified to single international rate

		// Subscription surcharge
		const subscriptionSurcharge = subscriptionRevenue * this.morRatesUK.subscriptionSurchargeRate;

		// Payout fees (percentage of revenue only)
		const payoutFee = monthlyRevenue * this.morRatesUK.payoutFeeRate;

		const totalMonthlyCost = platformFee + europeanFees + subscriptionSurcharge + payoutFee;
		const totalAnnualCost = totalMonthlyCost * 12;

		return {
			platformFee,
			europeanFees,
			nonEuropeanFees,
			subscriptionSurcharge,
			payoutFee,
			totalMonthlyCost,
			totalAnnualCost,
			monthlyTurnover: monthlyRevenue,
			annualTurnover: monthlyRevenue * 12,
			monthlyProfit: monthlyRevenue - totalMonthlyCost,
			annualProfit: monthlyRevenue * 12 - totalAnnualCost,
		};
	}

	compare(data: TransactionData, stripeConfig: StripeConfig) {
		const stripeCosts = this.calculateStripeCosts(data, stripeConfig);
		const morCosts = this.calculateMoRCosts(data);

		console.log("=".repeat(60));
		console.log("UK PAYMENT PROCESSOR COST COMPARISON");
		console.log("=".repeat(60));

		console.log(`\nTransaction Data:`);
		console.log(`- Average transaction amount: £${data.amount.toFixed(2)}`);
		console.log(`- Monthly transaction volume: ${data.volume.toLocaleString()}`);
		console.log(`- Monthly revenue: £${(data.amount * data.volume).toLocaleString()}`);
		console.log(`- UK transactions: ${(100 - data.europeanPercentage - data.usPercentage).toFixed(1)}%`);
		console.log(`- EU transactions: ${data.europeanPercentage}%`);
		console.log(`- US transactions: ${data.usPercentage}%`);
		console.log(
			`- Other regions: ${(
				100 -
				(100 - data.europeanPercentage - data.usPercentage) -
				data.europeanPercentage -
				data.usPercentage
			).toFixed(1)}%`
		);
		console.log(`- Subscription transactions: ${data.subscriptionPercentage}%`);
		console.log(`- EU VAT OSS required: ${stripeConfig.euVatOssRequired ? "Yes" : "No"}`);
		console.log(`- UK VAT required: ${stripeConfig.ukVatRequired ? "Yes" : "No"}`);
		console.log(`- US Sales Tax required: ${stripeConfig.usSalesTaxRequired ? "Yes" : "No"}`);

		console.log(`\n${"STRIPE COSTS (GBP)".padEnd(30)} | ${"MERCHANT OF RECORD (USD)".padEnd(30)}`);
		console.log("-".repeat(64));

		console.log(
			`UK domestic fees: £${stripeCosts.baseProcessingFees.toFixed(2)}`.padEnd(30) +
				`| Platform fee: $${morCosts.platformFee.toFixed(2)}`
		);

		console.log(
			`EU card fees: £${stripeCosts.europeanFees.toFixed(2)}`.padEnd(30) +
				`| International fees: $${morCosts.europeanFees.toFixed(2)}`
		);

		// Calculate US-specific fees for display
		const usTransactions = data.volume * (data.usPercentage / 100);
		const usRevenue = usTransactions * data.amount;
		const usFees = usTransactions * 0.2 + usRevenue * 0.0325; // Using non-European rate for US

		console.log(`US card fees: £${usFees.toFixed(2)}`.padEnd(30) + `| (US domestic for MoR)`);

		const otherTransactions =
			data.volume -
			data.volume * (data.europeanPercentage / 100) -
			usTransactions -
			(data.volume - data.volume * (data.europeanPercentage / 100) - usTransactions);
		const otherRevenue = otherTransactions * data.amount;
		const otherFees = otherTransactions * 0.2 + otherRevenue * 0.0325;

		console.log(`Other regions fees: £${otherFees.toFixed(2)}`.padEnd(30) + `| (Included in international)`);

		console.log(
			`Subscription surcharge: £${stripeCosts.subscriptionSurcharge.toFixed(2)}`.padEnd(30) +
				`| Subscription surcharge: $${morCosts.subscriptionSurcharge.toFixed(2)}`
		);

		console.log(
			`Stripe Tax (VAT): £${stripeCosts.stripeTaxSurcharge.toFixed(2)}`.padEnd(30) +
				`| Payout fees: $${morCosts.payoutFee.toFixed(2)}`
		);

		console.log(
			`Tax compliance: £${(stripeCosts.ongoingVatComplianceCost / 12).toFixed(2)}`.padEnd(30) +
				`| (Tax handled by MoR)`
		);

		if (stripeConfig.includeChargebackFee) {
			console.log(`Chargeback fees: £${stripeCosts.chargebackFees.toFixed(2)}`.padEnd(30) + `| (Handled by MoR)`);
		}

		console.log(`Other fees: £${stripeCosts.additionalFees.toFixed(2)}`.padEnd(30) + `| N/A`);

		console.log("-".repeat(64));
		console.log(
			`MONTHLY TOTAL: £${stripeCosts.totalMonthlyCost.toFixed(2)}`.padEnd(30) +
				`| MONTHLY TOTAL: $${morCosts.totalMonthlyCost.toFixed(2)}`
		);

		console.log(
			`ANNUAL TOTAL: £${stripeCosts.totalAnnualCost.toFixed(2)}`.padEnd(30) +
				`| ANNUAL TOTAL: $${morCosts.totalAnnualCost.toFixed(2)}`
		);

		console.log("\n" + "=".repeat(60));
		console.log("TURNOVER & PROFIT ANALYSIS");
		console.log("=".repeat(60));

		console.log(`\n${"STRIPE (GBP)".padEnd(30)} | ${"MERCHANT OF RECORD (USD)".padEnd(30)}`);
		console.log("-".repeat(64));

		console.log(
			`Monthly Turnover: £${stripeCosts.monthlyTurnover.toFixed(2)}`.padEnd(30) +
				`| Monthly Turnover: $${morCosts.monthlyTurnover.toFixed(2)}`
		);

		console.log(
			`Annual Turnover: £${stripeCosts.annualTurnover.toFixed(2)}`.padEnd(30) +
				`| Annual Turnover: $${morCosts.annualTurnover.toFixed(2)}`
		);

		console.log(
			`Monthly Profit: £${stripeCosts.monthlyProfit.toFixed(2)}`.padEnd(30) +
				`| Monthly Profit: $${morCosts.monthlyProfit.toFixed(2)}`
		);

		console.log(
			`Annual Profit: £${stripeCosts.annualProfit.toFixed(2)}`.padEnd(30) +
				`| Annual Profit: $${morCosts.annualProfit.toFixed(2)}`
		);

		// Calculate profit margins
		const stripeMonthlyMargin = (stripeCosts.monthlyProfit / stripeCosts.monthlyTurnover) * 100;
		const stripeAnnualMargin = (stripeCosts.annualProfit / stripeCosts.annualTurnover) * 100;
		const morMonthlyMargin = (morCosts.monthlyProfit / morCosts.monthlyTurnover) * 100;
		const morAnnualMargin = (morCosts.annualProfit / morCosts.annualTurnover) * 100;

		console.log(
			`Monthly Margin: ${stripeMonthlyMargin.toFixed(1)}%`.padEnd(30) +
				`| Monthly Margin: ${morMonthlyMargin.toFixed(1)}%`
		);

		console.log(
			`Annual Margin: ${stripeAnnualMargin.toFixed(1)}%`.padEnd(30) +
				`| Annual Margin: ${morAnnualMargin.toFixed(1)}%`
		);

		// Convert MoR costs to GBP for comparison (assuming 1.27 USD = 1 GBP)
		const usdToGbpRate = 0.79; // Approximate exchange rate
		const morCostsInGbp = morCosts.totalAnnualCost * usdToGbpRate;
		const morProfitInGbp = morCosts.annualProfit * usdToGbpRate;
		const savings = stripeCosts.totalAnnualCost - morCostsInGbp;
		const profitDifference = morProfitInGbp - stripeCosts.annualProfit;

		if (stripeConfig.euVatOssRequired || stripeConfig.ukVatRequired || stripeConfig.usSalesTaxRequired) {
			console.log(`\nTax compliance setup costs (Stripe): £${stripeCosts.vatRegistrationCost}`);
			if (stripeConfig.euVatOssRequired) console.log(`  - EU VAT OSS registration: £${200}`);
			if (stripeConfig.ukVatRequired) console.log(`  - UK VAT registration: £${0} (free)`);
			if (stripeConfig.usSalesTaxRequired) {
				console.log(`  - US Sales Tax registration: £${250}`);
				console.log(`  - Monthly US sales tax compliance: £${160} (software & accounting)`);
				console.log(`  - Monthly US sales tax filing: £${60} (avg across states)`);
			}
		}

		console.log(`\n💱 Currency Conversion: MoR costs converted from USD to GBP at rate ${usdToGbpRate}`);
		console.log(`MoR Annual Total (GBP equivalent): £${morCostsInGbp.toFixed(2)}`);
		console.log(`MoR Annual Profit (GBP equivalent): £${morProfitInGbp.toFixed(2)}`);

		console.log("\n" + "=".repeat(60));
		console.log("FINAL COMPARISON (GBP)");
		console.log("=".repeat(60));

		console.log(`Stripe Annual Profit: £${stripeCosts.annualProfit.toFixed(2)}`);
		console.log(`MoR Annual Profit (GBP): £${morProfitInGbp.toFixed(2)}`);

		if (profitDifference > 0) {
			console.log(`💰 MERCHANT OF RECORD GENERATES £${profitDifference.toFixed(2)} MORE PROFIT annually`);
			console.log(`🎯 Recommendation: Use Merchant of Record for higher profitability`);
		} else {
			console.log(`💰 STRIPE GENERATES £${Math.abs(profitDifference).toFixed(2)} MORE PROFIT annually`);
			console.log(`🎯 Recommendation: Use Stripe for higher profitability`);
		}

		if (savings > 0) {
			console.log(`📊 Cost Savings with MoR: £${savings.toFixed(2)} annually`);
		} else {
			console.log(`📊 Cost Savings with Stripe: £${Math.abs(savings).toFixed(2)} annually`);
		}

		return { stripeCosts, morCosts, savings };
	}
}

// Example usage for UK business
function runUKComparison() {
	const calculator = new PaymentProcessorCalculator();

	// Example scenario: UK SaaS product
	const transactionData: TransactionData = {
		amount: 50, // £50 average transaction
		volume: 100, // Monthly transactions
		europeanPercentage: 33, // 30% EU customers (excluding UK)
		usPercentage: 33, // 25% US customers
		subscriptionPercentage: 0, // 20% are subscriptions
		averageSubscriptionAmount: 30,
	};

	const stripeConfig: StripeConfig = {
		includeChargebackFee: false, // User mentioned they'd refund instead
		euVatOssRequired: true, // EU VAT OSS required from first EU sale
		ukVatRequired: false, // UK VAT optional, threshold-based (£85k)
		usSalesTaxRequired: false, // US sales tax optional, nexus-based
	};

	calculator.compare(transactionData, stripeConfig);
}

// Run the UK comparison
runUKComparison();

// Export for use in other modules
export { PaymentProcessorCalculator };
export type { TransactionData, StripeConfig };
