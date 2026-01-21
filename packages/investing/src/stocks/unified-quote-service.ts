/**
 * Unified Quote Service
 * Combines yfinance, finnhub, and alpaca APIs with automatic fallback
 * Priority: cache -> yfinance -> finnhub -> alpaca
 * Caches all fetched quotes to database
 */

import { yahooFinance } from "./yahoo-finance-wrapper";
import { finnhub } from "./finnhub-wrapper";
import { getAlpacaMCPClient } from "../alpaca/alpaca-mcp-client";
import { quoteCacheService } from "./quote-cache-service";

// Normalized quote structure
export interface NormalizedQuote {
  symbol: string;
  price: number;
  change: number | null;
  changePercent: number | null;
  open: number | null;
  high: number | null;
  low: number | null;
  previousClose: number | null;
  volume: number | null;
  marketCap: number | null;
  currency: string | null;
  name: string | null;
  exchange: string | null;
  timestamp: Date;
  source: "yfinance" | "finnhub" | "alpaca";
}

// Normalized quotes structure (for batch requests)
export interface NormalizedQuotes {
  quotes: NormalizedQuote[];
  source: "yfinance" | "finnhub" | "alpaca" | "mixed";
  timestamp: Date;
}

export interface QuoteServiceResponse {
  success: boolean;
  data?: NormalizedQuote;
  error?: string;
}

export interface QuotesServiceResponse {
  success: boolean;
  data?: NormalizedQuotes;
  error?: string;
}

/**
 * Unified Quote Service Class
 */
export class UnifiedQuoteService {
  /**
   * Get a single stock quote with automatic fallback
   * Tries: cache -> yfinance -> finnhub -> alpaca
   */
  async getQuote(symbol: string): Promise<QuoteServiceResponse> {
    console.log(`[UnifiedQuote] Fetching quote for ${symbol}`);

    // Check cache first
    try {
      const cached = await quoteCacheService.getCachedQuote(symbol);
      if (cached) {
        console.log(`[UnifiedQuote] ✓ Returning cached quote for ${symbol}`);
        return { success: true, data: cached };
      }
    } catch (error: any) {
      console.log(`[UnifiedQuote] Cache check failed for ${symbol}: ${error.message}`);
    }

    // Try yfinance first
    try {
      console.log(`[UnifiedQuote] Trying yfinance for ${symbol}...`);
      const yfinanceResult = await yahooFinance.getQuote(symbol);

      if (yfinanceResult.success && yfinanceResult.data) {
        const data = yfinanceResult.data as any;
        const normalized: NormalizedQuote = {
          symbol,
          price: data.regularMarketPrice || data.currentPrice || 0,
          change: data.regularMarketChange || null,
          changePercent: data.regularMarketChangePercent || null,
          open: data.regularMarketOpen || data.open || null,
          high: data.regularMarketDayHigh || data.dayHigh || null,
          low: data.regularMarketDayLow || data.dayLow || null,
          previousClose: data.regularMarketPreviousClose || data.previousClose || null,
          volume: data.volume || null,
          marketCap: data.marketCap || null,
          currency: data.currency || "USD",
          name: data.longName || data.shortName || symbol,
          exchange: data.exchange || data.fullExchangeName || null,
          timestamp: data.regularMarketTime ? new Date(data.regularMarketTime) : new Date(),
          source: "yfinance",
        };

        console.log(`[UnifiedQuote] ✓ yfinance succeeded for ${symbol}`);

        // Save to cache
        await quoteCacheService.saveQuoteToCache(normalized);

        return { success: true, data: normalized };
      }
    } catch (error: any) {
      console.log(`[UnifiedQuote] ✗ yfinance failed for ${symbol}: ${error.message}`);
    }

    // Try finnhub as fallback
    try {
      console.log(`[UnifiedQuote] Trying finnhub for ${symbol}...`);
      const finnhubResult = await finnhub.getQuote({ symbol });

      if (finnhubResult.success && finnhubResult.data) {
        const data = finnhubResult.data;
        const normalized: NormalizedQuote = {
          symbol,
          price: data.price?.regularMarketPrice || 0,
          change: data.price?.regularMarketChange || null,
          changePercent: data.price?.regularMarketChangePercent || null,
          open: data.summaryDetail?.open || null,
          high: data.summaryDetail?.dayHigh || null,
          low: data.summaryDetail?.dayLow || null,
          previousClose: data.summaryDetail?.previousClose || null,
          volume: data.summaryDetail?.regularMarketVolume || null,
          marketCap: data.price?.marketCap || null,
          currency: data.price?.currency || "USD",
          name: data.price?.longName || data.price?.shortName || symbol,
          exchange: data.price?.exchange || null,
          timestamp: data.price?.regularMarketTime || new Date(),
          source: "finnhub",
        };

        console.log(`[UnifiedQuote] ✓ finnhub succeeded for ${symbol}`);

        // Save to cache
        await quoteCacheService.saveQuoteToCache(normalized);

        return { success: true, data: normalized };
      }
    } catch (error: any) {
      console.log(`[UnifiedQuote] ✗ finnhub failed for ${symbol}: ${error.message}`);
    }

    // Try alpaca as final fallback
    try {
      console.log(`[UnifiedQuote] Trying alpaca for ${symbol}...`);
      const alpacaClient = getAlpacaMCPClient();
      const alpacaResult = await alpacaClient.getQuote(symbol);

      if (alpacaResult) {
        // Alpaca returns quote data directly
        const quote = alpacaResult as any;
        const normalized: NormalizedQuote = {
          symbol,
          price: quote.ap || quote.bp || 0, // ask price or bid price
          change: null,
          changePercent: null,
          open: null,
          high: null,
          low: null,
          previousClose: null,
          volume: quote.as || quote.bs || null, // ask size or bid size
          marketCap: null,
          currency: "USD",
          name: symbol,
          exchange: quote.x || null,
          timestamp: quote.t ? new Date(quote.t) : new Date(),
          source: "alpaca",
        };

        console.log(`[UnifiedQuote] ✓ alpaca succeeded for ${symbol}`);

        // Save to cache
        await quoteCacheService.saveQuoteToCache(normalized);

        return { success: true, data: normalized };
      }
    } catch (error: any) {
      console.log(`[UnifiedQuote] ✗ alpaca failed for ${symbol}: ${error.message}`);
    }

    console.error(`[UnifiedQuote] All sources failed for ${symbol}`);
    return {
      success: false,
      error: `Failed to fetch quote for ${symbol} from all sources (yfinance, finnhub, alpaca)`,
    };
  }

