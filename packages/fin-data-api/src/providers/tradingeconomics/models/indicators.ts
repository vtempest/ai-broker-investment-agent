/**
 * Trading Economics Indicators Model
 * Converted from Python OpenBB tradingeconomics models
 */

import { z } from 'zod';
import { Fetcher } from '../../../types/base';
import { makeRequest } from '../../../utils/http';

export const TradingEconomicsIndicatorsQuerySchema = z.object({
  country: z.string().describe('Country name'),
  indicator: z.string().describe('Indicator name'),
  start_date: z.string().or(z.date()).optional().describe('Start date'),
  end_date: z.string().or(z.date()).optional().describe('End date'),
});

export type TradingEconomicsIndicatorsQuery = z.infer<
  typeof TradingEconomicsIndicatorsQuerySchema
>;

export const TradingEconomicsIndicatorsDataSchema = z.object({
  date: z.string().describe('Date'),
  value: z.number().nullable().describe('Indicator value'),
  country: z.string().describe('Country'),
  indicator: z.string().describe('Indicator'),
  previous: z.number().optional().describe('Previous value'),
  forecast: z.number().optional().describe('Forecast value'),
});

export type TradingEconomicsIndicatorsData = z.infer<
  typeof TradingEconomicsIndicatorsDataSchema
>;

export class TradingEconomicsIndicatorsFetcher
  implements Fetcher<TradingEconomicsIndicatorsQuery, TradingEconomicsIndicatorsData>
{
  transformQuery(
    params: Partial<TradingEconomicsIndicatorsQuery>
  ): TradingEconomicsIndicatorsQuery {
    return TradingEconomicsIndicatorsQuerySchema.parse(params);
  }

  async extractData(
    query: TradingEconomicsIndicatorsQuery,
    credentials?: Record<string, string>
  ): Promise<any[]> {
    const apiKey = credentials?.tradingeconomics_api_key;
    if (!apiKey) {
      throw new Error('Trading Economics API key is required');
    }

    let url = `https://api.tradingeconomics.com/historical/country/${query.country}/indicator/${query.indicator}?c=${apiKey}&format=json`;

    if (query.start_date) {
      const startDate =
        typeof query.start_date === 'string'
          ? query.start_date
          : query.start_date.toISOString().split('T')[0];
      url += `&d1=${startDate}`;
    }

    if (query.end_date) {
      const endDate =
        typeof query.end_date === 'string'
          ? query.end_date
          : query.end_date.toISOString().split('T')[0];
      url += `&d2=${endDate}`;
    }

    const response = await makeRequest(url);

    if (!Array.isArray(response)) {
      throw new Error('No data returned from Trading Economics API');
    }

    return response;
  }

  transformData(
    query: TradingEconomicsIndicatorsQuery,
    data: any[]
  ): TradingEconomicsIndicatorsData[] {
    return data.map((item) =>
      TradingEconomicsIndicatorsDataSchema.parse({
        date: item.DateTime || item.Date,
        value: item.Value,
        country: query.country,
        indicator: query.indicator,
        previous: item.Previous,
        forecast: item.Forecast,
      })
    );
  }
}
