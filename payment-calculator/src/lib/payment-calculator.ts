import { DEFAULT_PAYMENT_SETTINGS, PaymentSettings } from "./settings";

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
	numberOfUsStates: number; // number of US states registered for sales tax (default: 1)
}

interface StripeCosts {
	ongoingVatComplianceCost: number;
	monthlyTaxComplianceCost: number; // monthly ongoing compliance costs
	baseProcessingFees: number;
	europeanFees: number;
	nonEuropeanFees: number;
	subscriptionSurcharge: number;
	stripeTaxSurcharge: number;
	chargebackFees: number;
	additionalFees: number; // dispute fees, SEPA fees, etc.
	baseAccountantFee: number; // flat accountant fee (same for both Stripe and MoR)
	stripeNexusFilingFee: number; // additional Stripe-specific nexus registration and filing fees
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
	baseAccountantFee: number; // flat accountant fee (same for both Stripe and MoR)
	totalMonthlyCost: number;
	totalAnnualCost: number;
	monthlyTurnover: number;
	annualTurnover: number;
	monthlyProfit: number;
	annualProfit: number;
}

export class PaymentProcessorCalculator {
	private settings: PaymentSettings;

	constructor(customSettings?: Partial<PaymentSettings>) {
		this.settings = customSettings
			? this.mergeSettings(DEFAULT_PAYMENT_SETTINGS, customSettings)
			: DEFAULT_PAYMENT_SETTINGS;
	}

	private mergeSettings(defaults: PaymentSettings, custom: Partial<PaymentSettings>): PaymentSettings {
		return {
			accountancy: { ...defaults.accountancy, ...custom.accountancy },
			stripe: { ...defaults.stripe, ...custom.stripe },
			mor: { ...defaults.mor, ...custom.mor },
			assumptions: { ...defaults.assumptions, ...custom.assumptions },
		};
	}

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
			ukTransactions * this.settings.stripe.baseFixedFee + ukRevenue * this.settings.stripe.baseRate;

		// European fees (EU cards)
		const euRevenue = euTransactions * data.amount;
		const europeanFees =
			euTransactions * this.settings.stripe.europeanFixedFee + euRevenue * this.settings.stripe.europeanRate;

		// US fees (non-European rate)
		const usRevenue = usTransactions * data.amount;
		const usFees =
			usTransactions * this.settings.stripe.nonEuropeanFixedFee +
			usRevenue * this.settings.stripe.nonEuropeanRate;

		// Other non-European fees (rest of world)
		const otherNonEuropeanRevenue = otherNonEuropeanTransactions * data.amount;
		const otherNonEuropeanFees =
			otherNonEuropeanTransactions * this.settings.stripe.nonEuropeanFixedFee +
			otherNonEuropeanRevenue * this.settings.stripe.nonEuropeanRate;

		const nonEuropeanFees = usFees + otherNonEuropeanFees;

		// Subscription surcharge
		const subscriptionSurcharge = subscriptionRevenue * this.settings.stripe.subscriptionSurcharge;

		// Stripe Tax surcharge (for VAT handling)
		const stripeTaxSurcharge = monthlyRevenue * this.settings.stripe.stripeTaxRate;

		// Tax compliance costs (EU VAT OSS, UK VAT, US Sales Tax)
		const monthlyEuVatFee = config.euVatOssRequired ? this.settings.accountancy.monthlyEuVatFee : 0;
		const monthlyUkVatFee = config.ukVatRequired ? this.settings.accountancy.monthlyUkVatFee : 0;
		const monthlyUsSalesTaxFee = config.usSalesTaxRequired
			? this.settings.accountancy.monthlyUsSalesTaxFee * config.numberOfUsStates
			: 0;

		const totalMonthlyTaxCompliance = monthlyEuVatFee + monthlyUkVatFee + monthlyUsSalesTaxFee;

		// Chargeback fees (optional)
		const estimatedChargebacks = config.includeChargebackFee
			? monthlyVolume * this.settings.assumptions.chargebackRate
			: 0;
		const chargebackFees = estimatedChargebacks * this.settings.stripe.chargebackFee;

		// Additional fees (disputes only)
		const disputeFees = monthlyVolume * this.settings.assumptions.disputeRate * this.settings.stripe.disputeFee;
		const additionalFees = disputeFees;

		// Base accountant fee (same for both Stripe and MoR)
		const monthlyBaseAccountantFee = this.settings.accountancy.baseAnnualAccountantFee / 12;

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
			monthlyBaseAccountantFee;

