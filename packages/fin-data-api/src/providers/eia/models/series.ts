/**
 * EIA Energy Data Series Model
 * Converted from Python OpenBB eia models
 */

import { z } from 'zod';
import { Fetcher } from '../../../types/base';
import { makeRequest } from '../../../utils/http';

export const EIASeriesQuerySchema = z.object({
  series_id: z.string().describe('EIA series ID'),
  start_date: z.string().or(z.date()).optional().describe('Start date'),
  end_date: z.string().or(z.date()).optional().describe('End date'),
  frequency: z
    .enum(['annual', 'quarterly', 'monthly', 'weekly', 'daily', 'hourly'])
    .optional()
    .describe('Data frequency'),
});

export type EIASeriesQuery = z.infer<typeof EIASeriesQuerySchema>;

export const EIASeriesDataSchema = z.object({
  date: z.string().describe('Date'),
  value: z.number().nullable().describe('Series value'),
  series_id: z.string().describe('Series ID'),
});

export type EIASeriesData = z.infer<typeof EIASeriesDataSchema>;

export class EIASeriesFetcher implements Fetcher<EIASeriesQuery, EIASeriesData> {
  transformQuery(params: Partial<EIASeriesQuery>): EIASeriesQuery {
    return EIASeriesQuerySchema.parse(params);
  }

  async extractData(
    query: EIASeriesQuery,
    credentials?: Record<string, string>
  ): Promise<any[]> {
    const apiKey = credentials?.eia_api_key;
    if (!apiKey) {
      throw new Error('EIA API key is required');
    }

    const params: Record<string, string> = {
      api_key: apiKey,
      series_id: query.series_id,
    };

    if (query.start_date) {
      params.start =
        typeof query.start_date === 'string'
          ? query.start_date
          : query.start_date.toISOString().split('T')[0];
    }

    if (query.end_date) {
      params.end =
        typeof query.end_date === 'string'
          ? query.end_date
          : query.end_date.toISOString().split('T')[0];
    }

    const queryString = new URLSearchParams(params).toString();
    const url = `https://api.eia.gov/v2/seriesid/${query.series_id}?${queryString}`;

    const response = await makeRequest(url);

    if (!response.response?.data) {
      throw new Error('No data returned from EIA API');
    }

    return response.response.data;
  }

  transformData(query: EIASeriesQuery, data: any[]): EIASeriesData[] {
    return data.map((item) =>
      EIASeriesDataSchema.parse({
        date: item.period,
        value: item.value === null ? null : parseFloat(item.value),
        series_id: query.series_id,
      })
    );
  }
}
