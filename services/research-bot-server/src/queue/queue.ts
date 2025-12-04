import { Queue } from 'bullmq';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { connection } from './connection.js';
import type { AnalysisJobData } from './worker.js';

export const analysisQueue = new Queue<AnalysisJobData>('analysis-queue', {
  connection,
  defaultJobOptions: {
    attempts: config.jobs.retryAttempts,
    backoff: {
      type: 'exponential',
      delay: config.jobs.retryDelayMs,
    },
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 7 * 24 * 3600, // Keep for 7 days
    },
    removeOnFail: {
      count: 500, // Keep last 500 failed jobs
      age: 30 * 24 * 3600, // Keep for 30 days
    },
  },
});

export async function addAnalysisJob(
  symbol: string,
  jobType: 'primo' | 'trading' | 'consensus',
  date?: string,
  priority?: number
) {
  const jobData: AnalysisJobData = {
    symbol,
    date,
    jobType,
    priority,
  };

  const job = await analysisQueue.add(`${jobType}-${symbol}`, jobData, {
    priority: priority || 5,
    jobId: `${jobType}-${symbol}-${Date.now()}`,
  });

  logger.info(`Added ${jobType} job for ${symbol}`, {
    jobId: job.id,
    symbol,
    jobType,
  });

  return job;
}

export async function addBatchJobs(
  symbols: string[],
  jobType: 'primo' | 'trading' | 'consensus',
  date?: string
) {
  const jobs = symbols.map((symbol, index) => ({
    name: `${jobType}-${symbol}`,
    data: {
      symbol,
      date,
      jobType,
      priority: 5,
    } as AnalysisJobData,
    opts: {
      priority: 5,
      jobId: `${jobType}-${symbol}-${Date.now()}-${index}`,
    },
  }));

  const addedJobs = await analysisQueue.addBulk(jobs);

  logger.info(`Added ${addedJobs.length} batch jobs`, {
    jobType,
    symbols,
    count: addedJobs.length,
  });

  return addedJobs;
}

export async function getQueueStats() {
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    analysisQueue.getWaitingCount(),
    analysisQueue.getActiveCount(),
    analysisQueue.getCompletedCount(),
    analysisQueue.getFailedCount(),
    analysisQueue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + completed + failed + delayed,
  };
}

export async function clearQueue() {
  await analysisQueue.drain();
  await analysisQueue.clean(0, 1000, 'completed');
  await analysisQueue.clean(0, 1000, 'failed');

  logger.info('Queue cleared');
}

export default analysisQueue;
