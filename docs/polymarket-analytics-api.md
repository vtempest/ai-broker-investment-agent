# Polymarket Analytics API Integration

This document describes the Polymarket Analytics API integration, which provides market summary and dashboard data for Polymarket events.

## Overview

The Polymarket Analytics API offers two main endpoints for fetching detailed market analytics:

1. **Market Summary** - Volume, liquidity, and open interest data
2. **Markets Dashboard** - Charts, holder information, and historical data

## API Endpoints

### 1. Market Summary

Fetches market summary analytics including volume, liquidity, and open interest for a specific event.

#### HTTP Endpoint

```
POST /api/polymarket/market-summary
```

#### Request Body

```json
{
  "eventId": "23656"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "volume": 1234567.89,
    "liquidity": 500000.00,
    "openInterest": 300000.00,
    "volume24h": 50000.00,
    ...
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

#### TypeScript Usage

```typescript
import { fetchMarketSummary } from '@/lib/prediction/polymarket'

const summary = await fetchMarketSummary("23656")
console.log(`Volume: ${summary.volume}`)
console.log(`Liquidity: ${summary.liquidity}`)
console.log(`Open Interest: ${summary.openInterest}`)
```

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/polymarket/market-summary \
  -H "Content-Type: application/json" \
  -d '{"eventId":"23656"}'
```

### 2. Markets Dashboard

Fetches dashboard data including charts, holder information, and historical data for a specific event.

#### HTTP Endpoint

```
POST /api/polymarket/markets-dashboard
```

#### Request Body

```json
{
  "eventId": "23656"
}
```

#### Response

```json
{
  "success": true,
  "data": {
    "charts": [
      {
        "timestamp": "2024-01-10T12:00:00Z",
        "price": 0.65,
        "volume": 10000
      }
    ],
    "holders": [
      {
        "wallet": "0x123...",
        "size": 1000,
        "value": 650
      }
    ],
    ...
  },
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

#### TypeScript Usage

```typescript
import { fetchMarketsDashboard } from '@/lib/prediction/polymarket'

const dashboard = await fetchMarketsDashboard("23656")
console.log(`Holders: ${dashboard.holders?.length || 0}`)
console.log(`Chart data points: ${dashboard.charts?.length || 0}`)

if (dashboard.charts && dashboard.charts.length > 0) {
  const latest = dashboard.charts[dashboard.charts.length - 1]
  console.log(`Latest price: ${latest.price}`)
}
```

#### cURL Example

```bash
curl -X POST http://localhost:3000/api/polymarket/markets-dashboard \
  -H "Content-Type: application/json" \
  -d '{"eventId":"23656"}'
```

## TypeScript Interfaces

### MarketSummary

```typescript
interface MarketSummary {
  volume?: number
  liquidity?: number
  openInterest?: number
  volume24h?: number
  volumeTotal?: number
  holders?: number
  [key: string]: any
}
```

### DashboardData

```typescript
interface DashboardData {
  charts?: Array<{
    timestamp: string
    price: number
    volume?: number
  }>
  holders?: Array<{
    wallet: string
    size: number
    value?: number
  }>
  positions?: any[]
  trades?: any[]
  [key: string]: any
}
```

## Complete Example Workflow

### Combined Analytics Fetch

```typescript
import {
  fetchMarketSummary,
  fetchMarketsDashboard,
  searchPublic
} from '@/lib/prediction/polymarket'

async function analyzeHighVolumeMarket() {
  // Step 1: Search for high-volume markets
  const searchResult = await searchPublic({
    q: 'election',
    limit_per_type: 5,
    events_status: 'active',
    sort: 'volume24hr'
  })

  // Step 2: Get the first event
  const events = searchResult?.events || []
  if (events.length === 0) {
    throw new Error('No events found')
  }

  const eventId = events[0].id
  console.log(`Analyzing: ${events[0].title}`)

  // Step 3: Fetch analytics in parallel
  const [summary, dashboard] = await Promise.all([
    fetchMarketSummary(eventId),
    fetchMarketsDashboard(eventId)
  ])

  // Step 4: Display results
  console.log('\nMarket Summary:')
  console.log(`  Volume: $${summary.volume?.toLocaleString() || 'N/A'}`)
  console.log(`  Liquidity: $${summary.liquidity?.toLocaleString() || 'N/A'}`)
  console.log(`  Open Interest: $${summary.openInterest?.toLocaleString() || 'N/A'}`)

  console.log('\nDashboard Data:')
  console.log(`  Total Holders: ${dashboard.holders?.length || 0}`)
  console.log(`  Chart Data Points: ${dashboard.charts?.length || 0}`)

  if (dashboard.charts && dashboard.charts.length > 0) {
    const latest = dashboard.charts[dashboard.charts.length - 1]
    console.log(`  Latest Price: ${latest.price}`)
  }

  return { summary, dashboard }
}

// Execute
analyzeHighVolumeMarket()
  .then(() => console.log('✅ Analysis complete'))
  .catch(error => console.error('❌ Error:', error))
```

## Testing

Run the test script to verify the API integration:

```bash
# Test with default event ID (23656)
tsx scripts/test-polymarket-analytics.ts

# Test with custom event ID
tsx scripts/test-polymarket-analytics.ts 12345
```

## Error Handling

All API endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "timestamp": "2024-01-10T12:00:00.000Z"
}
```

Common error codes:
- `400` - Missing or invalid `eventId` parameter
- `500` - API fetch failed or server error

## Function Reference

### Core Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `fetchMarketSummary` | Fetch market summary analytics | `eventId: string` | `Promise<MarketSummary>` |
| `fetchMarketsDashboard` | Fetch dashboard data | `eventId: string` | `Promise<DashboardData>` |
| `getMarketSummary` | Typed wrapper for market summary | `eventId: string` | `Promise<MarketSummary>` |
| `getMarketsDashboard` | Typed wrapper for dashboard data | `eventId: string` | `Promise<DashboardData>` |

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/polymarket/market-summary` | POST | Fetch market summary |
| `/api/polymarket/markets-dashboard` | POST | Fetch markets dashboard |

## Notes

- All API calls use `POST` method with JSON body
- Browser-specific headers are omitted for server-side compatibility
- The APIs are unofficial and aggregate public Polymarket data
- No authentication is required
- Response caching is disabled (`cache: 'no-store'`)

## Related Endpoints

This integration complements existing Polymarket API endpoints:

- `/api/polymarket/search` - Search for markets
- `/api/polymarket/markets` - Get market listings
- `/api/polymarket/traders` - Get trader leaderboard
- `/api/polymarket/positions` - Get trader positions
- `/api/polymarket/debate` - Get market debate analysis

## References

- [Polymarket Analytics](https://polymarketanalytics.com)
- [Polymarket API Documentation](https://docs.polymarket.com)
- Example implementation: `packages/investing/src/prediction/polymarket-analytics-example.ts`