		const totalAnnualCost = totalMonthlyCost * 12;

		return {
			ongoingVatComplianceCost: totalMonthlyTaxCompliance * 12,
			monthlyTaxComplianceCost: totalMonthlyTaxCompliance,
			baseProcessingFees,
			europeanFees,
			nonEuropeanFees,
			subscriptionSurcharge,
			stripeTaxSurcharge,
			chargebackFees,
			additionalFees,
			baseAccountantFee: monthlyBaseAccountantFee * 12, // Return annual total for consistency
			stripeNexusFilingFee: 0, // Stripe-specific nexus registration and filing fees are removed
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
		const internationalTransactions = monthlyVolume - usTransactions;
		const internationalRevenue = internationalTransactions * data.amount;

		// Platform fee (percentage + fixed fee per transaction) - in USD
		const platformPercentageFee = monthlyRevenue * this.settings.mor.platformFeeRate;
		const platformFixedFees = monthlyVolume * this.settings.mor.platformFixedFee;
		const platformFee = platformPercentageFee + platformFixedFees;

		// International fees (outside US) - EU and other regions
		const europeanFees = internationalRevenue * this.settings.mor.internationalFeeRate;
		const nonEuropeanFees = 0; // Simplified to single international rate

		// Subscription surcharge
		const subscriptionSurcharge = subscriptionRevenue * this.settings.mor.subscriptionSurchargeRate;

		// Payout fees (percentage of revenue only)
		const payoutFee = monthlyRevenue * this.settings.mor.payoutFeeRate;

		// Base accountant fee (same as Stripe - averaged monthly)
		const monthlyBaseAccountantFee = this.settings.accountancy.baseAnnualAccountantFee / 12;

		const totalMonthlyCost =
			platformFee + europeanFees + subscriptionSurcharge + payoutFee + monthlyBaseAccountantFee;
		const totalAnnualCost = totalMonthlyCost * 12;

		return {
			platformFee,
			europeanFees,
			nonEuropeanFees,
			subscriptionSurcharge,
			payoutFee,
			baseAccountantFee: monthlyBaseAccountantFee * 12, // Return annual total for consistency
			totalMonthlyCost,
			totalAnnualCost,
			monthlyTurnover: monthlyRevenue,
			annualTurnover: monthlyRevenue * 12,
			monthlyProfit: monthlyRevenue - totalMonthlyCost,
			annualProfit: monthlyRevenue * 12 - totalAnnualCost,
		};
	}

	// Generate data points for charting - calculates costs across different turnover amounts
	generateChartData(
		config: StripeConfig,
		subscriptionPercentage: number = 0,
		averageSubscriptionAmount: number = 30,
		europeanPercentage: number = 30,
		usPercentage: number = 25,
		maxTurnover: number = 1000000, // £1M default max for chart
		averageTransactionAmount: number = 50 // £50 default average transaction
	) {
		const turnoverPoints: Array<{
			turnover: number;
			stripeCost: number;
			morCost: number;
			stripeProfit: number;
			morProfit: number;
		}> = [];
		const steps = 50;

		for (let i = 0; i <= steps; i++) {
			const monthlyTurnover = (maxTurnover / steps) * i;

			if (monthlyTurnover === 0) continue;

			// Estimate transaction volume using provided average transaction amount
			const volume = Math.round(monthlyTurnover / averageTransactionAmount);

			const data: TransactionData = {
				amount: averageTransactionAmount,
				volume,
				europeanPercentage,
				usPercentage,
				subscriptionPercentage,
				averageSubscriptionAmount,
			};

			const stripeCosts = this.calculateStripeCosts(data, config);
			const morCosts = this.calculateMoRCosts(data);

			// Convert MoR costs from USD to GBP
			const morCostsGbp = morCosts.totalMonthlyCost * this.settings.assumptions.usdToGbpRate;

			turnoverPoints.push({
				turnover: monthlyTurnover,
				stripeCost: stripeCosts.totalMonthlyCost,
				morCost: morCostsGbp,
				stripeProfit: stripeCosts.monthlyProfit,
				morProfit: morCosts.monthlyProfit * this.settings.assumptions.usdToGbpRate,
			});
		}

		return turnoverPoints;
	}
}

export type { TransactionData, StripeConfig, StripeCosts, MerchantOfRecordCosts };
