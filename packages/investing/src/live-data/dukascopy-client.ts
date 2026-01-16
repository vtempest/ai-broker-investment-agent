import { getHistoricalRates, getRealTimeRates, Config } from "dukascopy-node";

// Flexible instrument type that accepts any valid Dukascopy instrument
// Includes common instruments as suggestions but allows any string
export type InstrumentType = string;

// Asset type categories
export type AssetCategory =
  | "forex"
  | "crypto"
  | "stocks"
  | "etfs"
  | "indices"
  | "commodities"
  | "bonds";

export type TimeframeType = "tick" | "s1" | "m1" | "m5" | "m15" | "m30" | "h1" | "h4" | "d1" | "mn1";
export type FormatType = "array" | "json" | "csv";
export type PriceType = "bid" | "ask";

export interface DukascopyConfig {
  instrument: InstrumentType;
  dates: {
    from: Date | string | number;
    to?: Date | string | number;
  };
  timeframe?: TimeframeType;
  format?: FormatType;
  priceType?: PriceType;
  volumes?: boolean;
}

export interface RealTimeConfig {
  instrument: InstrumentType;
  timeframe?: TimeframeType;
  dates?: {
    from: Date | string | number;
    to?: Date | string | number;
  };
  last?: number;
  volumes?: boolean;
  format?: FormatType;
  priceType?: PriceType;
}

export interface JsonItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface JsonItemTick {
  timestamp: number;
  askPrice: number;
  bidPrice: number;
  askVolume?: number;
  bidVolume?: number;
}

/**
 * Fetch historical market data from Dukascopy
 * Supports forex, stocks, crypto, ETFs, indices, commodities, and bonds
 */
export async function getHistoricalData(config: DukascopyConfig) {
  try {
    const dukascopyConfig: Config = {
      instrument: config.instrument,
      dates: {
        from: new Date(config.dates.from),
        to: config.dates.to ? new Date(config.dates.to) : new Date(),
      },
      timeframe: config.timeframe || "d1",
      format: config.format || "json",
      priceType: config.priceType || "bid",
      volumes: config.volumes !== false,
    };

    const data = await getHistoricalRates(dukascopyConfig);
    return { success: true, data };
  } catch (error: any) {
    console.error("Dukascopy historical data error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch historical data"
    };
  }
}

/**
 * Fetch real-time market data from Dukascopy
 * Supports forex, stocks, crypto, ETFs, indices, commodities, and bonds
 */
