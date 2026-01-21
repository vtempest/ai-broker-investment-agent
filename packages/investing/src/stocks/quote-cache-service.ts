/**
 * Stock Quote Cache Service
 * Handles caching of stock quotes, fundamentals, and historical data
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { eq } from "drizzle-orm";
import * as schema from "../db/schema";
import type { NormalizedQuote } from "./unified-quote-service";

// Initialize database connection
const client = createClient({
  url: process.env.DATABASE_URL || "file:./local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

const db = drizzle(client, { schema });

// Cache TTL in milliseconds (default: 1 minute for quotes)
const QUOTE_CACHE_TTL = 60 * 1000; // 1 minute
const FUNDAMENTALS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const HISTORICAL_CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CachedQuote extends NormalizedQuote {
  lastFetched: Date;
}

export interface HistoricalQuote {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
  adjustedClose?: number;
}

export class QuoteCacheService {
  /**
   * Get cached quote if available and fresh
   */
  async getCachedQuote(symbol: string): Promise<CachedQuote | null> {
    try {
      const cached = await db
        .select()
        .from(schema.stockQuoteCache)
        .where(eq(schema.stockQuoteCache.symbol, symbol.toUpperCase()))
        .limit(1);

      if (cached.length === 0) {
        return null;
      }

      const quote = cached[0];
      const now = new Date();
      const lastFetched = new Date(quote.lastFetched);
      const age = now.getTime() - lastFetched.getTime();

      // Check if cache is still fresh
      if (age > QUOTE_CACHE_TTL) {
        return null;
      }

      return {
        symbol: quote.symbol,
        price: quote.price,
        change: quote.change,
        changePercent: quote.changePercent,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        previousClose: quote.previousClose,
        volume: quote.volume,
        marketCap: quote.marketCap,
        currency: quote.currency || "USD",
        name: quote.name,
        exchange: quote.exchange,
        timestamp: lastFetched,
        source: quote.source as "yfinance" | "finnhub" | "alpaca",
        lastFetched,
      };
    } catch (error: any) {
      console.error(`[QuoteCache] Error reading cache for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Save quote to cache
   */
  async saveQuoteToCache(quote: NormalizedQuote): Promise<void> {
    try {
      const now = new Date();
      const symbol = quote.symbol.toUpperCase();

      await db
        .insert(schema.stockQuoteCache)
        .values({
          symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          previousClose: quote.previousClose,
          volume: quote.volume,
          marketCap: quote.marketCap,
          currency: quote.currency || "USD",
          name: quote.name,
          exchange: quote.exchange,
          source: quote.source,
          lastFetched: now,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.stockQuoteCache.symbol,
          set: {
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            previousClose: quote.previousClose,
            volume: quote.volume,
            marketCap: quote.marketCap,
            currency: quote.currency || "USD",
            name: quote.name,
            exchange: quote.exchange,
            source: quote.source,
            lastFetched: now,
            updatedAt: now,
          },
        });
    } catch (error: any) {
      console.error(`[QuoteCache] Error saving quote for ${quote.symbol}:`, error.message);
    }
  }

  /**
   * Save multiple quotes to cache
   */
  async saveQuotesToCache(quotes: NormalizedQuote[]): Promise<void> {
    try {
      await Promise.all(quotes.map((quote) => this.saveQuoteToCache(quote)));
    } catch (error: any) {
      console.error(`[QuoteCache] Error saving quotes to cache:`, error.message);
    }
  }

  /**
   * Save historical quotes to cache
   */
  async saveHistoricalQuotes(symbol: string, quotes: HistoricalQuote[]): Promise<void> {
    try {
      const now = new Date();
      const symbolUpper = symbol.toUpperCase();

      const values = quotes.map((quote) => ({
        id: `${symbolUpper}-${quote.date}`,
        symbol: symbolUpper,
        date: quote.date,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        close: quote.close,
        volume: quote.volume,
        adjustedClose: quote.adjustedClose,
        createdAt: now,
      }));

      // Insert historical quotes (ignore conflicts for existing dates)
      for (const value of values) {
        await db
          .insert(schema.stockHistoricalQuotes)
          .values(value)
          .onConflictDoNothing();
      }
    } catch (error: any) {
      console.error(`[QuoteCache] Error saving historical quotes for ${symbol}:`, error.message);
    }
  }

  /**
   * Get cached historical quotes
   */
  async getCachedHistoricalQuotes(
    symbol: string,
    startDate?: string,
    endDate?: string
  ): Promise<HistoricalQuote[]> {
    try {
      const symbolUpper = symbol.toUpperCase();

      let query = db
        .select()
        .from(schema.stockHistoricalQuotes)
        .where(eq(schema.stockHistoricalQuotes.symbol, symbolUpper));

      const results = await query;

      // Filter by date range if provided
      let filtered = results;
      if (startDate) {
        filtered = filtered.filter((r) => r.date >= startDate);
      }
      if (endDate) {
        filtered = filtered.filter((r) => r.date <= endDate);
      }

      return filtered.map((r) => ({
        date: r.date,
        open: r.open,
        high: r.high,
        low: r.low,
        close: r.close,
        volume: r.volume || undefined,
        adjustedClose: r.adjustedClose || undefined,
      }));
    } catch (error: any) {
      console.error(`[QuoteCache] Error reading historical quotes for ${symbol}:`, error.message);
      return [];
    }
  }

  /**
   * Save fundamentals to cache
   */
  async saveFundamentals(
    symbol: string,
    fundamentals: {
      peRatio?: number;
      eps?: number;
      dividendYield?: number;
      beta?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
      fiftyDayAverage?: number;
      twoHundredDayAverage?: number;
      sharesOutstanding?: number;
      bookValue?: number;
      priceToBook?: number;
      trailingPE?: number;
      forwardPE?: number;
    }
  ): Promise<void> {
    try {
      const now = new Date();
      const symbolUpper = symbol.toUpperCase();

      await db
        .insert(schema.stockFundamentals)
        .values({
          symbol: symbolUpper,
          peRatio: fundamentals.peRatio,
          eps: fundamentals.eps,
          dividendYield: fundamentals.dividendYield,
          beta: fundamentals.beta,
          fiftyTwoWeekHigh: fundamentals.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: fundamentals.fiftyTwoWeekLow,
          fiftyDayAverage: fundamentals.fiftyDayAverage,
          twoHundredDayAverage: fundamentals.twoHundredDayAverage,
          sharesOutstanding: fundamentals.sharesOutstanding,
          bookValue: fundamentals.bookValue,
          priceToBook: fundamentals.priceToBook,
          trailingPE: fundamentals.trailingPE,
          forwardPE: fundamentals.forwardPE,
          lastFetched: now,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.stockFundamentals.symbol,
          set: {
            peRatio: fundamentals.peRatio,
            eps: fundamentals.eps,
            dividendYield: fundamentals.dividendYield,
            beta: fundamentals.beta,
            fiftyTwoWeekHigh: fundamentals.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: fundamentals.fiftyTwoWeekLow,
            fiftyDayAverage: fundamentals.fiftyDayAverage,
            twoHundredDayAverage: fundamentals.twoHundredDayAverage,
            sharesOutstanding: fundamentals.sharesOutstanding,
            bookValue: fundamentals.bookValue,
            priceToBook: fundamentals.priceToBook,
            trailingPE: fundamentals.trailingPE,
            forwardPE: fundamentals.forwardPE,
            lastFetched: now,
            updatedAt: now,
          },
        });
    } catch (error: any) {
      console.error(`[QuoteCache] Error saving fundamentals for ${symbol}:`, error.message);
    }
  }

  /**
   * Get cached fundamentals
   */
  async getCachedFundamentals(symbol: string) {
    try {
      const cached = await db
        .select()
        .from(schema.stockFundamentals)
        .where(eq(schema.stockFundamentals.symbol, symbol.toUpperCase()))
        .limit(1);

      if (cached.length === 0) {
        return null;
      }

      const fundamentals = cached[0];
      const now = new Date();
      const lastFetched = new Date(fundamentals.lastFetched);
      const age = now.getTime() - lastFetched.getTime();

      // Check if cache is still fresh
      if (age > FUNDAMENTALS_CACHE_TTL) {
        return null;
      }

      return fundamentals;
    } catch (error: any) {
      console.error(`[QuoteCache] Error reading fundamentals for ${symbol}:`, error.message);
      return null;
    }
  }

  /**
   * Clear expired cache entries
   */
  async clearExpiredCache(): Promise<void> {
    try {
      const now = new Date();
      const expiryTime = new Date(now.getTime() - QUOTE_CACHE_TTL);

      // This would require a more complex query with drizzle
      // For now, we'll rely on the TTL check when reading
    } catch (error: any) {
      console.error(`[QuoteCache] Error clearing expired cache:`, error.message);
    }
  }
}

// Export singleton instance
export const quoteCacheService = new QuoteCacheService();
export default quoteCacheService;
