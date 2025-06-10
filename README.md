# Payment Processor Cost Calculator

A Next.js application that compares the costs of using Stripe vs Merchant of Record solutions for UK businesses. This interactive tool helps businesses understand the financial implications of different payment processing strategies across various turnover levels.

## Features

- **Interactive Cost Comparison**: Compare Stripe and Merchant of Record costs across different monthly turnover amounts
- **Customizable Parameters**: Adjust transaction distribution, subscription percentages, and tax compliance requirements
- **Visual Charts**: Interactive line charts showing cost curves for both payment processors
- **Tax Compliance Modeling**: Factor in EU VAT OSS, UK VAT, and US Sales Tax compliance costs
- **Real-time Updates**: Charts and calculations update instantly as you adjust parameters

## Technology Stack

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Modern React component library
- **Recharts**: Interactive charting library

## Key Calculations

### Stripe Costs Include:
- UK domestic transactions (1.5% + £0.20)
- EU transactions (2.5% + £0.20)
- US/International transactions (3.25% + £0.20)
- Subscription surcharges (0.5%)
- Stripe Tax (0.5%)
- Tax compliance costs (EU VAT OSS, UK VAT, US Sales Tax)
- Chargeback and dispute fees
- Accountant fees

### Merchant of Record Costs Include:
- Platform fees (5% + $0.50 per transaction)
- International processing fees (1.5%)
- Subscription surcharges (0.5%)
- Payout fees (1%)
- No tax compliance burden (handled by MoR)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. **Configure Transaction Distribution**: Set the percentage of transactions from EU, US, and other regions
2. **Set Subscription Parameters**: Define what percentage of transactions are subscriptions and their average amount
3. **Enable Tax Compliance**: Toggle EU VAT OSS, UK VAT, and US Sales Tax requirements based on your business needs
4. **Analyze the Chart**: The interactive chart shows how costs scale with monthly turnover from £0 to £1M
5. **Review Insights**: Read the key insights section to understand the trade-offs between each approach

## Key Insights

- **Merchant of Record** typically offers better value for smaller businesses or those with complex international tax requirements
- **Stripe** becomes more cost-effective as transaction volumes increase and tax complexity is manageable
- Tax compliance costs can significantly impact total cost of ownership
- The break-even point varies based on your specific business parameters

## Configuration Options

### Transaction Distribution
- EU Transactions (%)
- US Transactions (%)
- UK Transactions (calculated automatically)
- Subscription Transactions (%)
- Average Subscription Amount

### Tax & Compliance
- EU VAT OSS Registration (required from first EU sale)
- UK VAT Registration (optional, £85k threshold)
- US Sales Tax Compliance (optional, nexus-based)
- Chargeback Fee Inclusion

## Cost Assumptions

### Exchange Rates
- USD to GBP: 0.79 (used for MoR cost conversions)

### Average Transaction
- £50 (used for volume estimations in chart)

### Stripe UK Rates (2024)
- UK domestic: 1.5% + £0.20
- EU cards: 2.5% + £0.20
- Non-EU cards: 3.25% + £0.20
- Subscription surcharge: 0.5%
- Stripe Tax: 0.5%

### Tax Compliance Costs
- EU VAT OSS: £200 setup + £180/month
- UK VAT: Free setup + £120/month
- US Sales Tax: £250 setup + £220/month

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles with design tokens
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Main calculator page
├── components/
│   └── ui/                  # shadcn/ui components
│       ├── card.tsx
│       ├── chart.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── switch.tsx
└── lib/
    ├── payment-calculator.ts # Core calculation logic
    └── utils.ts             # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Disclaimer

This calculator provides estimates based on publicly available rate information and typical business scenarios. Actual costs may vary based on specific business circumstances, negotiations with payment processors, and changes in rates or tax regulations. Always consult with financial and tax professionals for business decisions.