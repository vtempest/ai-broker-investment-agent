import cron from 'node-cron';
import { config } from './config.js';
import { logger } from './logger.js';
import { db } from './db/index.js';
import { trackedStocks } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { addBatchJobs } from './queue/queue.js';

export class AnalysisScheduler {
  private dailyTask: cron.ScheduledTask | null = null;

  async start() {
    logger.info('Starting analysis scheduler', {
      cron: config.scheduling.dailyAnalysisCron,
      stocks: config.scheduling.coreStocks,
    });

    // Ensure core stocks are tracked
    await this.initializeCoreStocks();

    // Schedule daily analysis
    this.dailyTask = cron.schedule(
      config.scheduling.dailyAnalysisCron,
      async () => {
        await this.runDailyAnalysis();
      },
      {
        timezone: 'America/New_York',
      }
    );

    logger.info('Daily analysis scheduled');
  }

  stop() {
    if (this.dailyTask) {
      this.dailyTask.stop();
      logger.info('Scheduler stopped');
    }
  }

  async initializeCoreStocks() {
    const coreStocks = config.scheduling.coreStocks;

    for (const symbol of coreStocks) {
      try {
        const existing = await db.query.trackedStocks.findFirst({
          where: eq(trackedStocks.symbol, symbol),
        });

        if (!existing) {
          await db.insert(trackedStocks).values({
            symbol,
            enabled: true,
            priority: 8, // Core stocks get higher priority
          });

          logger.info(`Added core stock: ${symbol}`);
        }
      } catch (error) {
        logger.error(`Failed to add core stock ${symbol}:`, error);
      }
    }
  }

  async runDailyAnalysis() {
    const today = new Date().toISOString().split('T')[0];

    logger.info('Starting daily analysis', { date: today });

    try {
      // Get all enabled tracked stocks
      const stocks = await db.query.trackedStocks.findMany({
        where: eq(trackedStocks.enabled, true),
        orderBy: (stocks, { desc }) => [desc(stocks.priority)],
      });

      const symbols = stocks.map((s) => s.symbol);

      if (symbols.length === 0) {
        logger.warn('No tracked stocks found for daily analysis');
        return;
      }

      logger.info(`Running daily analysis for ${symbols.length} stocks`, { symbols });

      // Add consensus jobs for all tracked stocks
      // Consensus jobs will internally run both PrimoAgent and TradingAgents
      await addBatchJobs(symbols, 'consensus', today);

      logger.info('Daily analysis jobs queued successfully', {
        count: symbols.length,
        date: today,
      });
    } catch (error) {
      logger.error('Daily analysis failed:', error);
    }
  }

  async runImmediateAnalysis(symbols?: string[]) {
    const today = new Date().toISOString().split('T')[0];
    const targetSymbols = symbols || config.scheduling.coreStocks;

    logger.info('Running immediate analysis', {
      symbols: targetSymbols,
      date: today,
    });

    try {
      await addBatchJobs(targetSymbols, 'consensus', today);

      logger.info('Immediate analysis jobs queued', {
        count: targetSymbols.length,
      });

      return {
        success: true,
        count: targetSymbols.length,
        symbols: targetSymbols,
      };
    } catch (error) {
      logger.error('Immediate analysis failed:', error);
      throw error;
    }
  }
}

export const scheduler = new AnalysisScheduler();
export default scheduler;