  /**
   * Get multiple stock quotes with automatic fallback
   * Tries: cache -> yfinance (batch) -> individual fallback for failed symbols
   */
  async getQuotes(symbols: string[]): Promise<QuotesServiceResponse> {
    console.log(`[UnifiedQuotes] Fetching quotes for ${symbols.length} symbols`);

    if (symbols.length === 0) {
      return {
        success: false,
        error: "No symbols provided",
      };
    }

    // Check cache for all symbols first
    const cachedQuotes: NormalizedQuote[] = [];
    const uncachedSymbols: string[] = [];

    try {
      for (const symbol of symbols) {
        const cached = await quoteCacheService.getCachedQuote(symbol);
        if (cached) {
          cachedQuotes.push(cached);
        } else {
          uncachedSymbols.push(symbol);
        }
      }

      console.log(
        `[UnifiedQuotes] Found ${cachedQuotes.length}/${symbols.length} quotes in cache`
      );

      // If all quotes are cached, return them
      if (uncachedSymbols.length === 0) {
        return {
          success: true,
          data: {
            quotes: cachedQuotes,
            source: "yfinance", // Use yfinance as default source
            timestamp: new Date(),
          },
        };
      }
    } catch (error: any) {
      console.log(`[UnifiedQuotes] Cache check failed: ${error.message}`);
    }

    // Try yfinance batch request for uncached symbols
    const symbolsToFetch = uncachedSymbols.length > 0 ? uncachedSymbols : symbols;
    try {
      console.log(`[UnifiedQuotes] Trying yfinance batch for ${symbolsToFetch.length} symbols...`);
      const yfinanceResult = await yahooFinance.getQuotes(symbolsToFetch);

      if (yfinanceResult.success && yfinanceResult.data) {
        const quotes: NormalizedQuote[] = [...cachedQuotes]; // Include cached quotes
        const failedSymbols: string[] = [];

        // Process yfinance results
        for (let i = 0; i < symbolsToFetch.length; i++) {
          const symbol = symbolsToFetch[i];
          const data = yfinanceResult.data[i] as any;

          if (data && data.regularMarketPrice) {
            const normalizedQuote = {
              symbol,
              price: data.regularMarketPrice || data.currentPrice || 0,
              change: data.regularMarketChange || null,
              changePercent: data.regularMarketChangePercent || null,
              open: data.regularMarketOpen || data.open || null,
              high: data.regularMarketDayHigh || data.dayHigh || null,
              low: data.regularMarketDayLow || data.dayLow || null,
              previousClose: data.regularMarketPreviousClose || data.previousClose || null,
              volume: data.volume || null,
              marketCap: data.marketCap || null,
              currency: data.currency || "USD",
              name: data.longName || data.shortName || symbol,
              exchange: data.exchange || data.fullExchangeName || null,
              timestamp: data.regularMarketTime ? new Date(data.regularMarketTime) : new Date(),
              source: "yfinance" as const,
            };
            quotes.push(normalizedQuote);

            // Save to cache
            await quoteCacheService.saveQuoteToCache(normalizedQuote);
          } else {
            failedSymbols.push(symbol);
          }
        }

        console.log(
          `[UnifiedQuotes] yfinance succeeded for ${quotes.length - cachedQuotes.length}/${symbolsToFetch.length} new symbols (${cachedQuotes.length} from cache)`
        );

        // Try fallback for failed symbols
        if (failedSymbols.length > 0) {
          console.log(
            `[UnifiedQuotes] Trying fallback for ${failedSymbols.length} failed symbols...`
          );
          for (const symbol of failedSymbols) {
            const fallbackResult = await this.getQuote(symbol);
            if (fallbackResult.success && fallbackResult.data) {
              quotes.push(fallbackResult.data);
            }
          }
        }

        if (quotes.length > 0) {
          return {
            success: true,
            data: {
              quotes,
              source: failedSymbols.length > 0 ? "mixed" : "yfinance",
              timestamp: new Date(),
            },
          };
        }
      }
    } catch (error: any) {
      console.log(`[UnifiedQuotes] ✗ yfinance batch failed: ${error.message}`);
    }

    // Fallback: try each symbol individually
    console.log(`[UnifiedQuotes] Falling back to individual quote requests...`);
    const quotes: NormalizedQuote[] = [];

    for (const symbol of symbols) {
      const result = await this.getQuote(symbol);
      if (result.success && result.data) {
        quotes.push(result.data);
      }
    }

    if (quotes.length > 0) {
      return {
        success: true,
        data: {
          quotes,
          source: "mixed",
          timestamp: new Date(),
        },
      };
    }

    console.error(`[UnifiedQuotes] Failed to fetch any quotes`);
    return {
      success: false,
      error: `Failed to fetch quotes for any of the ${symbols.length} symbols`,
    };
  }

