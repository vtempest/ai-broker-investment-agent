import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { db } from '../db/index.js';
import { analysisResults, alerts } from '../db/schema.js';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { logger } from '../logger.js';

const analysisRouter = new Hono();

// Get analysis results
analysisRouter.get('/', async (c) => {
  const symbol = c.req.query('symbol')?.toUpperCase();
  const source = c.req.query('source');
  const date = c.req.query('date');
  const limit = parseInt(c.req.query('limit') || '50');
  const offset = parseInt(c.req.query('offset') || '0');

  try {
    const results = await db.query.analysisResults.findMany({
      orderBy: [desc(analysisResults.createdAt)],
      limit,
      offset,
    });

    // Apply filters manually
    let filteredResults = results;
    if (symbol) {
      filteredResults = filteredResults.filter((r) => r.symbol === symbol);
    }
    if (source) {
      filteredResults = filteredResults.filter((r) => r.source === source);
    }
    if (date) {
      filteredResults = filteredResults.filter((r) => r.date === date);
    }

    return c.json({
      success: true,
      count: filteredResults.length,
      results: filteredResults,
    });
  } catch (error) {
    logger.error('Failed to fetch analysis results:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch analysis results',
      },
      500
    );
  }
});

// Get latest analysis for symbol
analysisRouter.get('/latest/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();

  try {
    const results = await db.query.analysisResults.findMany({
      where: eq(analysisResults.symbol, symbol),
      orderBy: [desc(analysisResults.createdAt)],
      limit: 3, // Get latest from each source
    });

    if (results.length === 0) {
      return c.json({
        success: true,
        symbol,
        message: 'No analysis found',
        results: [],
      });
    }

    // Group by source
    const grouped = results.reduce((acc, result) => {
      acc[result.source] = result;
      return acc;
    }, {} as Record<string, typeof results[0]>);

    return c.json({
      success: true,
      symbol,
      results: grouped,
    });
  } catch (error) {
    logger.error(`Failed to fetch latest analysis for ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch latest analysis',
      },
      500
    );
  }
});

// Get analysis trends for symbol
analysisRouter.get('/trends/:symbol', async (c) => {
  const symbol = c.req.param('symbol').toUpperCase();
  const days = parseInt(c.req.query('days') || '30');

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

    const results = await db.query.analysisResults.findMany({
      where: eq(analysisResults.symbol, symbol),
      orderBy: [desc(analysisResults.date)],
    });

    const filtered = results.filter((r) => r.date >= cutoffDateStr);

    // Calculate trends
    const recommendationCounts = filtered.reduce((acc, r) => {
      acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgConfidence = filtered.reduce((sum, r) => sum + r.confidence, 0) / filtered.length || 0;

    // Group by date
    const byDate = filtered.reduce((acc, r) => {
      if (!acc[r.date]) {
        acc[r.date] = [];
      }
      acc[r.date].push(r);
      return acc;
    }, {} as Record<string, typeof filtered>);

    return c.json({
      success: true,
      symbol,
      period: {
        days,
        from: cutoffDateStr,
        to: new Date().toISOString().split('T')[0],
      },
      summary: {
        totalAnalyses: filtered.length,
        recommendationCounts,
        avgConfidence,
      },
      byDate,
    });
  } catch (error) {
    logger.error(`Failed to fetch trends for ${symbol}:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch trends',
      },
      500
    );
  }
});

// Get alerts
analysisRouter.get('/alerts', async (c) => {
  const unreadOnly = c.req.query('unread') === 'true';
  const limit = parseInt(c.req.query('limit') || '50');

  try {
    const results = await db.query.alerts.findMany({
      orderBy: [desc(alerts.createdAt)],
      limit,
    });

    const filtered = unreadOnly ? results.filter((a) => !a.read) : results;

    return c.json({
      success: true,
      count: filtered.length,
      alerts: filtered,
    });
  } catch (error) {
    logger.error('Failed to fetch alerts:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch alerts',
      },
      500
    );
  }
});

// Mark alert as read
analysisRouter.patch('/alerts/:id/read', async (c) => {
  const id = parseInt(c.req.param('id'));

  try {
    const [alert] = await db
      .update(alerts)
      .set({ read: true })
      .where(eq(alerts.id, id))
      .returning();

    if (!alert) {
      return c.json(
        {
          success: false,
          error: 'Alert not found',
        },
        404
      );
    }

    return c.json({
      success: true,
      alert,
    });
  } catch (error) {
    logger.error(`Failed to mark alert ${id} as read:`, error);
    return c.json(
      {
        success: false,
        error: 'Failed to update alert',
      },
      500
    );
  }
});

// Get dashboard summary
analysisRouter.get('/dashboard', async (c) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Get today's analyses
    const todaysAnalyses = await db.query.analysisResults.findMany({
      where: eq(analysisResults.date, today),
    });

    // Get unread alerts
    const unreadAlerts = await db.query.alerts.findMany({
      where: eq(alerts.read, false),
      orderBy: [desc(alerts.createdAt)],
      limit: 10,
    });

    // Count by recommendation
    const recommendationCounts = todaysAnalyses.reduce((acc, r) => {
      acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // High confidence recommendations
    const highConfidenceRecs = todaysAnalyses
      .filter((r) => r.confidence >= 0.8 && (r.recommendation === 'BUY' || r.recommendation === 'SELL'))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);

    return c.json({
      success: true,
      date: today,
      summary: {
        totalAnalyses: todaysAnalyses.length,
        recommendationCounts,
        unreadAlerts: unreadAlerts.length,
        highConfidenceCount: highConfidenceRecs.length,
      },
      highConfidenceRecommendations: highConfidenceRecs,
      recentAlerts: unreadAlerts,
    });
  } catch (error) {
    logger.error('Failed to fetch dashboard data:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to fetch dashboard data',
      },
      500
    );
  }
});

export default analysisRouter;
