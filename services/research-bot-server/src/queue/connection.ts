import IORedis from 'ioredis';
import { config } from '../config.js';
import { logger } from '../logger.js';

export const connection = new IORedis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

connection.on('connect', () => {
  logger.info('Connected to Redis');
});

connection.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

export default connection;