export async function getRealTimeData(config: RealTimeConfig) {
  try {
    const data = await getRealTimeRates({
      instrument: config.instrument,
      timeframe: config.timeframe || "tick",
      format: config.format || "json",
      priceType: config.priceType || "bid",
      last: config.last || 10,
      volumes: config.volumes !== false,
      ...(config.dates && {
        dates: {
          from: new Date(config.dates.from),
          to: config.dates.to ? new Date(config.dates.to) : new Date(),
        },
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Dukascopy real-time data error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch real-time data"
    };
  }
}

/**
 * Convert Dukascopy JSON data to chart format
 */
export function convertToChartData(data: JsonItem[] | JsonItemTick[]): any[] {
  if (!data || data.length === 0) return [];

  // Check if tick data
  if ('askPrice' in data[0]) {
    // Convert tick data to OHLC using bid price
    return (data as JsonItemTick[]).map(tick => ({
      time: tick.timestamp / 1000, // Convert to seconds
      value: tick.bidPrice,
      askPrice: tick.askPrice,
      bidPrice: tick.bidPrice,
      askVolume: tick.askVolume,
      bidVolume: tick.bidVolume,
    }));
  }

  // Convert OHLC data
  return (data as JsonItem[]).map(candle => ({
    time: candle.timestamp / 1000, // Convert to seconds
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  }));
}

/**
 * Comprehensive list of supported instruments across all asset classes
 * Dukascopy supports 800+ instruments including Forex, Stocks, Crypto, ETFs, Indices, Commodities, and Bonds
 */

export interface Instrument {
  symbol: string;
  name: string;
  description: string;
  category: AssetCategory;
}

// Forex - Major pairs and crosses
export const FOREX_INSTRUMENTS: Instrument[] = [
  { symbol: "eurusd", name: "EUR/USD", description: "Euro vs US Dollar", category: "forex" },
  { symbol: "gbpusd", name: "GBP/USD", description: "British Pound vs US Dollar", category: "forex" },
  { symbol: "usdjpy", name: "USD/JPY", description: "US Dollar vs Japanese Yen", category: "forex" },
  { symbol: "audusd", name: "AUD/USD", description: "Australian Dollar vs US Dollar", category: "forex" },
  { symbol: "usdcad", name: "USD/CAD", description: "US Dollar vs Canadian Dollar", category: "forex" },
  { symbol: "usdchf", name: "USD/CHF", description: "US Dollar vs Swiss Franc", category: "forex" },
  { symbol: "nzdusd", name: "NZD/USD", description: "New Zealand Dollar vs US Dollar", category: "forex" },
  { symbol: "eurgbp", name: "EUR/GBP", description: "Euro vs British Pound", category: "forex" },
  { symbol: "eurjpy", name: "EUR/JPY", description: "Euro vs Japanese Yen", category: "forex" },
  { symbol: "gbpjpy", name: "GBP/JPY", description: "British Pound vs Japanese Yen", category: "forex" },
  { symbol: "audjpy", name: "AUD/JPY", description: "Australian Dollar vs Japanese Yen", category: "forex" },
  { symbol: "nzdjpy", name: "NZD/JPY", description: "New Zealand Dollar vs Japanese Yen", category: "forex" },
  { symbol: "euraud", name: "EUR/AUD", description: "Euro vs Australian Dollar", category: "forex" },
  { symbol: "eurchf", name: "EUR/CHF", description: "Euro vs Swiss Franc", category: "forex" },
  { symbol: "gbpaud", name: "GBP/AUD", description: "British Pound vs Australian Dollar", category: "forex" },
];

// Cryptocurrency
export const CRYPTO_INSTRUMENTS: Instrument[] = [
  { symbol: "BTCUSD", name: "BTC/USD", description: "Bitcoin vs US Dollar", category: "crypto" },
  { symbol: "ETHUSD", name: "ETH/USD", description: "Ethereum vs US Dollar", category: "crypto" },
  { symbol: "LTCUSD", name: "LTC/USD", description: "Litecoin vs US Dollar", category: "crypto" },
  { symbol: "XRPUSD", name: "XRP/USD", description: "Ripple vs US Dollar", category: "crypto" },
  { symbol: "BCHUSD", name: "BCH/USD", description: "Bitcoin Cash vs US Dollar", category: "crypto" },
  { symbol: "ADAUSD", name: "ADA/USD", description: "Cardano vs US Dollar", category: "crypto" },
  { symbol: "DOTUSD", name: "DOT/USD", description: "Polkadot vs US Dollar", category: "crypto" },
  { symbol: "LINKUSD", name: "LINK/USD", description: "Chainlink vs US Dollar", category: "crypto" },
  { symbol: "SOLUSD", name: "SOL/USD", description: "Solana vs US Dollar", category: "crypto" },
  { symbol: "MATICUSD", name: "MATIC/USD", description: "Polygon vs US Dollar", category: "crypto" },
];

// US Stocks - Major tech and blue chips
export const STOCK_INSTRUMENTS: Instrument[] = [
  { symbol: "AAPL.US/USD", name: "Apple Inc", description: "Apple Inc - Technology", category: "stocks" },
  { symbol: "MSFT.US/USD", name: "Microsoft Corp", description: "Microsoft Corporation - Technology", category: "stocks" },
  { symbol: "GOOGL.US/USD", name: "Alphabet Inc", description: "Alphabet Inc (Google) - Technology", category: "stocks" },
  { symbol: "AMZN.US/USD", name: "Amazon.com Inc", description: "Amazon.com Inc - E-commerce", category: "stocks" },
  { symbol: "TSLA.US/USD", name: "Tesla Inc", description: "Tesla Inc - Electric Vehicles", category: "stocks" },
  { symbol: "NVDA.US/USD", name: "NVIDIA Corp", description: "NVIDIA Corporation - Semiconductors", category: "stocks" },
  { symbol: "META.US/USD", name: "Meta Platforms", description: "Meta Platforms Inc (Facebook) - Social Media", category: "stocks" },
  { symbol: "NFLX.US/USD", name: "Netflix Inc", description: "Netflix Inc - Streaming", category: "stocks" },
  { symbol: "JPM.US/USD", name: "JPMorgan Chase", description: "JPMorgan Chase & Co - Banking", category: "stocks" },
  { symbol: "V.US/USD", name: "Visa Inc", description: "Visa Inc - Financial Services", category: "stocks" },
  { symbol: "JNJ.US/USD", name: "Johnson & Johnson", description: "Johnson & Johnson - Healthcare", category: "stocks" },
  { symbol: "WMT.US/USD", name: "Walmart Inc", description: "Walmart Inc - Retail", category: "stocks" },
  { symbol: "PG.US/USD", name: "Procter & Gamble", description: "Procter & Gamble - Consumer Goods", category: "stocks" },
  { symbol: "DIS.US/USD", name: "Walt Disney Co", description: "Walt Disney Company - Entertainment", category: "stocks" },
  { symbol: "BAC.US/USD", name: "Bank of America", description: "Bank of America Corp - Banking", category: "stocks" },
];

// ETFs - Popular US ETFs
export const ETF_INSTRUMENTS: Instrument[] = [
  { symbol: "SPY.US/USD", name: "SPDR S&P 500", description: "SPDR S&P 500 ETF Trust", category: "etfs" },
  { symbol: "QQQ.US/USD", name: "Invesco QQQ", description: "Invesco QQQ Trust (NASDAQ-100)", category: "etfs" },
  { symbol: "IWM.US/USD", name: "iShares Russell 2000", description: "iShares Russell 2000 ETF", category: "etfs" },
  { symbol: "VTI.US/USD", name: "Vanguard Total Stock", description: "Vanguard Total Stock Market ETF", category: "etfs" },
  { symbol: "EEM.US/USD", name: "iShares MSCI EM", description: "iShares MSCI Emerging Markets ETF", category: "etfs" },
  { symbol: "GLD.US/USD", name: "SPDR Gold Trust", description: "SPDR Gold Shares", category: "etfs" },
  { symbol: "TLT.US/USD", name: "iShares 20+ Treasury", description: "iShares 20+ Year Treasury Bond ETF", category: "etfs" },
  { symbol: "XLE.US/USD", name: "Energy Select Sector", description: "Energy Select Sector SPDR Fund", category: "etfs" },
  { symbol: "XLF.US/USD", name: "Financial Select Sector", description: "Financial Select Sector SPDR Fund", category: "etfs" },
  { symbol: "XLK.US/USD", name: "Technology Select Sector", description: "Technology Select Sector SPDR Fund", category: "etfs" },
];

// Indices - Major global indices
export const INDEX_INSTRUMENTS: Instrument[] = [
  { symbol: "US30.IDX/USD", name: "Dow Jones", description: "Dow Jones Industrial Average", category: "indices" },
  { symbol: "US500.IDX/USD", name: "S&P 500", description: "S&P 500 Index", category: "indices" },
  { symbol: "USTEC.IDX/USD", name: "NASDAQ 100", description: "NASDAQ 100 Index", category: "indices" },
  { symbol: "UK100.IDX/GBP", name: "FTSE 100", description: "Financial Times Stock Exchange 100", category: "indices" },
  { symbol: "DE40.IDX/EUR", name: "DAX", description: "German Stock Index", category: "indices" },
  { symbol: "JP225.IDX/JPY", name: "Nikkei 225", description: "Nikkei 225 Index", category: "indices" },
  { symbol: "EU50.IDX/EUR", name: "Euro Stoxx 50", description: "Euro Stoxx 50 Index", category: "indices" },
  { symbol: "HK50.IDX/HKD", name: "Hang Seng", description: "Hang Seng Index", category: "indices" },
];

// Commodities - Energy, Metals, Agriculture
export const COMMODITY_INSTRUMENTS: Instrument[] = [
  // Metals
  { symbol: "xauusd", name: "Gold", description: "Gold vs US Dollar", category: "commodities" },
  { symbol: "xagusd", name: "Silver", description: "Silver vs US Dollar", category: "commodities" },
  { symbol: "COPPER.CMD/USD", name: "Copper", description: "Copper Futures", category: "commodities" },
  { symbol: "PLATINUM.CMD/USD", name: "Platinum", description: "Platinum Futures", category: "commodities" },
  { symbol: "PALLADIUM.CMD/USD", name: "Palladium", description: "Palladium Futures", category: "commodities" },

  // Energy
  { symbol: "wtiusd", name: "WTI Crude Oil", description: "West Texas Intermediate Crude Oil", category: "commodities" },
  { symbol: "BRENT.CMD/USD", name: "Brent Crude Oil", description: "Brent Crude Oil Futures", category: "commodities" },
  { symbol: "NATGAS.CMD/USD", name: "Natural Gas", description: "Natural Gas Futures", category: "commodities" },

  // Agriculture
  { symbol: "WHEAT.CMD/USD", name: "Wheat", description: "Wheat Futures", category: "commodities" },
  { symbol: "CORN.CMD/USD", name: "Corn", description: "Corn Futures", category: "commodities" },
  { symbol: "SOYBEAN.CMD/USD", name: "Soybeans", description: "Soybean Futures", category: "commodities" },
  { symbol: "SUGAR.CMD/USD", name: "Sugar", description: "Sugar Futures", category: "commodities" },
  { symbol: "COFFEE.CMD/USD", name: "Coffee", description: "Coffee Futures", category: "commodities" },
  { symbol: "COTTON.CMD/USD", name: "Cotton", description: "Cotton Futures", category: "commodities" },
];

// Bonds - Government bonds
export const BOND_INSTRUMENTS: Instrument[] = [
  { symbol: "BUND.BND/EUR", name: "Euro Bund", description: "German 10-Year Government Bond", category: "bonds" },
  { symbol: "GILT.BND/GBP", name: "UK Long Gilt", description: "UK 10-Year Government Bond", category: "bonds" },
  { symbol: "TBOND.BND/USD", name: "US T-Bond", description: "US 10-Year Treasury Bond", category: "bonds" },
];

// Combined list of all instruments
export const ALL_INSTRUMENTS: Instrument[] = [
  ...FOREX_INSTRUMENTS,
  ...CRYPTO_INSTRUMENTS,
  ...STOCK_INSTRUMENTS,
  ...ETF_INSTRUMENTS,
  ...INDEX_INSTRUMENTS,
  ...COMMODITY_INSTRUMENTS,
  ...BOND_INSTRUMENTS,
];

/**
 * Helper functions to filter instruments by category
 */
export function getInstrumentsByCategory(category: AssetCategory): Instrument[] {
  return ALL_INSTRUMENTS.filter(inst => inst.category === category);
}

export function getInstrumentBySymbol(symbol: string): Instrument | undefined {
  return ALL_INSTRUMENTS.find(inst => inst.symbol === symbol);
}

export function searchInstruments(query: string): Instrument[] {
  const lowerQuery = query.toLowerCase();
  return ALL_INSTRUMENTS.filter(
    inst =>
      inst.symbol.toLowerCase().includes(lowerQuery) ||
      inst.name.toLowerCase().includes(lowerQuery) ||
      inst.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Legacy exports for backwards compatibility
 */
export const getForexHistoricalData = getHistoricalData;
export const getForexRealTimeData = getRealTimeData;
