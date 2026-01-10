/**
 * OpenAPI Schema Generator
 * Generates OpenAPI 3.0 specification from Zod schemas
 */

import zodToJsonSchema from 'zod-to-json-schema';
import { CongressBillsQuerySchema, CongressBillsDataSchema } from '../providers/congress_gov/models/congressBills';
import { SACalendarEarningsQuerySchema, SACalendarEarningsDataSchema } from '../providers/seeking_alpha/models/calendarEarnings';
import { CftcCotQuerySchema, CftcCotDataSchema } from '../providers/cftc/models/cot';

/**
 * Generate OpenAPI 3.0 Specification
 */
export function generateOpenAPISpec() {
  return {
    openapi: '3.0.0',
    info: {
      title: 'Financial Data API',
      version: '1.0.0',
      description:
        'TypeScript Financial Data API with comprehensive market data from multiple providers. ' +
        'Converted from OpenBB Finance APIs with enhanced TypeScript support and Scalar documentation.',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.example.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Congress',
        description: 'U.S. Congressional data including bills, votes, and committee information',
      },
      {
        name: 'Earnings',
        description: 'Company earnings calendars and estimates',
      },
      {
        name: 'CFTC',
        description: 'Commodity Futures Trading Commission reports and data',
      },
    ],
    paths: {
      '/api/congress/bills': {
        get: {
          tags: ['Congress'],
          summary: 'Get Congressional Bills',
          description:
            'Retrieve current and historical U.S. Congressional Bills with filtering options.',
          operationId: 'getCongressBills',
          parameters: [
            {
              name: 'congress',
              in: 'query',
              schema: { type: 'integer' },
              description: 'Congress number (e.g., 118 for the 118th Congress)',
            },
            {
              name: 'bill_type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['hr', 's', 'hjres', 'sjres', 'hconres', 'sconres', 'hres', 'sres'],
              },
              description: 'Type of bill (hr, s, hjres, etc.)',
            },
            {
              name: 'start_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Start date (YYYY-MM-DD)',
            },
            {
              name: 'end_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'End date (YYYY-MM-DD)',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 100 },
              description: 'Maximum number of results',
            },
            {
              name: 'offset',
              in: 'query',
              schema: { type: 'integer', default: 0 },
              description: 'Number of results to skip',
            },
            {
              name: 'sort_by',
              in: 'query',
              schema: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
              description: 'Sort order by update date',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: zodToJsonSchema(CongressBillsDataSchema),
                      },
                      provider: { type: 'string' },
                      warnings: { type: 'array', items: { type: 'string' } },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request - Invalid parameters',
            },
            '401': {
              description: 'Unauthorized - Missing or invalid API key',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/api/earnings/calendar': {
        get: {
          tags: ['Earnings'],
          summary: 'Get Earnings Calendar',
          description: 'Retrieve earnings calendar data from Seeking Alpha.',
          operationId: 'getEarningsCalendar',
          parameters: [
            {
              name: 'start_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Start date (YYYY-MM-DD)',
            },
            {
              name: 'end_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'End date (YYYY-MM-DD)',
            },
            {
              name: 'country',
              in: 'query',
              schema: { type: 'string', enum: ['us', 'ca'], default: 'us' },
              description: 'Country code (us or ca)',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: zodToJsonSchema(SACalendarEarningsDataSchema),
                      },
                      provider: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
      '/api/cftc/cot': {
        get: {
          tags: ['CFTC'],
          summary: 'Get Commitment of Traders Report',
          description:
            'Retrieve CFTC Commitment of Traders (COT) reports with various report types.',
          operationId: 'getCftcCot',
          parameters: [
            {
              name: 'id',
              in: 'query',
              schema: { type: 'string', default: 'all' },
              description: 'Commodity code, name, or "all" for all items',
            },
            {
              name: 'start_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'Start date (YYYY-MM-DD)',
            },
            {
              name: 'end_date',
              in: 'query',
              schema: { type: 'string', format: 'date' },
              description: 'End date (YYYY-MM-DD)',
            },
            {
              name: 'report_type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['legacy', 'disaggregated', 'financial', 'supplemental'],
                default: 'legacy',
              },
              description: 'Type of COT report',
            },
            {
              name: 'futures_only',
              in: 'query',
              schema: { type: 'boolean', default: false },
              description: 'Return futures-only report',
            },
          ],
          responses: {
            '200': {
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      results: {
                        type: 'array',
                        items: zodToJsonSchema(CftcCotDataSchema),
                      },
                      provider: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Bad request',
            },
            '500': {
              description: 'Internal server error',
            },
          },
        },
      },
    },
    components: {
      schemas: {
        CongressBillsQuery: zodToJsonSchema(CongressBillsQuerySchema),
        CongressBillsData: zodToJsonSchema(CongressBillsDataSchema),
        SACalendarEarningsQuery: zodToJsonSchema(SACalendarEarningsQuerySchema),
        SACalendarEarningsData: zodToJsonSchema(SACalendarEarningsDataSchema),
        CftcCotQuery: zodToJsonSchema(CftcCotQuerySchema),
        CftcCotData: zodToJsonSchema(CftcCotDataSchema),
      },
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication',
        },
      },
    },
  };
}
