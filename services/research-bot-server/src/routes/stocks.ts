import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { trackedStocks, analysisResults } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { logger } from '../logger.js';

const stocksRouter = new Hono();

const addStockSchema = z.object({
  symbol: z.string().min(1).max(10).toUpperCase(),
  name: z.string().optional(),
  sector: z.string().optional(),
  priority: z.number().min(1).max(10).default(5),
});

const updateStockSchema = z.object({
  name: z.string().optional(),
  sector: z.string().optional(),
  enabled: z.boolean().optional(),
  priority: z.number().min(1).max(10).optional(),
});

// Get all tracked stocks
stocksRouter.get('/', async (c) => {
  try {
    const stocks = await db.query.trackedStocks.findMany({
      orderBy: [desc(trackedStocks.priority), desc(trackedStocks.enabled)],
    });

    return c.json({
      success: true,
      count: stocks.length,
      stocks,
    });
  } catch (error) {
    logger.error('Failed to fetch tracked stocks:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch tracked stocks',
      },
      500
    );
  }
});

// Get single stock
stocksRouter.get('/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();

  try {
    const stock = await db.query.trackedStocks.findFirst({
      where: eq(trackedStocks.symbol, symbol),
    });

    if (!stock) {
      return c.json(
        {
          success: false,
          error: 'Stock not found',
        },
        404
      );
    }

    // Get recent analysis results
    const recentAnalyses = await db.query.analysisResults.findMany({
      where: eq(analysisResults.symbol, symbol),
      orderBy: [desc(analysisResults.createdAt)],
      limit: 10,
    });

    return c.json({
      success: true,
      stock,
      recentAnalyses,
    });
  } catch (error) {
    logger.error(`Failed to fetch stock ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch stock',
      },
      500
    );
  }
});

// Add tracked stock
stocksRouter.post('/', zValidator('json', addStockSchema), async (c) => {
  const data = c.req.valid('json');

  try {
    const existing = await db.query.trackedStocks.findFirst({
      where: eq(trackedStocks.symbol, data.symbol),
    });

    if (existing) {
      return c.json(
        {
          success: false,
          error: 'Stock already tracked',
        },
        409
      );
    }

    const [stock] = await db
      .insert(trackedStocks)
      .values({
        symbol: data.symbol,
        name: data.name,
        sector: data.sector,
        priority: data.priority,
        enabled: true,
      })
      .returning();

    logger.info(`Added tracked stock: ${data.symbol}`);

    return c.json(
      {
        success: true,
        stock,
      },
      201
    );
  } catch (error) {
    logger.error(`Failed to add stock ${data.symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to add stock',
      },
      500
    );
  }
});

// Update tracked stock
stocksRouter.patch('/:symbol', zValidator('json', updateStockSchema), async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const data = c.req.valid('json');

  try {
    const [stock] = await db
      .update(trackedStocks)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(trackedStocks.symbol, symbol))
      .returning();

    if (!stock) {
      return c.json(
        {
          success: false,
          error: 'Stock not found',
        },
        404
      );
    }

    logger.info(`Updated tracked stock: ${symbol}`);

    return c.json({
      success: true,
      stock,
    });
  } catch (error) {
    logger.error(`Failed to update stock ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to update stock',
      },
      500
    );
  }
});

// Delete tracked stock
stocksRouter.delete('/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();

  try {
    const deleted = await db
      .delete(trackedStocks)
      .where(eq(trackedStocks.symbol, symbol))
      .returning();

    if (deleted.length === 0) {
      return c.json(
        {
          success: false,
          error: 'Stock not found',
        },
        404
      );
    }

    logger.info(`Deleted tracked stock: ${symbol}`);

    return c.json({
      success: true,
      message: `Stock ${symbol} removed from tracking`,
    });
  } catch (error) {
    logger.error(`Failed to delete stock ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to delete stock',
      },
      500
    );
  }
});

// Get stock statistics
stocksRouter.get('/:symbol/stats', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();

  try {
    const stock = await db.query.trackedStocks.findFirst({
      where: eq(trackedStocks.symbol, symbol),
    });

    if (!stock) {
      return c.json(
        {
          success: false,
          error: 'Stock not found',
        },
        404
      );
    }

    const analyses = await db.query.analysisResults.findMany({
      where: eq(analysisResults.symbol, symbol),
      orderBy: [desc(analysisResults.createdAt)],
    });

    // Calculate statistics
    const recommendationCounts = analyses.reduce((acc, analysis) => {
      acc[analysis.recommendation] = (acc[analysis.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence =
      analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length || 0;

    return c.json({
      success: true,
      symbol,
      stats: {
        totalAnalyses: stock.analysisCount,
        successCount: stock.successCount,
        failureCount: stock.failureCount,
        successRate: stock.analysisCount > 0
          ? (stock.successCount / stock.analysisCount) * 100
          : 0,
        avgDuration: stock.avgDuration,
        lastAnalyzed: stock.lastAnalyzed,
        recommendationCounts,
        avgConfidence,
      },
    });
  } catch (error) {
    logger.error(`Failed to fetch stats for ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
      },
      500
    );
  }
});

export default stocksRouter;
