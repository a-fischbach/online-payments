import React from "react";

export default function PaymentCalculatorHeader() {
	return (
		<div className="bg-white border-b border-gray-200">
			<div className="container mx-auto px-6 py-12">
				<div className="text-center max-w-4xl mx-auto space-y-4">
					<h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Payment Processor Cost Calculator
					</h1>
					<p className="text-xl text-gray-600 leading-relaxed">
						Compare Stripe vs Merchant of Record costs across different turnover levels with real-time
						analysis
					</p>
				</div>
			</div>
		</div>
	);
}
