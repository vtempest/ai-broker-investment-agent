import { Worker, Job } from 'bullmq';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { executeAnalysisJob } from './jobs.js';
import { connection } from './connection.js';

export interface AnalysisJobData {
  symbol: string;
  date?: string;
  jobType: 'primo' | 'trading' | 'consensus';
  priority?: number;
}

export const analysisWorker = new Worker<AnalysisJobData>(
  'analysis-queue',
  async (job: Job<AnalysisJobData>) => {
    const startTime = Date.now();

    logger.info(`Processing job ${job.id} for ${job.data.symbol}`, {
      jobId: job.id,
      symbol: job.data.symbol,
      jobType: job.data.jobType,
    });

    try {
      const result = await executeAnalysisJob(job.data);
      const duration = Date.now() - startTime;

      logger.info(`Job ${job.id} completed successfully`, {
        jobId: job.id,
        symbol: job.data.symbol,
        duration,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Job ${job.id} failed`, {
        jobId: job.id,
        symbol: job.data.symbol,
        duration,
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  },
  {
    connection,
    concurrency: config.jobs.maxConcurrent,
    limiter: {
      max: config.jobs.maxConcurrent,
      duration: 1000,
    },
  }
);

// Worker event handlers
analysisWorker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`, {
    jobId: job.id,
    returnvalue: job.returnvalue,
  });
});

analysisWorker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed`, {
    jobId: job?.id,
    error: err.message,
  });
});

analysisWorker.on('error', (err) => {
  logger.error('Worker error:', err);
});

export default analysisWorker;
