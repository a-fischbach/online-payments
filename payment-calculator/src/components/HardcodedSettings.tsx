import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HardcodedSettings() {
	return (
		<Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
			<CardHeader className="pb-4">
				<CardTitle className="text-xl font-semibold text-gray-900">Hardcoded Settings</CardTitle>
				<CardDescription className="text-gray-600">Fixed rates and fees used in calculations</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Stripe Rates Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-blue-100">
						<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-blue-900">Stripe Rates (UK)</h3>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">UK Domestic Cards:</span>
							<span className="font-medium">1.5% + £0.20</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">European Cards:</span>
							<span className="font-medium">2.5% + £0.20</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Non-European Cards:</span>
							<span className="font-medium">3.25% + £0.20</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Subscription Surcharge:</span>
							<span className="font-medium">+0.5%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Stripe Tax Fee:</span>
							<span className="font-medium">0.5%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Chargeback Fee:</span>
							<span className="font-medium">£15.00</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Dispute Fee:</span>
							<span className="font-medium">£15.00</span>
						</div>
					</div>
				</div>

				{/* MoR Rates Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-green-100">
						<div className="w-3 h-3 bg-green-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-green-900">MoR Rates (USD)</h3>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">Platform Fee:</span>
							<span className="font-medium">5.0% + $0.50</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">International Fee:</span>
							<span className="font-medium">1.5%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Subscription Surcharge:</span>
							<span className="font-medium">+0.5%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Payout Fee:</span>
							<span className="font-medium">1.0%</span>
						</div>
					</div>
				</div>

				{/* Accountancy Fees Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-orange-100">
						<div className="w-3 h-3 bg-orange-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-orange-900">Accountancy Fees</h3>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">Base Annual Fee:</span>
							<span className="font-medium">£500</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">EU VAT (monthly):</span>
							<span className="font-medium">£200</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">UK VAT (monthly):</span>
							<span className="font-medium">£120</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">US Sales Tax/state:</span>
							<span className="font-medium">£160</span>
						</div>
					</div>
				</div>

				{/* Assumptions Section */}
				<div className="space-y-4">
					<div className="flex items-center space-x-2 pb-2 border-b border-purple-100">
						<div className="w-3 h-3 bg-purple-500 rounded-full"></div>
						<h3 className="text-lg font-semibold text-purple-900">Assumptions</h3>
					</div>
					<div className="space-y-2 text-sm">
						<div className="flex justify-between">
							<span className="text-gray-600">Chargeback Rate:</span>
							<span className="font-medium">0.6%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">Dispute Rate:</span>
							<span className="font-medium">0.2%</span>
						</div>
						<div className="flex justify-between">
							<span className="text-gray-600">USD to GBP Rate:</span>
							<span className="font-medium">0.79</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
