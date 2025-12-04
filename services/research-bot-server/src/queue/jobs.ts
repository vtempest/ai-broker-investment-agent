import axios from 'axios';
import { config } from '../config.js';
import { logger } from '../logger.js';
import { db } from '../db/index.js';
import { jobHistory, analysisResults, trackedStocks, alerts } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { AnalysisJobData } from './worker.js';

interface PrimoAnalysisResult {
  success: boolean;
  result?: {
    analyses?: Record<string, {
      recommendation: string;
      confidence: number;
      price_target?: number;
      technical_analysis?: any;
      fundamental_analysis?: any;
      risk_factors?: string[];
    }>;
  };
}

interface TradingAnalysisResult {
  success: boolean;
  decision?: {
    action: string;
    confidence: number;
    analysis?: any;
    risk_assessment?: {
      level: string;
      factors: string[];
    };
    recommendation?: {
      position_size?: number;
      stop_loss?: number;
      take_profit?: number;
    };
  };
}

export async function executeAnalysisJob(jobData: AnalysisJobData) {
  const { symbol, date, jobType } = jobData;
  const jobId = `${jobType}-${symbol}-${Date.now()}`;
  const startTime = Date.now();

  try {
    // Record job start
    await db.insert(jobHistory).values({
      jobId,
      symbol,
      jobType,
      status: 'processing',
      startedAt: new Date(),
      retryCount: 0,
    });

    let result;

    switch (jobType) {
      case 'primo':
        result = await analyzePrimo(symbol, date);
        break;
      case 'trading':
        result = await analyzeTrading(symbol, date);
        break;
      case 'consensus':
        result = await analyzeConsensus(symbol, date);
        break;
      default:
        throw new Error(`Unknown job type: ${jobType}`);
    }

    const duration = Date.now() - startTime;

    // Update job history
    await db
      .update(jobHistory)
      .set({
        status: 'completed',
        completedAt: new Date(),
        duration,
        result: JSON.stringify(result),
      })
      .where(eq(jobHistory.jobId, jobId));

    // Update tracked stock stats
    await updateStockStats(symbol, true, duration);

    // Check for alerts
    await checkAlerts(symbol, result);

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error(`Job ${jobId} failed:`, error);

    // Update job history
    await db
      .update(jobHistory)
      .set({
        status: 'failed',
        completedAt: new Date(),
        duration,
        error: errorMessage,
      })
      .where(eq(jobHistory.jobId, jobId));

    // Update tracked stock stats
    await updateStockStats(symbol, false, duration);

    // Create error alert
    await db.insert(alerts).values({
      symbol,
      alertType: 'error',
      severity: 'critical',
      message: `Analysis failed for ${symbol}: ${errorMessage}`,
      data: JSON.stringify({ jobId, jobType, error: errorMessage }),
    });

    throw error;
  }
}

async function analyzePrimo(symbol: string, date?: string): Promise<any> {
  const analysisDate = date || new Date().toISOString().split('T')[0];

  logger.info(`Calling PrimoAgent API for ${symbol}`);

  const response = await axios.post<PrimoAnalysisResult>(
    `${config.apis.primoAgent}/analyze`,
    {
      symbols: [symbol],
      date: analysisDate,
    },
    {
      timeout: config.jobs.timeoutMs,
    }
  );

  if (!response.data.success) {
    throw new Error('PrimoAgent analysis failed');
  }

  const analysis = response.data.result?.analyses?.[symbol];

  if (!analysis) {
    throw new Error('No analysis data returned');
  }

  // Save analysis result
  await db.insert(analysisResults).values({
    symbol,
    date: analysisDate,
    source: 'primo',
    recommendation: analysis.recommendation,
    confidence: analysis.confidence,
    priceTarget: analysis.price_target,
    analysis: JSON.stringify(analysis),
  });

  return {
    source: 'primo',
    symbol,
    date: analysisDate,
    analysis,
  };
}

