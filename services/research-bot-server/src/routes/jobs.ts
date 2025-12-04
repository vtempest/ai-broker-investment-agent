import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { addAnalysisJob, addBatchJobs, getQueueStats, clearQueue } from '../queue/queue.js';
import { db } from '../db/index.js';
import { jobHistory } from '../db/schema.js';
import { desc, eq } from 'drizzle-orm';
import { logger } from '../logger.js';
import { scheduler } from '../scheduler.js';

const jobsRouter = new Hono();

const createJobSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  jobType: z.enum(['primo', 'trading', 'consensus']),
  date: z.string().optional(),
  priority: z.number().min(1).max(10).optional(),
});

const batchJobSchema = z.object({
  symbols: z.array(z.string().min(1).max(10).toUpperCase()),
  jobType: z.enum(['primo', 'trading', 'consensus']),
  date: z.string().optional(),
});

const triggerAnalysisSchema = z.object({
  symbols: z.array(z.string().min(1).max(10).toUpperCase()).optional(),
});

// Get queue statistics
jobsRouter.get('/stats', async (c) => {
  try {
    const stats = await getQueueStats();

    return c.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Failed to fetch queue stats:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch queue statistics',
      },
      500
    );
  }
});

// Get job history
jobsRouter.get('/history', async (c) => {
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');
  const status = c.req.query('status');
  const symbol = c.req.query('symbol')?.toUpperCase();

  try {
    let query = db.query.jobHistory.findMany({
      orderBy: [desc(jobHistory.createdAt)],
      limit,
      offset,
    });

    // Apply filters if provided
    // Note: For complex filtering, you might want to use db.select() instead

    const jobs = await query;

    // Apply manual filtering (not ideal but works for small datasets)
    let filteredJobs = jobs;
    if (status) {
      filteredJobs = filteredJobs.filter((j) => j.status === status);
    }
    if (symbol) {
      filteredJobs = filteredJobs.filter((j) => j.symbol === symbol);
    }

    return c.json({
      success: true,
      count: filteredJobs.length,
      jobs: filteredJobs,
    });
  } catch (error) {
    logger.error('Failed to fetch job history:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch job history',
      },
      500
    );
  }
});

// Create single job
jobsRouter.post('/', zValidator('json', createJobSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    const job = await addAnalysisJob(
      data.symbol,
      data.jobType,
      data.date,
      data.priority
    );

    logger.info(`Created job for ${data.symbol}`, {
      jobId: job.id,
      jobType: data.jobType,
    });

    return c.json(
      {
        success: true,
        jobId: job.id,
        symbol: data.symbol,
        jobType: data.jobType,
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create job:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to create job',
      },
      500
    );
  }
});

// Create batch jobs
jobsRouter.post('/batch', zValidator('json', batchJobSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    const jobs = await addBatchJobs(data.symbols, data.jobType, data.date);

    logger.info(`Created ${jobs.length} batch jobs`, {
      jobType: data.jobType,
      symbols: data.symbols,
    });

    return c.json(
      {
        success: true,
        count: jobs.length,
        symbols: data.symbols,
        jobType: data.jobType,
      },
      201
    );
  } catch (error) {
    logger.error('Failed to create batch jobs:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to create batch jobs',
      },
      500
    );
  }
});

// Trigger immediate daily analysis
jobsRouter.post('/trigger-daily', zValidator('json', triggerAnalysisSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    const result = await scheduler.runImmediateAnalysis(data.symbols);

    return c.json({
      success: true,
      message: 'Daily analysis triggered',
      ...result,
    });
  } catch (error) {
    logger.error('Failed to trigger daily analysis:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to trigger daily analysis',
      },
      500
    );
  }
});

// Clear queue
jobsRouter.post('/clear', async (c) => {
  try {
    await clearQueue();

    logger.info('Queue cleared via API');

    return c.json({
      success: true,
      message: 'Queue cleared successfully',
    });
  } catch (error) {
    logger.error('Failed to clear queue:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to clear queue',
      },
      500
    );
  }
});

// Get job details
jobsRouter.get('/:jobId', async (c) => {
  const jobId = c.req.param('jobId');

  try {
    const job = await db.query.jobHistory.findFirst({
      where: eq(jobHistory.jobId, jobId),
    });

    if (!job) {
      return c.json(
        {
          success: false,
          error: 'Job not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      job,
    });
  } catch (error) {
    logger.error(`Failed to fetch job ${jobId}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch job',
      },
      500
    );
  }
});

export default jobsRouter;
