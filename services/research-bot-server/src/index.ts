import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { config } from './config.js';
import { logger } from './logger.js';
import { initializeDatabase } from './db/index.js';
import { scheduler } from './scheduler.js';
import './queue/worker.js'; // Import worker to start it
import stocksRouter from './routes/stocks.js';
import jobsRouter from './routes/jobs.js';
import analysisRouter from './routes/analysis.js';
import { getQueueStats } from './queue/queue.js';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', honoLogger());
app.use('*', prettyJSON());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Research Bot Server',
    version: '1.0.0',
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', async (c) => {
  try {
    const queueStats = await getQueueStats();

    return c.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      queue: queueStats,
    });
  } catch (error) {
    return c.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

// API routes
app.route('/api/stocks', stocksRouter);
app.route('/api/jobs', jobsRouter);
app.route('/api/analysis', analysisRouter);

// System info
app.get('/api/system/info', (c) => {
  return c.json({
    success: true,
    config: {
      redis: {
        host: config.redis.host,
        port: config.redis.port,
      },
      scheduling: {
        cron: config.scheduling.dailyAnalysisCron,
        coreStocks: config.scheduling.coreStocks,
      },
      jobs: {
        maxConcurrent: config.jobs.maxConcurrent,
        timeoutMs: config.jobs.timeoutMs,
        retryAttempts: config.jobs.retryAttempts,
      },
    },
    apis: {
      primoAgent: config.apis.primoAgent,
      tradingAgents: config.apis.tradingAgents,
    },
  });
});

// Error handler
app.onError((err, c) => {
  logger.error('Unhandled error:', err);

  return c.json(
    {
      success: false,
      error: err.message || 'Internal server error',
    },
    500
  );
});

// Initialize and start server
async function start() {
  try {
    logger.info('Initializing Research Bot Server...');

    // Initialize database
    initializeDatabase();
    logger.info('Database initialized');

    // Start scheduler
    await scheduler.start();
    logger.info('Scheduler started');

    // Start server
    const port = config.port;
    logger.info(`Starting server on port ${port}...`);

    serve(
      {
        fetch: app.fetch,
        port,
      },
      (info) => {
        logger.info(`🚀 Research Bot Server running at http://localhost:${info.port}`);
        logger.info(`📊 Dashboard: http://localhost:${info.port}/api/analysis/dashboard`);
        logger.info(`📈 Tracked stocks: http://localhost:${info.port}/api/stocks`);
        logger.info(`⚙️  Queue stats: http://localhost:${info.port}/api/jobs/stats`);
      }
    );
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  scheduler.stop();
  process.exit(0);
});

// Start the server
start();

export default app;
