# Stock Quote Service Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Stock Banner UI                             │
│  Displays: Price | Daily Change | Monthly Change | Volume        │
│  Updates: Every 10 seconds                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP GET /api/stocks/quotes
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  API Route Handler                               │
│  /app/api/stocks/quotes/route.ts                                │
│                                                                   │
│  1. Parse symbols from query params                              │
│  2. Call Unified Quote Service                                   │
│  3. Fetch 30-day historical for monthly change                   │
│  4. Enrich and return data                                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ getQuotes(symbols)
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│              Unified Quote Service                               │
│  /packages/investing/src/stocks/unified-quote-service.ts        │
│                                                                   │
│  Automatic Fallback Logic:                                       │
│  ┌─────────────────────────────────────────────────┐            │
│  │ 1. Try yfinance (Yahoo Finance)                 │            │
│  │    ├─ Success? → Return normalized data         │            │
│  │    └─ Fail → Try next source                    │            │
│  │                                                  │            │
│  │ 2. Try finnhub (Finnhub API)                    │            │
│  │    ├─ Success? → Return normalized data         │            │
│  │    └─ Fail → Try next source                    │            │
│  │                                                  │            │
│  │ 3. Try alpaca (Alpaca Markets)                  │            │
│  │    ├─ Success? → Return normalized data         │            │
│  │    └─ Fail → Return error                       │            │
│  └─────────────────────────────────────────────────┘            │
└───────┬───────────────┬───────────────┬─────────────────────────┘
        │               │               │
        ↓               ↓               ↓
┌───────────────┐ ┌─────────────┐ ┌──────────────┐
│  yfinance     │ │  finnhub    │ │   alpaca     │
│  Wrapper      │ │  Wrapper    │ │   MCP Client │
├───────────────┤ ├─────────────┤ ├──────────────┤
│ • Free        │ │ • API key   │ │ • API key +  │
│ • No auth     │ │ • Optional  │ │   secret     │
│ • Primary     │ │ • Fallback  │ │ • Last resort│
└───────────────┘ └─────────────┘ └──────────────┘
        │               │               │
        ↓               ↓               ↓
┌─────────────────────────────────────────────┐
│         External Data Sources               │
│                                             │
│  • Yahoo Finance API                        │
│  • Finnhub Stock API                        │
│  • Alpaca Markets Data API                  │
└─────────────────────────────────────────────┘
```

## Data Flow

### 1. Quote Request
```typescript
// User requests quotes for multiple symbols
GET /api/stocks/quotes?symbols=AAPL,MSFT,GOOGL,TSLA
```

### 2. Unified Service Processing
```typescript
// For each symbol, try sources in order:
for (const symbol of symbols) {
  try yfinance
    ↓ (if fail)
  try finnhub
    ↓ (if fail)
  try alpaca
    ↓ (if fail)
  return error
}
```

### 3. Data Normalization
All sources return a consistent format:
```typescript
{
  symbol: "AAPL",
  price: 182.45,
  change: 2.34,
  changePercent: 1.30,
  open: 180.10,
  high: 184.20,
  low: 180.10,
  previousClose: 180.11,
  volume: 52300000,
  marketCap: 2850000000000,
  name: "Apple Inc.",
  exchange: "NASDAQ",
  timestamp: "2026-01-21T10:30:00Z",
  source: "yfinance" // Which source provided this data
}
```

### 4. Monthly Change Calculation
```typescript
// Fetch 30-day historical data
const thirtyDaysAgo = new Date() - 30 days
const historical = await getHistorical(symbol, thirtyDaysAgo, now)

// Calculate change
const oldPrice = historical[0].close
const newPrice = historical[last].close
const change = newPrice - oldPrice
const changePercent = (change / oldPrice) * 100
```

### 5. Response
```json
{
  "success": true,
  "data": [
    {
      "symbol": "AAPL",
      "price": 182.45,
      "regularMarketChange": 2.34,
      "regularMarketChangePercent": 1.30,
      "monthlyChange": 8.92,
      "monthlyChangePercent": 5.14,
      "source": "yfinance",
      ...
    }
  ],
  "sources": "mixed" // or "yfinance" if all from same source
}
```

## Fallback Strategy

### Why Multiple Sources?

1. **Reliability:** If one API is down, others can serve data
2. **Rate Limits:** Distribute load across multiple services
3. **Cost:** Start with free yfinance, only use paid APIs if needed
4. **Data Quality:** Different sources have different strengths

### Source Priority

| Source   | Pros                          | Cons                      | Priority |
|----------|-------------------------------|---------------------------|----------|
| yfinance | Free, comprehensive           | Occasional rate limits    | 1st      |
| finnhub  | Real-time, reliable           | Requires API key          | 2nd      |
| alpaca   | Trading-grade, authoritative  | Requires credentials      | 3rd      |

## Performance Optimization

### Batch Processing
```typescript
// Instead of individual requests:
for (symbol of symbols) {
  await getQuote(symbol) // ❌ Slow
}

// Use batch request:
await getQuotes(symbols) // ✅ Fast
```

### Caching Strategy
- Banner updates every 10 seconds (configurable)
- API caches quotes for 5 seconds
- Historical data cached for 1 hour

### Error Handling
```typescript
try {
  return await yfinance.getQuote(symbol)
} catch (error) {
  console.log("yfinance failed, trying finnhub...")
  try {
    return await finnhub.getQuote(symbol)
  } catch (error) {
    console.log("finnhub failed, trying alpaca...")
    return await alpaca.getQuote(symbol)
  }
}
```

## Configuration

### Environment Variables
```bash
# Optional - Finnhub API
FINNHUB_API_KEY=your_key_here

# Required for Alpaca fallback
ALPACA_API_KEY=your_key_here
ALPACA_SECRET=your_secret_here
```

### Customization
```typescript
// Use specific source
const quote = await getQuoteFromSource("AAPL", "finnhub")

// Batch request with custom options
const quotes = await getQuotes(symbols, {
  preferredSource: "yfinance",
  timeout: 5000
})
```

## Monitoring

### Success Metrics
- Which source provided data (shown in banner tooltip)
- Response times per source
- Fallback frequency

### Error Tracking
- Failed requests logged to console
- Error messages shown in UI if all sources fail
- Graceful degradation (show stale data if available)

## Extension Points

### Adding New Sources
1. Create wrapper in `packages/investing/src/stocks/`
2. Add to unified service fallback chain
3. Update types and normalization logic

### Custom Calculations
Monthly change calculation can be extended to:
- Quarterly changes
- YTD performance
- 52-week high/low percentile
- Moving averages

## Testing

```bash
# Test unified service
tsx packages/investing/src/stocks/test-unified-quotes.ts

# Test specific source
tsx packages/investing/src/stocks/unified-quote-example.ts
```

## Troubleshooting

### All Sources Failing
1. Check internet connection
2. Verify API credentials
3. Check rate limits
4. Review error logs

### Slow Performance
1. Reduce update frequency
2. Limit number of symbols
3. Enable caching
4. Use batch requests

### Incorrect Data
1. Check which source provided data (tooltip)
2. Compare across sources
3. Verify symbol format
4. Check market hours