  /**
   * Get quote with explicit source preference
   */
  async getQuoteFromSource(
    symbol: string,
    source: "yfinance" | "finnhub" | "alpaca"
  ): Promise<QuoteServiceResponse> {
    console.log(`[UnifiedQuote] Fetching quote for ${symbol} from ${source}`);

    try {
      if (source === "yfinance") {
        const result = await yahooFinance.getQuote(symbol);
        if (result.success && result.data) {
          const data = result.data as any;
          return {
            success: true,
            data: {
              symbol,
              price: data.regularMarketPrice || data.currentPrice || 0,
              change: data.regularMarketChange || null,
              changePercent: data.regularMarketChangePercent || null,
              open: data.regularMarketOpen || data.open || null,
              high: data.regularMarketDayHigh || data.dayHigh || null,
              low: data.regularMarketDayLow || data.dayLow || null,
              previousClose: data.regularMarketPreviousClose || data.previousClose || null,
              volume: data.volume || null,
              marketCap: data.marketCap || null,
              currency: data.currency || "USD",
              name: data.longName || data.shortName || symbol,
              exchange: data.exchange || data.fullExchangeName || null,
              timestamp: data.regularMarketTime ? new Date(data.regularMarketTime) : new Date(),
              source: "yfinance",
            },
          };
        }
      } else if (source === "finnhub") {
        const result = await finnhub.getQuote({ symbol });
        if (result.success && result.data) {
          const data = result.data;
          return {
            success: true,
            data: {
              symbol,
              price: data.price?.regularMarketPrice || 0,
              change: data.price?.regularMarketChange || null,
              changePercent: data.price?.regularMarketChangePercent || null,
              open: data.summaryDetail?.open || null,
              high: data.summaryDetail?.dayHigh || null,
              low: data.summaryDetail?.dayLow || null,
              previousClose: data.summaryDetail?.previousClose || null,
              volume: data.summaryDetail?.regularMarketVolume || null,
              marketCap: data.price?.marketCap || null,
              currency: data.price?.currency || "USD",
              name: data.price?.longName || data.price?.shortName || symbol,
              exchange: data.price?.exchange || null,
              timestamp: data.price?.regularMarketTime || new Date(),
              source: "finnhub",
            },
          };
        }
      } else if (source === "alpaca") {
        const alpacaClient = getAlpacaMCPClient();
        const alpacaResult = await alpacaClient.getQuote(symbol);
        if (alpacaResult) {
          const quote = alpacaResult as any;
          return {
            success: true,
            data: {
              symbol,
              price: quote.ap || quote.bp || 0,
              change: null,
              changePercent: null,
              open: null,
              high: null,
              low: null,
              previousClose: null,
              volume: quote.as || quote.bs || null,
              marketCap: null,
              currency: "USD",
              name: symbol,
              exchange: quote.x || null,
              timestamp: quote.t ? new Date(quote.t) : new Date(),
              source: "alpaca",
            },
          };
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: `Failed to fetch quote from ${source}: ${error.message}`,
      };
    }

    return {
      success: false,
      error: `No data returned from ${source}`,
    };
  }
}

// Export singleton instance
export const unifiedQuoteService = new UnifiedQuoteService();

// Export convenience functions
export async function getQuote(symbol: string): Promise<QuoteServiceResponse> {
  return unifiedQuoteService.getQuote(symbol);
}

export async function getQuotes(symbols: string[]): Promise<QuotesServiceResponse> {
  return unifiedQuoteService.getQuotes(symbols);
}

export async function getQuoteFromSource(
  symbol: string,
  source: "yfinance" | "finnhub" | "alpaca"
): Promise<QuoteServiceResponse> {
  return unifiedQuoteService.getQuoteFromSource(symbol, source);
}

export default unifiedQuoteService;
