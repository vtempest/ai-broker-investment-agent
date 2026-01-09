// Yahoo Finance Wrapper - Now uses Finnhub API
// This file re-exports from finnhub-wrapper for backward compatibility
import { FinnhubWrapper, finnhub, HistoricalDataOptions, QuoteOptions } from './finnhub-wrapper';

// Re-export types
export type { HistoricalDataOptions, QuoteOptions };

// Create a compatibility wrapper with Yahoo Finance-like interface
export class YFinanceWrapper {
  private finnhub: FinnhubWrapper;

  constructor() {
    this.finnhub = new FinnhubWrapper();
  }

  /**
   * Get historical price data for a symbol
   */
  async getHistoricalData(options: HistoricalDataOptions) {
    return this.finnhub.getHistoricalData(options);
  }

  /**
   * Get quote summary for a symbol
   */
  async getQuote(options: QuoteOptions) {
    return this.finnhub.getQuote(options);
  }

  /**
   * Search for stocks by query
   */
  async search(query: string) {
    return this.finnhub.search(query);
  }

  /**
   * Get options data for a symbol (not supported by Finnhub free tier)
   */
  async getOptions(symbol: string, date?: Date) {
    return {
      success: false,
      error: 'Options data not available via Finnhub API'
    };
  }

  /**
   * Get trending stocks (not directly supported by Finnhub)
   */
  async getTrending(region: string = 'US') {
    return {
      success: false,
      error: 'Trending stocks not available via Finnhub API'
    };
  }

  /**
   * Get recommendations for a symbol
   */
  async getRecommendations(symbol: string) {
    return this.finnhub.getRecommendations(symbol);
  }

  /**
   * Get financial statements for a symbol
   */
  async getFinancials(symbol: string) {
    return this.finnhub.getFinancials(symbol);
  }
}

// Export singleton instance
export const yfinance = new YFinanceWrapper();
