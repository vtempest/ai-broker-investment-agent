import { getHistoricalRates, getRealTimeRates, Config } from "dukascopy-node";

// Flexible instrument type that accepts any valid Dukascopy instrument
// Includes common instruments as suggestions but allows any string
export type InstrumentType = string;

// Asset type categories
export type AssetCategory =
  | "forex"
  | "crypto"
  | "stocks"
  | "etf"
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
 * Dukascopy supports 1,600+ instruments including Forex, Stocks, Crypto, ETFs, Indices, Commodities, and Bonds
 */

export interface Instrument {
  symbol: string;
  name: string;
  category: AssetCategory;
}

// Import all instruments from the comprehensive JSON file
import dukascopySymbolsData from "./dukascopy-symbols.json";

// Cast the imported data to the correct type
const ALL_INSTRUMENTS_RAW = dukascopySymbolsData as Instrument[];

// Combined list of all instruments (1,607 total)
export const ALL_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS_RAW;

// Filter instruments by category for convenience
export const FOREX_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "forex");
export const CRYPTO_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "crypto");
export const STOCK_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "stocks");
export const ETF_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "etf");
export const INDEX_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "indices");
export const COMMODITY_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "commodities");
export const BOND_INSTRUMENTS: Instrument[] = ALL_INSTRUMENTS.filter(inst => inst.category === "bonds");

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
      inst.name.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Legacy exports for backwards compatibility
 */
export const getForexHistoricalData = getHistoricalData;
export const getForexRealTimeData = getRealTimeData;
