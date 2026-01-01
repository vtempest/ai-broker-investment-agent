// Finnhub API Wrapper for TypeScript
// Uses Finnhub as primary source with yahoo-finance2 as fallback for historical data

import yahooFinance from 'yahoo-finance2';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || '';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

export interface HistoricalDataOptions {
  symbol: string;
  period1: string | Date;
  period2: string | Date;
  interval?: '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'; // Finnhub resolution
}

export interface QuoteOptions {
  symbol: string;
  modules?: string[];
}

interface FinnhubQuote {
  c: number;  // Current price
  d: number;  // Change
  dp: number; // Percent change
  h: number;  // High price of the day
  l: number;  // Low price of the day
  o: number;  // Open price of the day
  pc: number; // Previous close price
  t: number;  // Timestamp
}

interface FinnhubCandle {
  c: number[];  // Close prices
  h: number[];  // High prices
  l: number[];  // Low prices
  o: number[];  // Open prices
  s: string;    // Status
  t: number[];  // Timestamps
  v: number[];  // Volumes
}

interface FinnhubProfile {
  country: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
  logo: string;
  finnhubIndustry: string;
}

interface FinnhubMetrics {
  metric: {
    '10DayAverageTradingVolume': number;
    '52WeekHigh': number;
    '52WeekLow': number;
    'beta': number;
    'currentRatio': number;
    'dividendYieldIndicatedAnnual': number;
    'epsBasicExclExtraItemsTTM': number;
    'epsGrowth3Y': number;
    'epsGrowth5Y': number;
    'epsGrowthTTMYoy': number;
    'freeCashFlowPerShareTTM': number;
    'grossMarginTTM': number;
    'netProfitMarginTTM': number;
    'operatingMarginTTM': number;
    'pbAnnual': number;
    'peBasicExclExtraTTM': number;
    'peExclExtraHighTTM': number;
    'peNormalizedAnnual': number;
    'pfcfShareTTM': number;
    'priceRelativeToS&P50052Week': number;
    'psTTM': number;
    'revenueGrowth3Y': number;
    'revenueGrowth5Y': number;
    'revenueGrowthTTMYoy': number;
    'roaeTTM': number;
    'roeTTM': number;
    'roicTTM': number;
    'totalDebtToEquity': number;
    [key: string]: number;
  };
  series: {
    annual: {
      [key: string]: { period: string; v: number }[];
    };
  };
}

// Map interval from Yahoo Finance format to Finnhub format
function mapInterval(interval?: string): string {
  const mapping: { [key: string]: string } = {
    '1m': '1',
    '5m': '5',
    '15m': '15',
    '30m': '30',
    '60m': '60',
    '1h': '60',
    '1d': 'D',
    '1wk': 'W',
    '1mo': 'M',
    'D': 'D',
    'W': 'W',
    'M': 'M'
  };
  return mapping[interval || '1d'] || 'D';
}

// Convert date to Unix timestamp
function toUnixTimestamp(date: string | Date): number {
  if (typeof date === 'string') {
    return Math.floor(new Date(date).getTime() / 1000);
  }
  return Math.floor(date.getTime() / 1000);
}

