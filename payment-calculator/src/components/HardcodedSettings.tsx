import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, RotateCcw, Edit2, Check, X } from "lucide-react";
import { DEFAULT_PAYMENT_SETTINGS, PaymentSettings } from "@/lib/settings";

interface SettingsData {
	stripe: {
		ukDomesticRate: number;
		ukDomesticFixed: number;
		europeanRate: number;
		europeanFixed: number;
		nonEuropeanRate: number;
		nonEuropeanFixed: number;
		subscriptionSurcharge: number;
		taxFee: number;
		chargebackFee: number;
		disputeFee: number;
	};
	mor: {
		platformRate: number;
		platformFixed: number;
		internationalFee: number;
		subscriptionSurcharge: number;
		payoutFee: number;
	};
	accountancy: {
		baseAnnualFee: number;
		euVatMonthly: number;
		ukVatMonthly: number;
		usSalesTaxPerState: number;
	};
	assumptions: {
		chargebackRate: number;
		disputeRate: number;
		usdToGbpRate: number;
	};
}

// Convert from centralized settings format to component format
function convertToSettingsData(paymentSettings: PaymentSettings): SettingsData {
	return {
		stripe: {
			ukDomesticRate: paymentSettings.stripe.baseRate * 100, // Convert to percentage
			ukDomesticFixed: paymentSettings.stripe.baseFixedFee,
			europeanRate: paymentSettings.stripe.europeanRate * 100, // Convert to percentage
			europeanFixed: paymentSettings.stripe.europeanFixedFee,
			nonEuropeanRate: paymentSettings.stripe.nonEuropeanRate * 100, // Convert to percentage
			nonEuropeanFixed: paymentSettings.stripe.nonEuropeanFixedFee,
			subscriptionSurcharge: paymentSettings.stripe.subscriptionSurcharge * 100, // Convert to percentage
			taxFee: paymentSettings.stripe.stripeTaxRate * 100, // Convert to percentage
			chargebackFee: paymentSettings.stripe.chargebackFee,
			disputeFee: paymentSettings.stripe.disputeFee,
		},
		mor: {
			platformRate: paymentSettings.mor.platformFeeRate * 100, // Convert to percentage
			platformFixed: paymentSettings.mor.platformFixedFee,
			internationalFee: paymentSettings.mor.internationalFeeRate * 100, // Convert to percentage
			subscriptionSurcharge: paymentSettings.mor.subscriptionSurchargeRate * 100, // Convert to percentage
			payoutFee: paymentSettings.mor.payoutFeeRate * 100, // Convert to percentage
		},
		accountancy: {
			baseAnnualFee: paymentSettings.accountancy.baseAnnualAccountantFee,
			euVatMonthly: paymentSettings.accountancy.monthlyEuVatFee,
			ukVatMonthly: paymentSettings.accountancy.monthlyUkVatFee,
			usSalesTaxPerState: paymentSettings.accountancy.monthlyUsSalesTaxFee,
		},
		assumptions: {
			chargebackRate: paymentSettings.assumptions.chargebackRate * 100, // Convert to percentage
			disputeRate: paymentSettings.assumptions.disputeRate * 100, // Convert to percentage
			usdToGbpRate: paymentSettings.assumptions.usdToGbpRate,
		},
	};
}

const defaultSettings: SettingsData = convertToSettingsData(DEFAULT_PAYMENT_SETTINGS);

