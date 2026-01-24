# High-Volume Markets Sync Guide

## Overview

A complete solution for scraping all active Polymarket prediction markets with volume above a threshold (default: $100k) and storing their historical price data in your database.

## What Was Built

### 1. API Endpoint
**Location:** `app/api/polymarket/markets/sync-high-volume/route.ts`

- POST endpoint that accepts `minVolume` and `interval` parameters
- Fetches all active markets from Polymarket
- Filters by 24-hour volume
- Saves market metadata and historical price data
- Returns detailed statistics about the sync

### 2. CLI Script
**Location:** `scripts/sync-high-volume-markets.ts`

- Convenient command-line interface for running the sync
- Accepts command-line arguments for minVolume and interval
- Provides colorful output with progress updates
- Handles errors gracefully

### 3. NPM Script
**Added to:** `package.json`

```json
"sync:high-volume-markets": "tsx scripts/sync-high-volume-markets.ts"
```

### 4. Bug Fixes
**Fixed in:** `packages/investing/src/prediction/polymarket.ts`

- Fixed `saveMarkets` function that was trying to `JSON.parse()` arrays
- Changed lines 644-645 and 665-666 from `JSON.parse()` to `JSON.stringify()`

## Quick Start

### Option 1: Using NPM Script (Easiest)

```bash
# Sync markets with volume >= $100k (default)
npm run sync:high-volume-markets

# Custom volume threshold
npm run sync:high-volume-markets 200000

# Custom volume and interval
npm run sync:high-volume-markets 150000 1d
```

### Option 2: Using API Endpoint (Programmatic)

```bash
# Using curl
curl -X POST http://localhost:3000/api/polymarket/markets/sync-high-volume \
  -H "Content-Type: application/json" \
  -d '{"minVolume": 100000, "interval": "1h"}'

# Or from your app
fetch('/api/polymarket/markets/sync-high-volume', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ minVolume: 100000, interval: '1h' })
})
```

### Option 3: Direct Script Execution

```bash
npx tsx scripts/sync-high-volume-markets.ts 100000 1h
```

## Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `minVolume` | number | 100000 | Minimum 24-hour volume in USD |
| `interval` | string | "1h" | Price history interval ("1h", "1d", "max") |

## What Gets Stored

### Database Tables Updated

1. **`polymarket_markets`** - Market metadata
   - Market ID, question, slug
   - Volume (24hr and total)
   - Outcomes, prices, token IDs
   - Tags, categories
   - Active/closed status

2. **`polymarket_price_history`** - Historical price data
   - Token ID
   - Timestamp (Unix)
   - Price (0-1 range)
   - Interval (1h, 1d, max)

## Example Output

```bash
🚀 Starting high-volume markets sync...
   Min Volume: $100,000
   Interval: 1h

✅ Sync completed successfully!

📊 Results:
   Markets synced: 127
   Price data points: 45,892
   Price history successful: 124
   Price history failed: 3
   Duration: 2m 34s

💡 Successfully synced 127 markets with volume >= $100,000.
    Saved 45,892 price data points (124 successful, 3 failed) in 2m 34s
```

## Performance Notes

- **Fetching markets:** ~5-10 seconds
- **Price history per market:** ~1-2 seconds
- **100 markets:** ~2-3 minutes total
- **500 markets:** ~10-15 minutes total

## Common Use Cases

### Daily Data Refresh
```bash
# Morning data sync
npm run sync:high-volume-markets 100000 1h
```

### Weekly Deep Dive
```bash
# Sync high-value markets with daily data
npm run sync:high-volume-markets 500000 1d
```

### Research Analysis
```bash
# Get all markets above certain threshold
npm run sync:high-volume-markets 50000 1h
```

## Automation

### Cron Job Example

```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/project && npm run sync:high-volume-markets >> /var/log/polymarket-sync.log 2>&1
```

### GitHub Actions Example

```yaml
name: Sync High-Volume Markets
on:
  schedule:
    - cron: '0 6 * * *'  # Daily at 6 AM UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run sync:high-volume-markets
```

## Troubleshooting

### Error: "GROQ_API_KEY not found"
- Make sure your `.env` file has the GROQ_API_KEY set
- The sync uses Polymarket's API, not Groq, so this shouldn't happen

### Error: "Failed to fetch markets"
- Check your internet connection
- Polymarket API might be down (check status.polymarket.com)
- Rate limiting (wait a few minutes and retry)

### Some markets fail to sync price history
- This is normal - some markets don't have token IDs yet
- Failed syncs are logged but don't stop the process
- Check the logs for specific market IDs that failed

## API Response Schema

```typescript
{
  success: boolean
  markets: number              // Count of markets synced
  pricePoints: number          // Total price data points saved
  priceHistorySuccess: number  // Successful price syncs
  priceHistoryFailed: number   // Failed price syncs
  duration: string             // e.g., "2m 34s"
  minVolume: number            // Used filter threshold
  interval: string             // Used interval
  message: string              // Summary message
  timestamp: string            // ISO 8601 timestamp
}
```

## Next Steps

1. **Query the Data:** Use the `getMarkets()` and `getPriceHistory()` functions from `polymarket.ts`
2. **Build UI:** Display markets and their price charts in your app
3. **Analytics:** Analyze trends, volumes, and price movements
4. **Alerts:** Set up notifications for significant price changes
5. **Trading:** Use the data to inform prediction market strategies

## Related Functions

```typescript
// From packages/investing/src/prediction/polymarket.ts

// Query synced markets
const markets = await getMarkets({
  limit: 100,
  sortBy: 'volume24hr'
})

// Get price history for a token
const history = await getPriceHistory(tokenId, {
  interval: '1h',
  limit: 100
})
```
