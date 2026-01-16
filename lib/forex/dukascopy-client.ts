// Asset category types
export type AssetCategory = 'forex' | 'crypto' | 'stock' | 'etf' | 'index' | 'commodity' | 'bond'

// Instrument definition
export interface Instrument {
  symbol: string
  name: string
  category: AssetCategory
  base?: string
  quote?: string
}

// Placeholder instrument lists
export const FOREX_INSTRUMENTS: Instrument[] = []
export const CRYPTO_INSTRUMENTS: Instrument[] = []
export const STOCK_INSTRUMENTS: Instrument[] = []
export const ETF_INSTRUMENTS: Instrument[] = []
export const INDEX_INSTRUMENTS: Instrument[] = []
export const COMMODITY_INSTRUMENTS: Instrument[] = []
export const BOND_INSTRUMENTS: Instrument[] = []

export const ALL_INSTRUMENTS: Instrument[] = [
  ...FOREX_INSTRUMENTS,
  ...CRYPTO_INSTRUMENTS,
  ...STOCK_INSTRUMENTS,
  ...ETF_INSTRUMENTS,
  ...INDEX_INSTRUMENTS,
  ...COMMODITY_INSTRUMENTS,
  ...BOND_INSTRUMENTS,
]

/**
 * Get instruments by category
 */
export function getInstrumentsByCategory(category: AssetCategory): Instrument[] {
  switch (category) {
    case 'forex':
      return FOREX_INSTRUMENTS
    case 'crypto':
      return CRYPTO_INSTRUMENTS
    case 'stock':
      return STOCK_INSTRUMENTS
    case 'etf':
      return ETF_INSTRUMENTS
    case 'index':
      return INDEX_INSTRUMENTS
    case 'commodity':
      return COMMODITY_INSTRUMENTS
    case 'bond':
      return BOND_INSTRUMENTS
    default:
      return []
  }
}

/**
 * Search instruments by query
 */
export function searchInstruments(query: string): Instrument[] {
  const lowerQuery = query.toLowerCase()
  return ALL_INSTRUMENTS.filter(
    (inst) =>
      inst.symbol.toLowerCase().includes(lowerQuery) ||
      inst.name.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Get instrument by symbol
 */
export function getInstrumentBySymbol(symbol: string): Instrument | undefined {
  return ALL_INSTRUMENTS.find((inst) => inst.symbol === symbol)
}

/**
 * Get historical data for an instrument
 */
export async function getHistoricalData(
  symbol: string,
  params: {
    timeframe?: string
    from?: Date
    to?: Date
  }
): Promise<any> {
  // TODO: Implement Dukascopy historical data fetching
  throw new Error('Historical data fetching not implemented yet')
}

/**
 * Get real-time data for an instrument
 */
export async function getRealTimeData(symbol: string): Promise<any> {
  // TODO: Implement Dukascopy real-time data fetching
  throw new Error('Real-time data fetching not implemented yet')
}