const HardcodedSettings = React.memo(function HardcodedSettings() {
	const [settings, setSettings] = useState<SettingsData>(defaultSettings);
	const [isEditing, setIsEditing] = useState(false);
	const [tempSettings, setTempSettings] = useState<SettingsData>(defaultSettings);

	// Load settings from localStorage on component mount
	useEffect(() => {
		const savedSettings = localStorage.getItem("payment-calculator-settings");
		if (savedSettings) {
			try {
				const parsed = JSON.parse(savedSettings);
				setSettings(parsed);
				setTempSettings(parsed);
			} catch (error) {
				console.error("Failed to load settings:", error);
			}
		}
	}, []);

	const handleSave = () => {
		setSettings(tempSettings);
		localStorage.setItem("payment-calculator-settings", JSON.stringify(tempSettings));
		setIsEditing(false);
	};

	const handleCancel = () => {
		setTempSettings(settings);
		setIsEditing(false);
	};

	const handleReset = () => {
		setTempSettings(defaultSettings);
		setSettings(defaultSettings);
		localStorage.removeItem("payment-calculator-settings");
		setIsEditing(false);
	};

	const updateSetting = (section: keyof SettingsData, field: string, value: number) => {
		setTempSettings((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const NumberInput = ({
		label,
		value,
		onChange,
		suffix,
		step = 0.01,
		min = 0,
	}: {
		label: string;
		value: number;
		onChange: (value: number) => void;
		suffix?: string;
		step?: number;
		min?: number;
	}) => (
		<div className="flex justify-between items-center">
			<Label className="text-gray-600 text-sm">{label}:</Label>
			<div className="flex items-center space-x-1">
				{isEditing ? (
					<Input
						type="number"
						value={value}
						onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
						step={step}
						min={min}
						className="w-20 h-7 text-sm text-right"
					/>
				) : (
					<span className="font-medium text-sm">{value.toFixed(step === 1 ? 0 : 2)}</span>
				)}
				{suffix && <span className="text-sm text-gray-500">{suffix}</span>}
			</div>
		</div>
	);

	return (
		<Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
			<CardHeader className="pb-4">
				<div className="flex justify-between items-start">
					<div>
						<CardTitle className="text-xl font-semibold text-gray-900">
							{isEditing ? "Edit Settings" : "Hardcoded Settings"}
						</CardTitle>
						<CardDescription className="text-gray-600">
							{isEditing
								? "Modify rates and fees used in calculations"
								: "Fixed rates and fees used in calculations"}
						</CardDescription>
					</div>
					<div className="flex space-x-2">
						{isEditing ? (
							<>
								<button
									onClick={handleSave}
									className="flex items-center px-3 py-1 h-8 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
								>
									<Check className="w-4 h-4 mr-1" />
									Save
								</button>
								<button
									onClick={handleCancel}
									className="flex items-center px-3 py-1 h-8 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
								>
									<X className="w-4 h-4 mr-1" />
									Cancel
								</button>
							</>
						) : (
							<button
								onClick={() => setIsEditing(true)}
								className="flex items-center px-3 py-1 h-8 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
							>
								<Edit2 className="w-4 h-4 mr-1" />
								Edit
							</button>
						)}
						<button
							onClick={handleReset}
							className="flex items-center px-3 py-1 h-8 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
						>
							<RotateCcw className="w-4 h-4 mr-1" />
							Reset
						</button>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Stripe Rates Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-blue-100">
						<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-blue-900">Stripe Rates (UK)</h3>
					</div>
					<div className="space-y-3">
						<NumberInput
							label="UK Domestic Cards"
							value={tempSettings.stripe.ukDomesticRate}
							onChange={(value) => updateSetting("stripe", "ukDomesticRate", value)}
							suffix="% + £0.20"
						/>
						<NumberInput
							label="European Cards"
							value={tempSettings.stripe.europeanRate}
							onChange={(value) => updateSetting("stripe", "europeanRate", value)}
							suffix="% + £0.20"
						/>
						<NumberInput
							label="Non-European Cards"
							value={tempSettings.stripe.nonEuropeanRate}
							onChange={(value) => updateSetting("stripe", "nonEuropeanRate", value)}
							suffix="% + £0.20"
						/>
						<NumberInput
							label="Subscription Surcharge"
							value={tempSettings.stripe.subscriptionSurcharge}
							onChange={(value) => updateSetting("stripe", "subscriptionSurcharge", value)}
							suffix="%"
						/>
						<NumberInput
							label="Stripe Tax Fee"
							value={tempSettings.stripe.taxFee}
							onChange={(value) => updateSetting("stripe", "taxFee", value)}
							suffix="%"
						/>
						<NumberInput
							label="Chargeback Fee"
							value={tempSettings.stripe.chargebackFee}
							onChange={(value) => updateSetting("stripe", "chargebackFee", value)}
							suffix="£"
						/>
						<NumberInput
							label="Dispute Fee"
							value={tempSettings.stripe.disputeFee}
							onChange={(value) => updateSetting("stripe", "disputeFee", value)}
							suffix="£"
						/>
					</div>
				</div>

				{/* MoR Rates Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-green-100">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-green-900">MoR Rates (USD)</h3>
					</div>
					<div className="space-y-3">
						<NumberInput
							label="Platform Fee"
							value={tempSettings.mor.platformRate}
							onChange={(value) => updateSetting("mor", "platformRate", value)}
							suffix="% + $0.50"
						/>
						<NumberInput
							label="International Fee"
							value={tempSettings.mor.internationalFee}
							onChange={(value) => updateSetting("mor", "internationalFee", value)}
							suffix="%"
						/>
						<NumberInput
							label="Subscription Surcharge"
							value={tempSettings.mor.subscriptionSurcharge}
							onChange={(value) => updateSetting("mor", "subscriptionSurcharge", value)}
							suffix="%"
						/>
						<NumberInput
							label="Payout Fee"
							value={tempSettings.mor.payoutFee}
							onChange={(value) => updateSetting("mor", "payoutFee", value)}
							suffix="%"
						/>
					</div>
				</div>

				{/* Accountancy Fees Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-orange-100">
						<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-orange-900">Accountancy Fees</h3>
					</div>
					<div className="space-y-3">
						<NumberInput
							label="Base Annual Fee"
							value={tempSettings.accountancy.baseAnnualFee}
							onChange={(value) => updateSetting("accountancy", "baseAnnualFee", value)}
							suffix="£"
							step={1}
						/>
						<NumberInput
							label="EU VAT (monthly)"
							value={tempSettings.accountancy.euVatMonthly}
							onChange={(value) => updateSetting("accountancy", "euVatMonthly", value)}
							suffix="£"
							step={1}
						/>
						<NumberInput
							label="UK VAT (monthly)"
							value={tempSettings.accountancy.ukVatMonthly}
							onChange={(value) => updateSetting("accountancy", "ukVatMonthly", value)}
							suffix="£"
							step={1}
						/>
						<NumberInput
							label="US Sales Tax/state"
							value={tempSettings.accountancy.usSalesTaxPerState}
							onChange={(value) => updateSetting("accountancy", "usSalesTaxPerState", value)}
							suffix="£"
							step={1}
						/>
					</div>
				</div>

				{/* Assumptions Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-purple-100">
						<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-purple-900">Assumptions</h3>
					</div>
					<div className="space-y-3">
						<NumberInput
							label="Chargeback Rate"
							value={tempSettings.assumptions.chargebackRate}
							onChange={(value) => updateSetting("assumptions", "chargebackRate", value)}
							suffix="%"
						/>
						<NumberInput
							label="Dispute Rate"
							value={tempSettings.assumptions.disputeRate}
							onChange={(value) => updateSetting("assumptions", "disputeRate", value)}
							suffix="%"
						/>
						<NumberInput
							label="USD to GBP Rate"
							value={tempSettings.assumptions.usdToGbpRate}
							onChange={(value) => updateSetting("assumptions", "usdToGbpRate", value)}
						/>
					</div>
				</div>
			</CardContent>
		</Card>
	);
});

export default HardcodedSettings;
