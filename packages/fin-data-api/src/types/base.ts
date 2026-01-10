/**
 * Base types for the Financial Data API
 * Converted from OpenBB Platform Python types
 */

import { z } from 'zod';

/**
 * Base Query Parameters
 * Equivalent to Python's QueryParams base class
 */
export interface QueryParams {
  [key: string]: any;
}

/**
 * Base Data Model
 * Equivalent to Python's Data base class
 */
export interface Data {
  [key: string]: any;
}

/**
 * OBBject - Standard response wrapper
 * Equivalent to Python's OBBject class
 */
export interface OBBject<T = any> {
  results: T;
  provider?: string;
  warnings?: string[];
  chart?: any;
  extra?: Record<string, any>;
}

/**
 * API Error Response
 */
export interface APIError {
  error: {
    code: string;
    message: string;
    detail?: any;
  };
}

/**
 * Fetcher Interface
 * Equivalent to Python's Fetcher abstract class
 */
export interface Fetcher<Q extends QueryParams, D extends Data> {
  /**
   * Transform query parameters
   */
  transformQuery(params: Partial<Q>): Q;

  /**
   * Extract data from external source
   */
  extractData(query: Q, credentials?: Record<string, string>): Promise<any[]>;

  /**
   * Transform raw data to structured format
   */
  transformData(query: Q, data: any[]): D[];
}

/**
 * Provider Credentials
 */
export interface ProviderCredentials {
  [providerName: string]: Record<string, string>;
}

/**
 * Standard date range query parameters
 */
export const DateRangeSchema = z.object({
  start_date: z.string().or(z.date()).optional().describe('Start date for data query'),
  end_date: z.string().or(z.date()).optional().describe('End date for data query'),
});

export type DateRangeParams = z.infer<typeof DateRangeSchema>;

/**
 * Standard pagination query parameters
 */
export const PaginationSchema = z.object({
  limit: z.number().int().positive().optional().describe('Maximum number of results to return'),
  offset: z.number().int().nonnegative().optional().describe('Number of results to skip'),
});

export type PaginationParams = z.infer<typeof PaginationSchema>;

/**
 * Helper to create OBBject response
 */
export function createOBBject<T>(
  results: T,
  provider?: string,
  warnings?: string[],
  extra?: Record<string, any>
): OBBject<T> {
  return {
    results,
    provider,
    warnings,
    extra,
  };
}

/**
 * Helper to create error response
 */
export function createError(code: string, message: string, detail?: any): APIError {
  return {
    error: {
      code,
      message,
      detail,
    },
  };
}

/**
 * Convert date to YYYY-MM-DD string
 */
export function formatDate(date: Date | string): string {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  return date.toISOString().split('T')[0];
}

/**
 * Parse date from various formats
 */
export function parseDate(dateStr: string | Date): Date {
  if (dateStr instanceof Date) {
    return dateStr;
  }
  return new Date(dateStr);
}
