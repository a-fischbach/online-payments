import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatTurnover } from "@/utils/formatters";

interface ChartDataPoint {
	turnover: number;
	stripeCost: number;
	morCost: number;
}

interface CostComparisonChartProps {
	chartData: ChartDataPoint[];
}

export default function CostComparisonChart({ chartData }: CostComparisonChartProps) {
	return (
		<Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
			<CardHeader className="pb-6">
				<CardTitle className="text-2xl font-semibold text-gray-900">Monthly Costs vs Turnover</CardTitle>
				<CardDescription className="text-gray-600 text-base">
					Compare total monthly costs between Stripe and Merchant of Record solutions. All costs converted to
					GBP for accurate comparison.
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-6">
				<div className="h-96 w-full">
					<ResponsiveContainer width="100%" height="100%">
						<LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
							<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
							<XAxis
								dataKey="turnover"
								tickFormatter={formatTurnover}
								tick={{ fontSize: 12, fill: "#64748b" }}
							/>
							<YAxis
								tickFormatter={formatCurrency}
								domain={["dataMin", "dataMax"]}
								tick={{ fontSize: 12, fill: "#64748b" }}
							/>
							<Tooltip
								formatter={(value: number) => [formatCurrency(value), ""]}
								labelFormatter={(value: number) => `Monthly Turnover: ${formatTurnover(value)}`}
								contentStyle={{
									backgroundColor: "white",
									border: "1px solid #e2e8f0",
									borderRadius: "8px",
									boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
								}}
							/>
							<Line
								type="monotone"
								dataKey="stripeCost"
								stroke="#3b82f6"
								strokeWidth={3}
								name="Stripe Total Cost"
								dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
							/>
							<Line
								type="monotone"
								dataKey="morCost"
								stroke="#10b981"
								strokeWidth={3}
								name="Merchant of Record Cost"
								dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
							/>
						</LineChart>
					</ResponsiveContainer>
				</div>
			</CardContent>
		</Card>
	);
}
