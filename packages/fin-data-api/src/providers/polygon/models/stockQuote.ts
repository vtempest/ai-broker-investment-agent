/**
 * Polygon Stock Quote Model
 * Converted from Python OpenBB polygon models
 */

import { z } from 'zod';
import { Fetcher } from '../../../types/base';
import { makeRequest } from '../../../utils/http';

export const PolygonStockQuoteQuerySchema = z.object({
  symbol: z.string().describe('Stock symbol'),
});

export type PolygonStockQuoteQuery = z.infer<typeof PolygonStockQuoteQuerySchema>;

export const PolygonStockQuoteDataSchema = z.object({
  symbol: z.string().describe('Stock symbol'),
  last_price: z.number().describe('Last trade price'),
  last_size: z.number().optional().describe('Last trade size'),
  bid_price: z.number().optional().describe('Bid price'),
  bid_size: z.number().optional().describe('Bid size'),
  ask_price: z.number().optional().describe('Ask price'),
  ask_size: z.number().optional().describe('Ask size'),
  volume: z.number().optional().describe('Trading volume'),
  timestamp: z.number().describe('Quote timestamp'),
});

export type PolygonStockQuoteData = z.infer<typeof PolygonStockQuoteDataSchema>;

export class PolygonStockQuoteFetcher
  implements Fetcher<PolygonStockQuoteQuery, PolygonStockQuoteData>
{
  transformQuery(params: Partial<PolygonStockQuoteQuery>): PolygonStockQuoteQuery {
    return PolygonStockQuoteQuerySchema.parse(params);
  }

  async extractData(
    query: PolygonStockQuoteQuery,
    credentials?: Record<string, string>
  ): Promise<any[]> {
    const apiKey = credentials?.polygon_api_key;
    if (!apiKey) {
      throw new Error('Polygon API key is required');
    }

    const url = `https://api.polygon.io/v2/last/trade/${query.symbol}?apiKey=${apiKey}`;
    const response = await makeRequest(url);

    if (response.status !== 'OK' || !response.results) {
      throw new Error('No data returned from Polygon API');
    }

    return [response.results];
  }

  transformData(query: PolygonStockQuoteQuery, data: any[]): PolygonStockQuoteData[] {
    return data.map((item) =>
      PolygonStockQuoteDataSchema.parse({
        symbol: query.symbol,
        last_price: item.p || item.price,
        last_size: item.s || item.size,
        bid_price: item.P,
        bid_size: item.S,
        ask_price: item.p,
        ask_size: item.s,
        volume: item.v,
        timestamp: item.t || item.timestamp,
      })
    );
  }
}
