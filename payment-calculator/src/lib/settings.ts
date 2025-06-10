export interface PaymentSettings {
	accountancy: {
		baseAnnualAccountantFee: number; // £500 annual fee for basic accounting
		monthlyEuVatFee: number; // £200/month covers all EU VAT work (compliance + quarterly filing)
		monthlyUkVatFee: number; // £120/month covers all UK VAT work (compliance + quarterly filing)
		monthlyUsSalesTaxFee: number; // £160/month covers US sales tax work per state (compliance + filing)
	};
	stripe: {
		// UK rates as of 2024
		baseRate: number; // 1.5% for UK domestic cards
		baseFixedFee: number; // £0.20 per transaction
		europeanRate: number; // 2.5% for European cards
		europeanFixedFee: number; // £0.20 per transaction
		nonEuropeanRate: number; // 3.25% for non-European cards
		nonEuropeanFixedFee: number; // £0.20 per transaction
		subscriptionSurcharge: number; // 0.7% additional for subscriptions
		stripeTaxRate: number; // 0.5% for Stripe Tax
		chargebackFee: number; // £15 per chargeback
		disputeFee: number; // £15 per dispute
	};
	mor: {
		// USD rates
		platformFeeRate: number; // 5% platform fee
		platformFixedFee: number; // $0.50 per transaction
		internationalFeeRate: number; // 1.5% for international transactions outside US
		subscriptionSurchargeRate: number; // 0.5% additional for subscriptions
		payoutFeeRate: number; // 1% of payout amount
	};
	assumptions: {
		chargebackRate: number; // 0.6% chargeback rate
		disputeRate: number; // 0.2% dispute rate
		usdToGbpRate: number; // USD to GBP conversion rate
	};
}

export const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
	accountancy: {
		baseAnnualAccountantFee: 500, // £500 annual fee for basic accounting
		monthlyEuVatFee: 200, // £200/month covers all EU VAT work (compliance + quarterly filing)
		monthlyUkVatFee: 120, // £120/month covers all UK VAT work (compliance + quarterly filing)
		monthlyUsSalesTaxFee: 160, // £160/month covers US sales tax work per state (compliance + filing)
	},
	stripe: {
		// UK rates as of 2024
		baseRate: 0.015, // 1.5% for UK domestic cards
		baseFixedFee: 0.2, // £0.20 per transaction
		europeanRate: 0.025, // 2.5% for European cards
		europeanFixedFee: 0.2, // £0.20 per transaction
		nonEuropeanRate: 0.0325, // 3.25% for non-European cards
		nonEuropeanFixedFee: 0.2, // £0.20 per transaction
		subscriptionSurcharge: 0.007, // 0.7% additional for subscriptions
		stripeTaxRate: 0.005, // 0.5% for Stripe Tax
		chargebackFee: 15.0, // £15 per chargeback
		disputeFee: 15.0, // £15 per dispute
	},
	mor: {
		// USD rates
		platformFeeRate: 0.05, // 5% platform fee
		platformFixedFee: 0.5, // $0.50 per transaction
		internationalFeeRate: 0.015, // 1.5% for international transactions outside US
		subscriptionSurchargeRate: 0.005, // 0.5% additional for subscriptions
		payoutFeeRate: 0.01, // 1% of payout amount
	},
	assumptions: {
		chargebackRate: 0.006, // 0.6% chargeback rate
		disputeRate: 0.002, // 0.2% dispute rate
		usdToGbpRate: 0.79, // USD to GBP conversion rate
	},
};
