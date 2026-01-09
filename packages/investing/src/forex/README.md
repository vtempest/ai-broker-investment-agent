# Live Market Data with Dukascopy

This module provides real-time and historical market data for multiple asset classes using the Dukascopy Node.js library.

## Features

- ✅ Real-time tick data for all supported instruments
- ✅ Historical OHLC data
- ✅ Support for 100+ instruments across 7 asset classes:
  - **Forex** - 15+ major and cross pairs (EUR/USD, GBP/USD, etc.)
  - **Crypto** - 10+ cryptocurrencies (BTC/USD, ETH/USD, SOL/USD, etc.)
  - **Stocks** - 15+ major US stocks (AAPL.US/USD, MSFT.US/USD, TSLA.US/USD, etc.)
  - **ETFs** - 10+ popular ETFs (SPY.US/USD, QQQ.US/USD, etc.)
  - **Indices** - 8+ global indices (US500.IDX/USD, UK100.IDX/GBP, etc.)
  - **Commodities** - 14+ commodities (Gold, Silver, Oil, Coffee, etc.)
  - **Bonds** - 3 government bonds (US T-Bond, Euro Bund, UK Gilt)
- ✅ Multiple timeframes (tick, 1s, 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1mo)
- ✅ Live chart component with auto-refresh
- ✅ TypeScript support with full type safety
- ✅ Free data source (no API key required)

## API Routes

### Get Real-Time Data

