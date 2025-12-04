import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv();

const configSchema = z.object({
  port: z.number().default(3000),
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),

  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
  }),

  apis: z.object({
    primoAgent: z.string().url().default('http://localhost:8002'),
    tradingAgents: z.string().url().default('http://localhost:8001'),
  }),

  database: z.object({
    path: z.string().default('./data/research-bot.db'),
  }),

  scheduling: z.object({
    dailyAnalysisCron: z.string().default('35 9 * * 1-5'),
    coreStocks: z.array(z.string()).default([
      'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'META', 'AMZN'
    ]),
  }),

  jobs: z.object({
    maxConcurrent: z.number().default(3),
    timeoutMs: z.number().default(300000),
    retryAttempts: z.number().default(3),
    retryDelayMs: z.number().default(5000),
  }),

  logging: z.object({
    level: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
    file: z.string().default('./logs/research-bot.log'),
  }),
});

export type Config = z.infer<typeof configSchema>;

export const config: Config = configSchema.parse({
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
  },

  apis: {
    primoAgent: process.env.PRIMO_AGENT_URL || 'http://localhost:8002',
    tradingAgents: process.env.TRADING_AGENTS_URL || 'http://localhost:8001',
  },

  database: {
    path: process.env.DATABASE_PATH || './data/research-bot.db',
  },

  scheduling: {
    dailyAnalysisCron: process.env.DAILY_ANALYSIS_CRON || '35 9 * * 1-5',
    coreStocks: process.env.CORE_STOCKS?.split(',').map(s => s.trim()) || [
      'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'META', 'AMZN'
    ],
  },

  jobs: {
    maxConcurrent: parseInt(process.env.MAX_CONCURRENT_JOBS || '3'),
    timeoutMs: parseInt(process.env.JOB_TIMEOUT_MS || '300000'),
    retryAttempts: parseInt(process.env.RETRY_ATTEMPTS || '3'),
    retryDelayMs: parseInt(process.env.RETRY_DELAY_MS || '5000'),
  },

  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    file: process.env.LOG_FILE || './logs/research-bot.log',
  },
});
