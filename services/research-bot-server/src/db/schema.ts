import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Job execution history
export const jobHistory = sqliteTable('job_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobId: text('job_id').notNull().unique(),
  symbol: text('symbol').notNull(),
  jobType: text('job_type').notNull(), // 'primo', 'trading', 'consensus'
  status: text('status').notNull(), // 'pending', 'processing', 'completed', 'failed'
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  duration: integer('duration'), // milliseconds
  retryCount: integer('retry_count').default(0),
  error: text('error'),
  result: text('result', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Stock analysis results
export const analysisResults = sqliteTable('analysis_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull(),
  date: text('date').notNull(), // YYYY-MM-DD
  source: text('source').notNull(), // 'primo', 'trading', 'consensus'
  recommendation: text('recommendation').notNull(), // 'BUY', 'SELL', 'HOLD'
  confidence: real('confidence').notNull(),
  priceTarget: real('price_target'),
  riskLevel: text('risk_level'),
  analysis: text('analysis', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Tracked stocks configuration
export const trackedStocks = sqliteTable('tracked_stocks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull().unique(),
  name: text('name'),
  sector: text('sector'),
  enabled: integer('enabled', { mode: 'boolean' }).default(true),
  priority: integer('priority').default(5), // 1-10, higher = more important
  lastAnalyzed: integer('last_analyzed', { mode: 'timestamp' }),
  analysisCount: integer('analysis_count').default(0),
  successCount: integer('success_count').default(0),
  failureCount: integer('failure_count').default(0),
  avgDuration: integer('avg_duration'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// System metrics
export const systemMetrics = sqliteTable('system_metrics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  metric: text('metric').notNull(),
  value: real('value').notNull(),
  tags: text('tags', { mode: 'json' }),
  timestamp: integer('timestamp', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});

// Alerts and notifications
export const alerts = sqliteTable('alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  symbol: text('symbol').notNull(),
  alertType: text('alert_type').notNull(), // 'high_confidence', 'action_change', 'error'
  severity: text('severity').notNull(), // 'info', 'warning', 'critical'
  message: text('message').notNull(),
  data: text('data', { mode: 'json' }),
  read: integer('read', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
});