\`\`\`
GET /api/forex/realtime/[instrument]
\`\`\`

**Parameters:**
- `instrument` - Any supported instrument:
  - Forex: `eurusd`, `gbpusd`, `usdjpy`, etc.
  - Crypto: `BTCUSD`, `ETHUSD`, `SOLUSD`, etc.
  - Stocks: `AAPL.US/USD`, `MSFT.US/USD`, `TSLA.US/USD`, etc.
  - ETFs: `SPY.US/USD`, `QQQ.US/USD`, etc.
  - Indices: `US500.IDX/USD`, `UK100.IDX/GBP`, etc.
  - Commodities: `xauusd`, `xagusd`, `wtiusd`, etc.
- `timeframe` - Optional: `tick`, `s1`, `m1`, `m5`, `m15`, `m30`, `h1`, `h4`, `d1` (default: `tick`)
- `format` - Optional: `json`, `array`, `csv` (default: `json`)
- `priceType` - Optional: `bid`, `ask` (default: `bid`)
- `last` - Optional: Number of latest items to fetch (default: `10`)
- `volumes` - Optional: Include volume data (default: `true`)

**Example:**
\`\`\`bash
# Get last 100 tick prices for EUR/USD
curl http://localhost:3000/api/forex/realtime/eurusd?last=100&timeframe=tick

# Get last 50 1-minute candles for BTC/USD
curl http://localhost:3000/api/forex/realtime/BTCUSD?last=50&timeframe=m1

# Get last 100 1-hour candles for Apple stock
curl "http://localhost:3000/api/forex/realtime/AAPL.US/USD?last=100&timeframe=h1"

# Get real-time S&P 500 index data
curl "http://localhost:3000/api/forex/realtime/US500.IDX/USD?last=50&timeframe=m5"
\`\`\`

### Get Historical Data

\`\`\`
GET /api/forex/historical/[instrument]
\`\`\`

**Parameters:**
- `instrument` - Any supported instrument (same format as real-time)
- `from` - Start date (ISO string or timestamp)
- `to` - Optional: End date (default: now)
- `range` - Optional: Shorthand for date range (`1d`, `7d`, `1mo`, `1y`, etc.)
- `timeframe` - Optional: Same as real-time (default: `d1`)
- `format` - Optional: `json`, `array`, `csv` (default: `json`)
- `priceType` - Optional: `bid`, `ask` (default: `bid`)

**Example:**
\`\`\`bash
# Get 1 month of daily data for EUR/USD
curl "http://localhost:3000/api/forex/historical/eurusd?range=1mo"

# Get specific date range for Apple stock
curl "http://localhost:3000/api/forex/historical/AAPL.US/USD?from=2024-01-01&to=2024-12-31&timeframe=d1"

# Get 7 days of hourly Bitcoin data
curl "http://localhost:3000/api/forex/historical/BTCUSD?range=7d&timeframe=h1"
\`\`\`

### Get Supported Instruments

\`\`\`
GET /api/forex/instruments
\`\`\`

Returns list of all supported instruments across all asset classes.

**Query Parameters:**
- `category` - Optional: Filter by asset type (`forex`, `crypto`, `stocks`, `etfs`, `indices`, `commodities`, `bonds`)
- `search` - Optional: Search instruments by symbol, name, or description

**Examples:**
\`\`\`bash
# Get all instruments
curl http://localhost:3000/api/forex/instruments

# Get only stocks
curl http://localhost:3000/api/forex/instruments?category=stocks

# Search for "apple"
curl http://localhost:3000/api/forex/instruments?search=apple
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "total": 97,
  "data": [
    {
      "symbol": "AAPL.US/USD",
      "name": "Apple Inc",
      "description": "Apple Inc - Technology",
      "category": "stocks"
    }
  ],
  "grouped": {
    "forex": [...],
    "crypto": [...],
    "stocks": [...],
    "etfs": [...],
    "indices": [...],
    "commodities": [...],
    "bonds": [...]
  }
}
\`\`\`

## React Component Usage

### Basic Usage

\`\`\`tsx
import { ForexLiveChart } from '@/components/dashboard/forex-live-chart';

export default function TradingPage() {
  return (
    <div>
      {/* Forex */}
      <ForexLiveChart
        instrument="eurusd"
        autoRefresh={true}
        refreshInterval={5000}
      />

      {/* Stocks */}
      <ForexLiveChart
        instrument="AAPL.US/USD"
        autoRefresh={true}
        refreshInterval={5000}
      />

      {/* Crypto */}
      <ForexLiveChart
        instrument="BTCUSD"
        autoRefresh={true}
        refreshInterval={5000}
      />
    </div>
  );
}
\`\`\`

### Props

- `instrument` - Default instrument to display. Supports any valid instrument symbol (default: `"eurusd"`)
- `autoRefresh` - Enable auto-refresh (default: `true`)
- `refreshInterval` - Refresh interval in milliseconds (default: `5000`)

## Direct Library Usage

### Get Real-Time Tick Data

\`\`\`typescript
import { getForexRealTimeData } from '@/lib/forex/dukascopy-client';

const result = await getForexRealTimeData({
  instrument: 'eurusd',
  timeframe: 'tick',
  format: 'json',
  last: 100,
});

console.log(result.data);
\`\`\`

### Get Historical Data

\`\`\`typescript
import { getForexHistoricalData } from '@/lib/forex/dukascopy-client';

const result = await getForexHistoricalData({
  instrument: 'btcusd',
  dates: {
    from: new Date('2024-01-01'),
    to: new Date('2024-01-31'),
  },
  timeframe: 'h1',
  format: 'json',
});

console.log(result.data);
\`\`\`

## Supported Instruments

### Major Forex Pairs
- EUR/USD (`eurusd`)
- GBP/USD (`gbpusd`)
- USD/JPY (`usdjpy`)
- AUD/USD (`audusd`)
- USD/CAD (`usdcad`)
- USD/CHF (`usdchf`)
- NZD/USD (`nzdusd`)

### Cross Pairs
- EUR/GBP (`eurgbp`)
- EUR/JPY (`eurjpy`)
- GBP/JPY (`gbpjpy`)

### Crypto
- BTC/USD (`btcusd`)
- ETH/USD (`ethusd`)

### Commodities
- Gold (`xauusd`)
- Silver (`xagusd`)
- Crude Oil (`wtiusd`)

## Data Formats

### Tick Data (JSON)

\`\`\`typescript
{
  timestamp: 1704067200000,
  askPrice: 1.0945,
  bidPrice: 1.0943,
  askVolume: 10.5,
  bidVolume: 12.3
}
\`\`\`

### OHLC Data (JSON)

\`\`\`typescript
{
  timestamp: 1704067200000,
  open: 1.0945,
  high: 1.0950,
  low: 1.0940,
  close: 1.0948,
  volume: 123.45
}
\`\`\`

## Integration with Lightweight Charts

The data is automatically converted to the format expected by Lightweight Charts:

\`\`\`typescript
import { convertToChartData } from '@/lib/forex/dukascopy-client';

const chartData = convertToChartData(result.data);
// Ready to use with TechnicalChart component
\`\`\`

## Notes

- Dukascopy provides free forex data with no API key required
- Real-time data has a small delay (usually a few seconds)
- Historical data is available from 2003 onwards
- Tick data provides the highest granularity
- Use appropriate timeframes for different chart durations
