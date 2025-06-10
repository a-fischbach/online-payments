"use client"

import React from "react"
import { useState, useMemo } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { PaymentProcessorCalculator, StripeConfig } from "@/lib/payment-calculator"

const chartConfig: ChartConfig = {
  stripeCost: {
    label: "Stripe Total Cost",
    color: "hsl(var(--chart-1))",
  },
  morCost: {
    label: "Merchant of Record Cost",
    color: "hsl(var(--chart-2))",
  },
}

export default function PaymentCalculatorPage() {
  const [config, setConfig] = useState<StripeConfig>({
    includeChargebackFee: false,
    euVatOssRequired: true,
    ukVatRequired: false,
    usSalesTaxRequired: false,
  })

  const [subscriptionPercentage, setSubscriptionPercentage] = useState(0)
  const [averageSubscriptionAmount, setAverageSubscriptionAmount] = useState(30)
  const [europeanPercentage, setEuropeanPercentage] = useState(30)
  const [usPercentage, setUsPercentage] = useState(25)

  const calculator = useMemo(() => new PaymentProcessorCalculator(), [])

  const chartData = useMemo(() => {
    return calculator.generateChartData(
      config,
      subscriptionPercentage,
      averageSubscriptionAmount,
      europeanPercentage,
      usPercentage
    )
  }, [calculator, config, subscriptionPercentage, averageSubscriptionAmount, europeanPercentage, usPercentage])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatTurnover = (value: number) => {
    if (value >= 1000000) {
      return `£${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `£${(value / 1000).toFixed(0)}K`
    }
    return formatCurrency(value)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Payment Processor Cost Calculator</h1>
        <p className="text-xl text-muted-foreground">
          Compare Stripe vs Merchant of Record costs across different turnover levels
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Adjust settings to match your business requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Transaction Distribution</h3>
              
              <div className="space-y-2">
                <Label htmlFor="europeanPercentage">EU Transactions (%)</Label>
                <Input
                  id="europeanPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={europeanPercentage}
                  onChange={(e) => setEuropeanPercentage(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usPercentage">US Transactions (%)</Label>
                <Input
                  id="usPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={usPercentage}
                  onChange={(e) => setUsPercentage(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subscriptionPercentage">Subscription Transactions (%)</Label>
                <Input
                  id="subscriptionPercentage"
                  type="number"
                  min="0"
                  max="100"
                  value={subscriptionPercentage}
                  onChange={(e) => setSubscriptionPercentage(Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="averageSubscriptionAmount">Average Subscription Amount (£)</Label>
                <Input
                  id="averageSubscriptionAmount"
                  type="number"
                  min="0"
                  value={averageSubscriptionAmount}
                  onChange={(e) => setAverageSubscriptionAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Tax & Compliance</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="euVatOssRequired"
                  checked={config.euVatOssRequired}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, euVatOssRequired: checked }))
                  }
                />
                <Label htmlFor="euVatOssRequired">EU VAT OSS Required</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ukVatRequired"
                  checked={config.ukVatRequired}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, ukVatRequired: checked }))
                  }
                />
                <Label htmlFor="ukVatRequired">UK VAT Registration</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="usSalesTaxRequired"
                  checked={config.usSalesTaxRequired}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, usSalesTaxRequired: checked }))
                  }
                />
                <Label htmlFor="usSalesTaxRequired">US Sales Tax Compliance</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeChargebackFee"
                  checked={config.includeChargebackFee}
                  onCheckedChange={(checked) =>
                    setConfig((prev) => ({ ...prev, includeChargebackFee: checked }))
                  }
                />
                <Label htmlFor="includeChargebackFee">Include Chargeback Fees</Label>
              </div>
            </div>

            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Note:</strong> Chart assumes £50 average transaction amount.</p>
              <p>UK transactions: {100 - europeanPercentage - usPercentage}%</p>
              <p>Other regions: {Math.max(0, 100 - (100 - europeanPercentage - usPercentage) - europeanPercentage - usPercentage)}%</p>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Costs vs Turnover</CardTitle>
            <CardDescription>
              Compare total monthly costs between Stripe and Merchant of Record solutions.
              All costs converted to GBP for comparison.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="turnover" 
                    tickFormatter={formatTurnover}
                    className="text-xs"
                  />
                  <YAxis 
                    tickFormatter={formatCurrency}
                    className="text-xs"
                  />
                  <ChartTooltip 
                    content={
                      <ChartTooltipContent 
                        formatter={(value, name) => {
                          return [formatCurrency(Number(value)), name === "stripeCost" ? "Stripe" : "Merchant of Record"]
                        }}
                        labelFormatter={(label) => `Turnover: ${formatTurnover(Number(label))}`}
                      />
                    } 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="stripeCost" 
                    stroke="var(--color-stripeCost)" 
                    strokeWidth={3}
                    dot={false}
                    name="Stripe Total Cost"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="morCost" 
                    stroke="var(--color-morCost)" 
                    strokeWidth={3}
                    dot={false}
                    name="Merchant of Record Cost"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">EU VAT OSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-1">
              {config.euVatOssRequired ? "Required" : "Not Required"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config.euVatOssRequired 
                ? "£200 setup + £180/month compliance" 
                : "No EU tax obligations"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">UK VAT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-2">
              {config.ukVatRequired ? "Registered" : "Not Registered"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config.ukVatRequired 
                ? "Free setup + £120/month compliance" 
                : "Below £85k threshold"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">US Sales Tax</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-3">
              {config.usSalesTaxRequired ? "Required" : "Not Required"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {config.usSalesTaxRequired 
                ? "£250 setup + £220/month compliance" 
                : "No nexus established"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Transaction Mix</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-chart-4">
              {subscriptionPercentage}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Subscription transactions (0.5% surcharge)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>
            Understanding the cost comparison between payment processors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-chart-1 mb-2">Stripe Account Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Direct control over payment processing</li>
                <li>• Lower fees for UK domestic transactions (1.5%)</li>
                <li>• Flexible integration options</li>
                <li>• Detailed analytics and reporting</li>
                <li>• Can be more cost-effective at higher volumes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-chart-2 mb-2">Merchant of Record Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• No tax compliance burden</li>
                <li>• No chargeback handling required</li>
                <li>• Simplified international expansion</li>
                <li>• Fixed percentage pricing model</li>
                <li>• Better for businesses with complex tax situations</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-semibold mb-2">💡 Decision Factors</h4>
            <p className="text-sm text-muted-foreground">
              The choice between Stripe and a Merchant of Record depends on your business size, 
              international footprint, and willingness to handle tax compliance. Generally, 
              Merchant of Record solutions provide more value for smaller businesses or those 
              with complex international tax requirements, while Stripe becomes more cost-effective 
              as transaction volumes increase and tax complexity is manageable.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}