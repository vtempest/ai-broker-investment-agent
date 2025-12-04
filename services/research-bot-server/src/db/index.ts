import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema.js';
import { config } from '../config.js';
import { logger } from '../logger.js';
import fs from 'fs';
import path from 'path';

// Ensure database directory exists
const dbDir = path.dirname(config.database.path);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(config.database.path);
sqlite.pragma('journal_mode = WAL');

export const db = drizzle(sqlite, { schema });

// Initialize database schema
export function initializeDatabase() {
  try {
    // Create tables if they don't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS job_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id TEXT NOT NULL UNIQUE,
        symbol TEXT NOT NULL,
        job_type TEXT NOT NULL,
        status TEXT NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        duration INTEGER,
        retry_count INTEGER DEFAULT 0,
        error TEXT,
        result TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS analysis_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        date TEXT NOT NULL,
        source TEXT NOT NULL,
        recommendation TEXT NOT NULL,
        confidence REAL NOT NULL,
        price_target REAL,
        risk_level TEXT,
        analysis TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS tracked_stocks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL UNIQUE,
        name TEXT,
        sector TEXT,
        enabled INTEGER DEFAULT 1,
        priority INTEGER DEFAULT 5,
        last_analyzed INTEGER,
        analysis_count INTEGER DEFAULT 0,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        avg_duration INTEGER,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric TEXT NOT NULL,
        value REAL NOT NULL,
        tags TEXT,
        timestamp INTEGER DEFAULT (unixepoch())
      );

      CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        read INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      );

      CREATE INDEX IF NOT EXISTS idx_job_history_symbol ON job_history(symbol);
      CREATE INDEX IF NOT EXISTS idx_job_history_status ON job_history(status);
      CREATE INDEX IF NOT EXISTS idx_analysis_results_symbol_date ON analysis_results(symbol, date);
      CREATE INDEX IF NOT EXISTS idx_tracked_stocks_enabled ON tracked_stocks(enabled);
      CREATE INDEX IF NOT EXISTS idx_alerts_read ON alerts(read);
    `);

    logger.info('Database initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize database:', error);
    throw error;
  }
}

export default db;
