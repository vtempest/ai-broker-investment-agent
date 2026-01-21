# Yahoo Finance API Documentation

Complete API documentation for the Yahoo Finance integration using yahoo-finance2.

## Table of Contents

1. [Installation](#installation)
2. [Wrapper API](#wrapper-api)
3. [REST API Endpoints](#rest-api-endpoints)
4. [Usage Examples](#usage-examples)
5. [Available Modules](#available-modules)
6. [Error Handling](#error-handling)

## Installation

The `yahoo-finance2` package is already installed in the project:

```json
"yahoo-finance2": "^3.11.2"
```

## Wrapper API

### Import

```typescript
import { yahooFinance } from '@/packages/investing/src/stocks/yahoo-finance-wrapper';
// or
import { yfinance } from '@/packages/investing/src/stocks/yfinance-wrapper';
```

### Methods

#### `getQuote(symbol: string, options?: any)`

Get real-time quote for a stock.

```typescript
const result = await yahooFinance.getQuote('AAPL');
// Returns: regularMarketPrice, currency, marketCap, etc.
```

#### `getQuotes(symbols: string[])`

Get multiple quotes at once.

```typescript
const result = await yahooFinance.getQuotes(['AAPL', 'MSFT', 'GOOGL']);
```

#### `getHistorical(symbol: string, options?)`

Get historical price data.

```typescript
const result = await yahooFinance.getHistorical('AAPL', {
  period1: new Date('2024-01-01'),
  period2: new Date(),
  interval: '1d' // '1d', '1wk', '1mo'
});
```

#### `getChart(symbol: string, options?)`

Get chart data with intraday support.

```typescript
const result = await yahooFinance.getChart('AAPL', {
  period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  interval: '15m' // '1m', '5m', '15m', '1h', '1d', '1wk', '1mo'
});
```

#### `getQuoteSummary(symbol: string, modules?: string[])`

Get comprehensive data with specific modules.

```typescript
const result = await yahooFinance.getQuoteSummary('AAPL', [
  'assetProfile',
  'summaryDetail',
  'financialData',
  'earnings'
]);
```

#### `search(query: string, options?)`

Search for stocks.

```typescript
const result = await yahooFinance.search('Apple', {
  quotesCount: 10,
  newsCount: 5
});
```

#### `getOptions(symbol: string, date?: Date)`

Get options data (calls and puts).

```typescript
const result = await yahooFinance.getOptions('AAPL');
// Or with specific expiration date
const result = await yahooFinance.getOptions('AAPL', new Date('2024-12-20'));
```

#### `getRecommendations(symbol: string)`

Get analyst recommendations.

```typescript
const result = await yahooFinance.getRecommendations('AAPL');
```

#### `getTrending(region?: string)`

Get trending symbols by region.

```typescript
const result = await yahooFinance.getTrending('US'); // 'US', 'GB', 'JP', etc.
```

#### `getInsights(symbol: string)`

Get company insights and recommendations.

```typescript
const result = await yahooFinance.getInsights('AAPL');
```

#### `getCompanyProfile(symbol: string)`

Get company profile information.

```typescript
const result = await yahooFinance.getCompanyProfile('AAPL');
// Returns: assetProfile, summaryProfile
```

#### `getFinancialStatements(symbol: string)`

Get financial statements.

```typescript
const result = await yahooFinance.getFinancialStatements('AAPL');
// Returns: incomeStatement, balanceSheet, cashFlow (annual & quarterly)
```

#### `getKeyStatistics(symbol: string)`

Get key statistics.

```typescript
const result = await yahooFinance.getKeyStatistics('AAPL');
// Returns: P/E ratio, market cap, beta, etc.
```

#### `getEarnings(symbol: string)`

Get earnings data.

```typescript
const result = await yahooFinance.getEarnings('AAPL');
// Returns: earnings, earningsHistory, earningsTrend, calendarEvents
```

#### `getOwnership(symbol: string)`

Get ownership data.

```typescript
const result = await yahooFinance.getOwnership('AAPL');
// Returns: institutional, fund, insider ownership
```

#### `getSECFilings(symbol: string)`

Get SEC filings.

```typescript
const result = await yahooFinance.getSECFilings('AAPL');
```

#### `getComprehensiveData(symbol: string)`

Get all available data at once.

```typescript
const result = await yahooFinance.getComprehensiveData('AAPL');
// Returns: quote, summary, historical, recommendations
```

## REST API Endpoints

All endpoints are prefixed with `/api/yahoo-finance/`

### Quote

**GET** `/api/yahoo-finance/quote/[symbol]`

Get real-time quote.

```bash
GET /api/yahoo-finance/quote/AAPL
```

### Historical Data

**GET** `/api/yahoo-finance/historical/[symbol]`

Query params:
- `period1` (ISO date string)
- `period2` (ISO date string)
- `interval` ('1d', '1wk', '1mo')

```bash
GET /api/yahoo-finance/historical/AAPL?period1=2024-01-01&interval=1d
```

### Chart Data

**GET** `/api/yahoo-finance/chart/[symbol]`

Query params:
- `period1` (ISO date string)
- `period2` (ISO date string)
- `interval` ('1m', '5m', '15m', '1h', '1d', '1wk', '1mo')

```bash
GET /api/yahoo-finance/chart/AAPL?interval=15m
```

### Quote Summary

**GET** `/api/yahoo-finance/summary/[symbol]`

Query params:
- `modules` (comma-separated list)

```bash
GET /api/yahoo-finance/summary/AAPL?modules=assetProfile,financialData,earnings
```

### Search

**GET** `/api/yahoo-finance/search`

Query params:
- `q` (required) - search query
- `quotesCount` - number of quote results
- `newsCount` - number of news results

```bash
GET /api/yahoo-finance/search?q=Apple&quotesCount=10
```

### Options

**GET** `/api/yahoo-finance/options/[symbol]`

Query params:
- `date` (ISO date string) - expiration date

```bash
GET /api/yahoo-finance/options/AAPL?date=2024-12-20
```

### Recommendations

**GET** `/api/yahoo-finance/recommendations/[symbol]`

```bash
GET /api/yahoo-finance/recommendations/AAPL
```

### Trending

**GET** `/api/yahoo-finance/trending`

Query params:
- `region` (default: 'US')

```bash
GET /api/yahoo-finance/trending?region=US
```

### Insights

**GET** `/api/yahoo-finance/insights/[symbol]`

```bash
GET /api/yahoo-finance/insights/AAPL
```

### Financial Statements

**GET** `/api/yahoo-finance/financials/[symbol]`

```bash
GET /api/yahoo-finance/financials/AAPL
```

### Comprehensive Data

**GET** `/api/yahoo-finance/comprehensive/[symbol]`

Get all data in one request.

```bash
GET /api/yahoo-finance/comprehensive/AAPL
```

## Usage Examples

### React Hook Example

```typescript
'use client';

import { useEffect, useState } from 'react';

export function useStockQuote(symbol: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/yahoo-finance/quote/${symbol}`)
      .then(res => res.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [symbol]);

  return { data, loading, error };
}
```

### Server Component Example

```typescript
import { yahooFinance } from '@/packages/investing/src/stocks/yahoo-finance-wrapper';

export default async function StockPage({ params }: { params: { symbol: string } }) {
  const result = await yahooFinance.getComprehensiveData(params.symbol);

  if (!result.success) {
    return <div>Error: {result.error}</div>;
  }

  return (
    <div>
      <h1>{result.data.quote.longName}</h1>
      <p>Price: ${result.data.quote.regularMarketPrice}</p>
      {/* ... */}
    </div>
  );
}
```

### API Route Example

```typescript
import { NextRequest, NextResponse } from "next/server";
import { yahooFinance } from "@/packages/investing/src/stocks/yahoo-finance-wrapper";

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol required' }, { status: 400 });
  }

  const result = await yahooFinance.getQuote(symbol);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json(result.data);
}
```

## Available Modules

For `quoteSummary`, you can request specific modules:

### Company Information
- `assetProfile` - Company description, officers, address
- `summaryProfile` - Brief company summary
- `quoteType` - Security type information

### Financials
- `incomeStatementHistory` - Annual income statements
- `incomeStatementHistoryQuarterly` - Quarterly income statements
- `balanceSheetHistory` - Annual balance sheets
- `balanceSheetHistoryQuarterly` - Quarterly balance sheets
- `cashflowStatementHistory` - Annual cash flow statements
- `cashflowStatementHistoryQuarterly` - Quarterly cash flow statements
- `financialData` - Key financial metrics

### Valuation & Statistics
- `defaultKeyStatistics` - P/E, beta, market cap, etc.
- `summaryDetail` - Price, volume, market cap summary
- `price` - Current price information

### Earnings & Estimates
- `earnings` - Earnings data and charts
- `earningsHistory` - Historical earnings
- `earningsTrend` - Earnings estimates and trends
- `calendarEvents` - Upcoming earnings dates

### Recommendations
- `recommendationTrend` - Analyst recommendations over time
- `upgradeDowngradeHistory` - Analyst rating changes

### Ownership
- `institutionOwnership` - Institutional holders
- `fundOwnership` - Mutual fund holders
- `insiderHolders` - Insider shareholders
- `insiderTransactions` - Recent insider transactions
- `majorHoldersBreakdown` - Ownership breakdown
- `netSharePurchaseActivity` - Net insider buying/selling

### Market & Industry
- `indexTrend` - Index performance trend
- `sectorTrend` - Sector performance
- `industryTrend` - Industry trends

### Other
- `secFilings` - Recent SEC filings
- `topHoldings` - Top holdings (for ETFs/funds)
- `fundProfile` - Fund-specific information
- `fundPerformance` - Fund performance metrics

## Error Handling

All wrapper methods return a consistent response format:

```typescript
{
  success: boolean;
  data?: any;      // Present when success is true
  error?: string;  // Present when success is false
}
```

Example error handling:

```typescript
const result = await yahooFinance.getQuote('INVALID');

if (!result.success) {
  console.error('Error:', result.error);
  // Handle error (show message, use fallback data, etc.)
} else {
  console.log('Quote:', result.data);
  // Use the data
}
```

### Common Errors

- **Symbol not found**: Stock symbol doesn't exist or is delisted
- **Rate limiting**: Too many requests in a short period
- **Network errors**: Connection issues with Yahoo Finance
- **Invalid date range**: Historical data requested for invalid period

### Best Practices

1. **Always check `success` field** before using data
2. **Handle delisted stocks** - Yahoo removes all data when stocks are delisted
3. **Cache responses** when possible to reduce API calls
4. **Use error boundaries** in React components
5. **Implement retry logic** for transient errors

## Notes

- This API is **unofficial** and not endorsed by Yahoo
- No API key required
- Data is free but subject to Yahoo's terms
- Some data may have delays (typically 15 minutes for free tier)
- Historical data availability varies by symbol and exchange
- Delisted stocks lose all historical data

## Resources

- [yahoo-finance2 Documentation](https://github.com/gadicc/node-yahoo-finance2)
- [Live Demo on CodeSandbox](https://codesandbox.io/s/yahoo-finance2-demo)
- [Module Definitions](https://github.com/gadicc/node-yahoo-finance2/tree/devel/docs/modules)