async function finnhubFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${FINNHUB_BASE_URL}${endpoint}`);
  url.searchParams.set('token', FINNHUB_API_KEY);

  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export class FinnhubWrapper {
  /**
   * Get historical price data for a symbol (candles)
   * Uses Finnhub as primary source, falls back to yahoo-finance2 if Finnhub fails
   */
  async getHistoricalData(options: HistoricalDataOptions) {
    const { symbol, period1, period2, interval = '1d' } = options;

    // Try yahoo-finance2 first since Finnhub free tier doesn't support stock candles reliably
    try {
      const result = await this.getHistoricalDataFromYahoo(symbol, period1, period2, interval);
      if (result.success && result.data?.quotes && result.data.quotes.length > 0) {
        return result;
      }
    } catch (yahooError: any) {
      console.log(`Yahoo Finance fallback failed for ${symbol}: ${yahooError.message}`);
    }

    // Fallback to Finnhub
    try {
      const resolution = mapInterval(interval);
      const from = toUnixTimestamp(period1);
      const to = toUnixTimestamp(period2);

      const candles = await finnhubFetch<FinnhubCandle>('/stock/candle', {
        symbol: symbol.toUpperCase(),
        resolution,
        from: String(from),
        to: String(to)
      });

      if (candles.s === 'no_data' || !candles.t || candles.t.length === 0) {
        return {
          success: true,
          symbol,
          data: { quotes: [], meta: { symbol } }
        };
      }

      // Transform to Yahoo Finance-like format
      const quotes = candles.t.map((timestamp, i) => ({
        date: new Date(timestamp * 1000),
        open: candles.o[i],
        high: candles.h[i],
        low: candles.l[i],
        close: candles.c[i],
        volume: candles.v[i]
      }));

      return {
        success: true,
        symbol,
        data: {
          quotes,
          meta: {
            symbol,
            exchangeName: 'US',
            regularMarketPrice: quotes.length > 0 ? quotes[quotes.length - 1].close : null
          }
        },
        meta: {
          symbol,
          regularMarketPrice: quotes.length > 0 ? quotes[quotes.length - 1].close : null
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch historical data'
      };
    }
  }

  /**
   * Get historical data from Yahoo Finance (fallback)
   */
  private async getHistoricalDataFromYahoo(
    symbol: string,
    period1: string | Date,
    period2: string | Date,
    interval: string = '1d'
  ) {
    // Map interval to Yahoo Finance format
    const yahooInterval = (() => {
      const mapping: { [key: string]: '1d' | '1wk' | '1mo' } = {
        '1': '1d',
        '5': '1d',
        '15': '1d',
        '30': '1d',
        '60': '1d',
        'D': '1d',
        'W': '1wk',
        'M': '1mo',
        '1d': '1d',
        '1wk': '1wk',
        '1mo': '1mo'
      };
      return mapping[interval] || '1d';
    })();

    const queryOptions: any = {
      period1: typeof period1 === 'string' ? new Date(period1) : period1,
      period2: typeof period2 === 'string' ? new Date(period2) : period2,
      interval: yahooInterval
    };

    const result = await yahooFinance.chart(symbol.toUpperCase(), queryOptions);

    if (!result || !result.quotes || result.quotes.length === 0) {
      return {
        success: true,
        symbol,
        data: { quotes: [], meta: { symbol } }
      };
    }

    // Transform to our standard format
    const quotes = result.quotes.map((quote: any) => ({
      date: new Date(quote.date),
      open: quote.open,
      high: quote.high,
      low: quote.low,
      close: quote.close,
      volume: quote.volume
    }));

    return {
      success: true,
      symbol,
      data: {
        quotes,
        meta: {
          symbol,
          currency: result.meta?.currency,
          exchangeName: result.meta?.exchangeName,
          instrumentType: result.meta?.instrumentType,
          regularMarketPrice: result.meta?.regularMarketPrice,
          timezone: result.meta?.timezone,
          exchangeTimezoneName: result.meta?.exchangeTimezoneName
        }
      },
      meta: {
        symbol,
        currency: result.meta?.currency,
        exchangeName: result.meta?.exchangeName,
        regularMarketPrice: result.meta?.regularMarketPrice
      }
    };
  }

  /**
   * Get quote summary for a symbol
   */
  async getQuote(options: QuoteOptions) {
    const { symbol } = options;

    try {
      // Fetch quote, profile, and metrics in parallel
      const [quote, profile, metrics] = await Promise.all([
        finnhubFetch<FinnhubQuote>('/quote', { symbol: symbol.toUpperCase() }),
        finnhubFetch<FinnhubProfile>('/stock/profile2', { symbol: symbol.toUpperCase() }).catch(() => null),
        finnhubFetch<FinnhubMetrics>('/stock/metric', {
          symbol: symbol.toUpperCase(),
          metric: 'all'
        }).catch(() => null)
      ]);

      // Transform to Yahoo Finance-like structure
      const data: any = {
        price: {
          regularMarketPrice: quote.c,
          regularMarketChange: quote.d,
          regularMarketChangePercent: quote.dp,
          regularMarketDayHigh: quote.h,
          regularMarketDayLow: quote.l,
          regularMarketOpen: quote.o,
          regularMarketPreviousClose: quote.pc,
          regularMarketTime: new Date(quote.t * 1000)
        },
        summaryDetail: {
          previousClose: quote.pc,
          open: quote.o,
          dayHigh: quote.h,
          dayLow: quote.l,
          regularMarketVolume: metrics?.metric?.['10DayAverageTradingVolume'] || null,
          fiftyTwoWeekHigh: metrics?.metric?.['52WeekHigh'] || null,
          fiftyTwoWeekLow: metrics?.metric?.['52WeekLow'] || null,
          trailingPE: metrics?.metric?.peBasicExclExtraTTM || null,
          dividendYield: metrics?.metric?.dividendYieldIndicatedAnnual
            ? metrics.metric.dividendYieldIndicatedAnnual / 100
            : null,
          beta: metrics?.metric?.beta || null
        },
        defaultKeyStatistics: {
          priceToBook: metrics?.metric?.pbAnnual || null,
          enterpriseValue: null,
          forwardPE: null,
          pegRatio: null,
          beta: metrics?.metric?.beta || null,
          sharesOutstanding: profile?.shareOutstanding ? profile.shareOutstanding * 1e6 : null
        },
        financialData: {
          currentPrice: quote.c,
          targetHighPrice: null,
          targetLowPrice: null,
          targetMeanPrice: null,
          targetMedianPrice: null,
          recommendationMean: null,
          recommendationKey: null,
          numberOfAnalystOpinions: null,
          totalCash: null,
          totalDebt: null,
          totalRevenue: null,
          returnOnEquity: metrics?.metric?.roeTTM ? metrics.metric.roeTTM / 100 : null,
          returnOnAssets: metrics?.metric?.roaeTTM ? metrics.metric.roaeTTM / 100 : null,
          profitMargins: metrics?.metric?.netProfitMarginTTM ? metrics.metric.netProfitMarginTTM / 100 : null,
          operatingMargins: metrics?.metric?.operatingMarginTTM ? metrics.metric.operatingMarginTTM / 100 : null,
          grossMargins: metrics?.metric?.grossMarginTTM ? metrics.metric.grossMarginTTM / 100 : null,
          freeCashflow: null,
          operatingCashflow: null,
          revenueGrowth: metrics?.metric?.revenueGrowthTTMYoy ? metrics.metric.revenueGrowthTTMYoy / 100 : null,
          earningsGrowth: metrics?.metric?.epsGrowthTTMYoy ? metrics.metric.epsGrowthTTMYoy / 100 : null,
          currentRatio: metrics?.metric?.currentRatio || null,
          debtToEquity: metrics?.metric?.totalDebtToEquity || null
        },
        summaryProfile: profile ? {
          industry: profile.finnhubIndustry,
          sector: profile.finnhubIndustry,
          website: profile.weburl,
          country: profile.country,
          fullTimeEmployees: null,
          longBusinessSummary: null
        } : null
      };

      // Add profile data
      if (profile) {
        data.price.currency = profile.currency;
        data.price.longName = profile.name;
        data.price.shortName = profile.name;
        data.price.marketCap = profile.marketCapitalization ? profile.marketCapitalization * 1e6 : null;
        data.price.exchange = profile.exchange;
        data.summaryDetail.marketCap = profile.marketCapitalization ? profile.marketCapitalization * 1e6 : null;
      }

      return {
        success: true,
        symbol,
        data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch quote'
      };
    }
  }

  /**
   * Search for stocks by query
   */
  async search(query: string) {
    try {
      const result = await finnhubFetch<{ count: number; result: any[] }>('/search', { q: query });

      return {
        success: true,
        query,
        results: result.result.map((item: any) => ({
          symbol: item.symbol,
          shortname: item.description,
          exchange: item.type,
          quoteType: item.type
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to search'
      };
    }
  }

  /**
   * Get peer companies for a symbol
   */
  async getPeers(symbol: string) {
    try {
      const peers = await finnhubFetch<string[]>('/stock/peers', { symbol: symbol.toUpperCase() });

      return {
        success: true,
        symbol,
        peers: peers || []
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch peers'
      };
    }
  }

  /**
   * Get analyst recommendations for a symbol
   */
  async getRecommendations(symbol: string) {
    try {
      const recommendations = await finnhubFetch<any[]>('/stock/recommendation', {
        symbol: symbol.toUpperCase()
      });

      // Transform to Yahoo Finance-like structure
      const data: any = {
        recommendationTrend: {
          trend: recommendations.map(rec => ({
            period: rec.period,
            strongBuy: rec.strongBuy,
            buy: rec.buy,
            hold: rec.hold,
            sell: rec.sell,
            strongSell: rec.strongSell
          }))
        }
      };

      return {
        success: true,
        symbol,
        data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch recommendations'
      };
    }
  }

  /**
   * Get basic financials (metrics) for a symbol
   */
  async getFinancials(symbol: string) {
    try {
      const metrics = await finnhubFetch<FinnhubMetrics>('/stock/metric', {
        symbol: symbol.toUpperCase(),
        metric: 'all'
      });

      // Transform to Yahoo Finance-like structure
      const data: any = {
        earnings: {
          earningsChart: {},
          financialsChart: {}
        },
        incomeStatementHistory: {},
        balanceSheetHistory: {},
        cashflowStatementHistory: {},
        metrics: metrics.metric,
        series: metrics.series
      };

      return {
        success: true,
        symbol,
        data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch financials'
      };
    }
  }

  /**
   * Get company news
   */
  async getNews(symbol: string, from?: string, to?: string) {
    try {
      const today = new Date();
      const defaultFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      const news = await finnhubFetch<any[]>('/company-news', {
        symbol: symbol.toUpperCase(),
        from: from || defaultFrom.toISOString().split('T')[0],
        to: to || today.toISOString().split('T')[0]
      });

      return {
        success: true,
        symbol,
        news: news.map(item => ({
          title: item.headline,
          link: item.url,
          publisher: item.source,
          publishedAt: new Date(item.datetime * 1000),
          summary: item.summary,
          image: item.image,
          category: item.category,
          related: item.related
        }))
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch news'
      };
    }
  }

  /**
   * Get forex rates
   */
  async getForexRate(baseCurrency: string, quoteCurrency: string) {
    try {
      // Finnhub uses different endpoint for forex
      const rates = await finnhubFetch<{ base: string; quote: { [key: string]: number } }>('/forex/rates', {
        base: baseCurrency.toUpperCase()
      });

      const rate = rates.quote[quoteCurrency.toUpperCase()];

      return {
        success: true,
        baseCurrency,
        quoteCurrency,
        rate: rate || null
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch forex rate'
      };
    }
  }
}

// Export singleton instance
export const finnhub = new FinnhubWrapper();