async function analyzeTrading(symbol: string, date?: string): Promise<any> {
  const analysisDate = date || new Date().toISOString().split('T')[0];

  logger.info(`Calling TradingAgents API for ${symbol}`);

  const response = await axios.post<TradingAnalysisResult>(
    `${config.apis.tradingAgents}/analyze`,
    {
      symbol,
      date: analysisDate,
      max_debate_rounds: 2,
    },
    {
      timeout: config.jobs.timeoutMs,
    }
  );

  if (!response.data.success || !response.data.decision) {
    throw new Error('TradingAgents analysis failed');
  }

  const decision = response.data.decision;

  // Save analysis result
  await db.insert(analysisResults).values({
    symbol,
    date: analysisDate,
    source: 'trading',
    recommendation: decision.action,
    confidence: decision.confidence,
    riskLevel: decision.risk_assessment?.level,
    analysis: JSON.stringify(decision),
  });

  return {
    source: 'trading',
    symbol,
    date: analysisDate,
    decision,
  };
}

async function analyzeConsensus(symbol: string, date?: string): Promise<any> {
  const analysisDate = date || new Date().toISOString().split('T')[0];

  logger.info(`Running consensus analysis for ${symbol}`);

  // Run both analyses in parallel
  const [primoResult, tradingResult] = await Promise.all([
    analyzePrimo(symbol, date),
    analyzeTrading(symbol, date),
  ]);

  const primo = primoResult.analysis;
  const trading = tradingResult.decision;

  // Calculate consensus
  const agreement = primo.recommendation === trading.action;
  const avgConfidence = (primo.confidence + trading.confidence) / 2;

  const consensus = {
    decision: agreement ? primo.recommendation :
      primo.confidence > trading.confidence ? primo.recommendation : trading.action,
    strength: agreement ? Math.min(avgConfidence * 1.2, 1.0) : avgConfidence * 0.8,
    agreement,
    primoAnalysis: primo,
    tradingAnalysis: trading,
  };

  // Save consensus result
  await db.insert(analysisResults).values({
    symbol,
    date: analysisDate,
    source: 'consensus',
    recommendation: consensus.decision,
    confidence: consensus.strength,
    analysis: JSON.stringify(consensus),
  });

  return {
    source: 'consensus',
    symbol,
    date: analysisDate,
    consensus,
  };
}

async function updateStockStats(symbol: string, success: boolean, duration: number) {
  const stock = await db.query.trackedStocks.findFirst({
    where: eq(trackedStocks.symbol, symbol),
  });

  if (!stock) {
    return;
  }

  const analysisCount = stock.analysisCount + 1;
  const successCount = success ? stock.successCount + 1 : stock.successCount;
  const failureCount = success ? stock.failureCount : stock.failureCount + 1;

  // Calculate new average duration
  const avgDuration = stock.avgDuration
    ? Math.round((stock.avgDuration * stock.analysisCount + duration) / analysisCount)
    : duration;

  await db
    .update(trackedStocks)
    .set({
      lastAnalyzed: new Date(),
      analysisCount,
      successCount,
      failureCount,
      avgDuration,
      updatedAt: new Date(),
    })
    .where(eq(trackedStocks.symbol, symbol));
}

async function checkAlerts(symbol: string, result: any) {
  const { source, consensus, analysis, decision } = result;

  // High confidence alert
  const confidence =
    source === 'consensus' ? consensus.strength :
    source === 'primo' ? analysis.confidence :
    decision.confidence;

  const recommendation =
    source === 'consensus' ? consensus.decision :
    source === 'primo' ? analysis.recommendation :
    decision.action;

  if (confidence >= 0.85 && (recommendation === 'BUY' || recommendation === 'SELL')) {
    await db.insert(alerts).values({
      symbol,
      alertType: 'high_confidence',
      severity: 'warning',
      message: `High confidence ${recommendation} signal for ${symbol} (${(confidence * 100).toFixed(1)}%)`,
      data: JSON.stringify({ source, confidence, recommendation }),
    });
  }

  // Consensus agreement alert
  if (source === 'consensus' && consensus.agreement) {
    await db.insert(alerts).values({
      symbol,
      alertType: 'consensus_agreement',
      severity: 'info',
      message: `Both agents agree on ${consensus.decision} for ${symbol}`,
      data: JSON.stringify(consensus),
    });
  }
}
