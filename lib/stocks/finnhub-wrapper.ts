// Finnhub API Wrapper for TypeScript
// Uses Finnhub as primary source with Alpaca API as fallback for historical data

import { createAlpacaClient } from '@/lib/alpaca/client';

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
   * Uses Finnhub as primary source, falls back to Alpaca API if Finnhub fails
   */
  async getHistoricalData(options: HistoricalDataOptions) {
    const { symbol, period1, period2, interval = '1d' } = options;

    console.log(`[Historical] Fetching data for ${symbol}, interval: ${interval}, period: ${period1} to ${period2}`);

    // Try Finnhub first (if API key is configured)
    if (FINNHUB_API_KEY) {
      try {
        const resolution = mapInterval(interval);
        const from = toUnixTimestamp(period1);
        const to = toUnixTimestamp(period2);

        console.log(`[Finnhub] Requesting candles for ${symbol}, resolution: ${resolution}, from: ${from}, to: ${to}`);

        const candles = await finnhubFetch<FinnhubCandle>('/stock/candle', {
          symbol: symbol.toUpperCase(),
          resolution,
          from: String(from),
          to: String(to)
        });

        if (candles.s === 'no_data') {
          console.log(`[Finnhub] Returned no_data for ${symbol}, trying Alpaca...`);
        } else if (candles.t && candles.t.length > 0) {
          // Transform to standard format
          const quotes = candles.t.map((timestamp, i) => ({
            date: new Date(timestamp * 1000),
            open: candles.o[i],
            high: candles.h[i],
            low: candles.l[i],
            close: candles.c[i],
            volume: candles.v[i]
          }));

          console.log(`[Finnhub] Successfully fetched ${quotes.length} candles for ${symbol}`);

          return {
            success: true,
            symbol,
            source: 'finnhub',
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
        } else {
          console.log(`[Finnhub] Returned empty data for ${symbol} (status: ${candles.s}), trying Alpaca...`);
        }
      } catch (finnhubError: any) {
        console.log(`[Finnhub] API failed for ${symbol}: ${finnhubError.message}, trying Alpaca...`);
      }
    } else {
      console.log('[Finnhub] API key not configured, skipping to Alpaca...');
    }

    // Fallback to Alpaca API
    try {
      console.log(`[Alpaca] Attempting to fetch historical data for ${symbol}...`);
      const result = await this.getHistoricalDataFromAlpaca(symbol, period1, period2, interval);
      if (result.success && result.data?.quotes && result.data.quotes.length > 0) {
        console.log(`[Alpaca] Successfully fetched ${result.data.quotes.length} bars for ${symbol}`);
        return {
          ...result,
          source: 'alpaca'
        };
      }
      console.log(`[Alpaca] Returned no data for ${symbol}`);
    } catch (alpacaError: any) {
      console.log(`[Alpaca] API fallback failed for ${symbol}: ${alpacaError.message}`);
    }

    console.error(`[Historical] Failed to fetch data for ${symbol} from both Finnhub and Alpaca`);

    return {
      success: false,
      error: 'Failed to fetch historical data from both Finnhub and Alpaca. Please check API credentials are configured.'
    };
  }

  /**
   * Get historical data from Alpaca API (fallback)
   * Tries direct HTTP API first (more reliable), then falls back to SDK
   */
  private async getHistoricalDataFromAlpaca(
    symbol: string,
    period1: string | Date,
    period2: string | Date,
    interval: string = '1d'
  ) {
    // Map interval to Alpaca timeframe format
    const timeframe = (() => {
      const mapping: { [key: string]: string } = {
        '1': '1Min',
        '5': '5Min',
        '15': '15Min',
        '30': '30Min',
        '60': '1Hour',
        '1m': '1Min',
        '5m': '5Min',
        '15m': '15Min',
        '30m': '30Min',
        '1h': '1Hour',
        'D': '1Day',
        'W': '1Week',
        'M': '1Month',
        '1d': '1Day',
        '1wk': '1Week',
        '1mo': '1Month'
      };
      return mapping[interval] || '1Day';
    })();

    const startDate = typeof period1 === 'string' ? new Date(period1) : period1;
    const endDate = typeof period2 === 'string' ? new Date(period2) : period2;

    // Try direct HTTP API first (more reliable than SDK)
    try {
      const result = await this.getHistoricalDataFromAlpacaHttp(symbol, startDate, endDate, timeframe);
      if (result.success && result.data?.quotes && result.data.quotes.length > 0) {
        console.log(`Alpaca HTTP API succeeded for ${symbol}: ${result.data.quotes.length} bars`);
        return result;
      }
      console.log(`Alpaca HTTP API returned no data for ${symbol}`);
    } catch (httpError: any) {
      console.log(`Alpaca HTTP API failed for ${symbol}: ${httpError.message}`);
    }

    // Fallback to SDK method
    try {
      const alpaca = createAlpacaClient();

      // Format dates as YYYY-MM-DD for SDK (simpler format works better)
      const formatDate = (d: Date) => d.toISOString().split('T')[0];

      console.log(`Trying Alpaca SDK for ${symbol} from ${formatDate(startDate)} to ${formatDate(endDate)}`);

      const bars = alpaca.getBarsV2(
        symbol.toUpperCase(),
        {
          start: formatDate(startDate),
          end: formatDate(endDate),
          timeframe,
          feed: 'iex'
        }
      );

      const quotes: any[] = [];
      for await (const bar of bars) {
        // Handle both SDK format (PascalCase) and raw format (lowercase)
        const timestamp = bar.Timestamp || bar.t;
        const open = bar.OpenPrice ?? bar.o;
        const high = bar.HighPrice ?? bar.h;
        const low = bar.LowPrice ?? bar.l;
        const close = bar.ClosePrice ?? bar.c;
        const volume = bar.Volume ?? bar.v;

        if (timestamp && open !== undefined) {
          quotes.push({
            date: new Date(timestamp),
            open,
            high,
            low,
            close,
            volume
          });
        }
      }

      if (quotes.length > 0) {
        console.log(`Alpaca SDK succeeded for ${symbol}: ${quotes.length} bars`);
        return {
          success: true,
          symbol,
          data: {
            quotes,
            meta: {
              symbol,
              exchangeName: 'US',
              regularMarketPrice: quotes[quotes.length - 1].close
            }
          },
          meta: {
            symbol,
            exchangeName: 'US',
            regularMarketPrice: quotes[quotes.length - 1].close
          }
        };
      }
      console.log(`Alpaca SDK returned no data for ${symbol}`);
    } catch (sdkError: any) {
      console.log(`Alpaca SDK failed for ${symbol}: ${sdkError.message}`);
    }

    return {
      success: false,
      symbol,
      data: { quotes: [], meta: { symbol } }
    };
  }

  /**
   * Direct HTTP API call to Alpaca Market Data API
   */
  private async getHistoricalDataFromAlpacaHttp(
    symbol: string,
    startDate: Date,
    endDate: Date,
    timeframe: string
  ) {
    // Check multiple environment variable names for API credentials
    const apiKey = process.env.ALPACA_API_KEY || process.env.ALPACA_KEY_ID || process.env.APCA_API_KEY_ID || '';
    const secretKey = process.env.ALPACA_SECRET || process.env.ALPACA_SECRET_KEY || process.env.APCA_API_SECRET_KEY || '';

    if (!apiKey || !secretKey) {
      throw new Error('Alpaca API credentials not configured. Set ALPACA_API_KEY and ALPACA_SECRET environment variables.');
    }

    // Format dates as RFC-3339 (ISO 8601)
    const formatDate = (d: Date) => d.toISOString();

    const url = new URL(`https://data.alpaca.markets/v2/stocks/${symbol.toUpperCase()}/bars`);
    url.searchParams.set('start', formatDate(startDate));
    url.searchParams.set('end', formatDate(endDate));
    url.searchParams.set('timeframe', timeframe);
    url.searchParams.set('feed', 'iex');
    url.searchParams.set('limit', '10000');
    url.searchParams.set('adjustment', 'split'); // Adjust for stock splits

    console.log(`Alpaca HTTP request: ${url.toString().replace(/apikey=[^&]+/gi, 'apikey=***')}`);

    const response = await fetch(url.toString(), {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Alpaca API error response: ${response.status} ${response.statusText} - ${errorText}`);
      throw new Error(`Alpaca API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    // Handle the response - bars can be an array or null
    const bars = data.bars || [];

    if (!Array.isArray(bars) || bars.length === 0) {
      console.log(`Alpaca returned empty bars array for ${symbol}`);
      return {
        success: true,
        symbol,
        data: { quotes: [], meta: { symbol } },
        meta: { symbol }
      };
    }

    const quotes = bars.map((bar: any) => ({
      date: new Date(bar.t),
      open: bar.o,
      high: bar.h,
      low: bar.l,
      close: bar.c,
      volume: bar.v
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
        exchangeName: 'US',
        regularMarketPrice: quotes.length > 0 ? quotes[quotes.length - 1].close : null
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
