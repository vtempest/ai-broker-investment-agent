// Historical P/E Ratio Calculator for Stocks
// Migrated from JavaScript to TypeScript

import yahooFinance from 'yahoo-finance2';
import type {
    PriceDataPoint,
    EarningsDataPoint,
    CalculatedPERatio,
    PEStatistics,
    PECalculationResult
} from './types';

export class HistoricalPECalculator {
    priceData: PriceDataPoint[] = [];
    earningsData: EarningsDataPoint[] = [];
    peRatios: CalculatedPERatio[] = [];

    /**
     * Fetch historical price data for a given symbol
     */
    async fetchHistoricalPrices(
        symbol: string,
        startDate: string,
        endDate: string,
        interval: '1d' | '1wk' | '1mo' = '1d'
    ): Promise<PriceDataPoint[]> {
        try {
            console.log(`Fetching historical prices for ${symbol}...`);

            const queryOptions = {
                period1: startDate,
                period2: endDate,
                interval: interval
            };

            const result = await yahooFinance.chart(symbol, queryOptions);

            const quotes = result.quotes || [];
            this.priceData = quotes.map(item => ({
                date: new Date(item.date),
                open: item.open || 0,
                high: item.high || 0,
                low: item.low || 0,
                close: item.close || 0,
                volume: item.volume || 0,
                adjClose: item.adjclose || item.close || 0
            }));

            console.log(`Fetched ${this.priceData.length} price data points`);
            return this.priceData;
        } catch (error) {
            console.error('Error fetching historical prices:', error);
            throw error;
        }
    }

    /**
     * Fetch earnings data for calculating TTM EPS
     */
    async fetchEarningsData(symbol: string): Promise<EarningsDataPoint[]> {
        try {
            console.log(`Fetching earnings data for ${symbol}...`);

            let earningsData: any = null;

            // Try quarterly earnings first
            try {
                const quarterlyResult = await yahooFinance.quoteSummary(symbol, {
                    modules: ['incomeStatementHistoryQuarterly']
                });

                if (quarterlyResult?.incomeStatementHistoryQuarterly) {
                    const quarterlyData =
                        quarterlyResult.incomeStatementHistoryQuarterly.incomeStatementHistory ||
                        quarterlyResult.incomeStatementHistoryQuarterly;

                    if (Array.isArray(quarterlyData) && quarterlyData.length > 0) {
                        earningsData = { quarterly: quarterlyData, type: 'quarterly' };
                    }
                }
            } catch (error) {
                console.log('Quarterly earnings fetch error');
            }

            // Try annual if quarterly fails
            if (!earningsData) {
                try {
                    const annualResult = await yahooFinance.quoteSummary(symbol, {
                        modules: ['incomeStatementHistory']
                    });

                    if (annualResult?.incomeStatementHistory) {
                        const annualData =
                            annualResult.incomeStatementHistory.incomeStatementHistory ||
                            annualResult.incomeStatementHistory;

                        if (Array.isArray(annualData) && annualData.length > 0) {
                            earningsData = { annual: annualData, type: 'annual' };
                        }
                    }
                } catch (error) {
                    console.log('Annual earnings fetch error');
                }
            }

            if (!earningsData) {
                throw new Error('Could not fetch earnings data');
            }

            this.earningsData = this.processEarningsData(earningsData);
            console.log(`Processed ${this.earningsData.length} earnings periods`);

            return this.earningsData;
        } catch (error) {
            console.error('Error fetching earnings data:', error);
            throw error;
        }
    }

    /**
     * Fallback method: Use current TTM EPS for all historical calculations
     */
    async fetchCurrentEPSFallback(symbol: string): Promise<boolean> {
        try {
            console.log('Using Fallback Method: Current TTM EPS');
            const currentData = await yahooFinance.quoteSummary(symbol, {
                modules: ['defaultKeyStatistics', 'financialData']
            });

            let currentTTMEPS: number | null = null;

            if (currentData.defaultKeyStatistics?.trailingEps?.raw) {
                currentTTMEPS = currentData.defaultKeyStatistics.trailingEps.raw;
            } else if (currentData.financialData?.earningsPerShare?.raw) {
                currentTTMEPS = currentData.financialData.earningsPerShare.raw;
            }

            if (currentTTMEPS && currentTTMEPS > 0) {
                this.earningsData = [
                    {
                        date: new Date('2020-01-01'),
                        eps: currentTTMEPS,
                        period: 'ttm_current'
                    }
                ];

                console.log(`Created fallback earnings data with TTM EPS: ${currentTTMEPS}`);
                return true;
            }

            return false;
        } catch (error) {
            console.log('Fallback method failed');
            return false;
        }
    }

    /**
     * Process raw earnings data into a standardized format
     */
    private processEarningsData(rawData: any): EarningsDataPoint[] {
        let processedData: EarningsDataPoint[] = [];

        if (rawData.type === 'quarterly' && rawData.quarterly) {
            processedData = rawData.quarterly
                .map((statement: any) => {
                    const endDate = statement.endDate?.raw
                        ? new Date(statement.endDate.raw * 1000)
                        : null;
                    const eps = statement.basicEPS?.raw || statement.dilutedEPS?.raw || null;

                    return {
                        date: endDate,
                        eps: eps,
                        period: 'quarterly' as const
                    };
                })
                .filter((item: any) => item.date && item.eps !== null);
        } else if (rawData.type === 'annual' && rawData.annual) {
            processedData = rawData.annual
                .map((statement: any) => {
                    const endDate = statement.endDate?.raw
                        ? new Date(statement.endDate.raw * 1000)
                        : null;
                    const eps = statement.basicEPS?.raw || statement.dilutedEPS?.raw || null;

                    return {
                        date: endDate,
                        eps: eps,
                        period: 'annual' as const
                    };
                })
                .filter((item: any) => item.date && item.eps !== null);
        }

        return processedData.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    /**
     * Calculate trailing twelve-month EPS for a specific date
     */
    calculateTTMEPS(targetDate: Date): number | null {
        const relevantEarnings = this.earningsData
            .filter(earning => earning.date <= targetDate && earning.eps !== null)
            .sort((a, b) => b.date.getTime() - a.date.getTime());

        if (relevantEarnings.length === 0) {
            return null;
        }

        if (relevantEarnings[0].period === 'quarterly') {
            if (relevantEarnings.length < 4) {
                if (relevantEarnings.length >= 2) {
                    const availableQuarters = relevantEarnings.slice(0, Math.min(4, relevantEarnings.length));
                    let ttmEPS = availableQuarters.reduce((sum, earning) => sum + earning.eps, 0);

                    if (availableQuarters.length < 4) {
                        const avgQuarterlyEPS = ttmEPS / availableQuarters.length;
                        ttmEPS = avgQuarterlyEPS * 4;
                    }

                    return ttmEPS;
                }
                return null;
            }

            const ttmEPS = relevantEarnings.slice(0, 4).reduce((sum, earning) => sum + earning.eps, 0);
            return ttmEPS;
        } else if (relevantEarnings[0].period === 'annual') {
            return relevantEarnings[0].eps;
        }

        return null;
    }

    /**
     * Calculate historical PE ratios
     */
    calculateHistoricalPE(): CalculatedPERatio[] {
        console.log('Calculating historical PE ratios...');

        if (this.earningsData.length === 0) {
            console.log('No earnings data available for PE calculation');
            return [];
        }

        this.peRatios = this.priceData.map(pricePoint => {
            const ttmEPS = this.calculateTTMEPS(pricePoint.date);

            let peRatio: number | null = null;
            if (ttmEPS && ttmEPS > 0) {
                peRatio = pricePoint.adjClose / ttmEPS;
            }

            return {
                date: pricePoint.date,
                price: pricePoint.adjClose,
                ttmEPS: ttmEPS,
                peRatio: peRatio
            };
        });

        const validPERatios = this.peRatios.filter(item => item.peRatio !== null);
        console.log(
            `Calculated ${validPERatios.length} valid PE ratios out of ${this.peRatios.length} price points`
        );

        return this.peRatios;
    }

    /**
     * Get statistics about the historical PE ratios
     */
    getPEStatistics(): PEStatistics | null {
        const validPEs = this.peRatios
            .filter(item => item.peRatio !== null)
            .map(item => item.peRatio as number);

        if (validPEs.length === 0) return null;

        const sorted = validPEs.sort((a, b) => a - b);
        const min = Math.min(...validPEs);
        const max = Math.max(...validPEs);
        const avg = validPEs.reduce((sum, pe) => sum + pe, 0) / validPEs.length;
        const median = sorted[Math.floor(sorted.length / 2)];

        return {
            count: validPEs.length,
            min: min,
            max: max,
            average: avg,
            median: median,
            current: this.peRatios[this.peRatios.length - 1]?.peRatio || null
        };
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(): string {
        const headers = ['Date', 'Price', 'TTM_EPS', 'PE_Ratio'];
        const csvRows = [headers.join(',')];

        this.peRatios.forEach(item => {
            const row = [
                item.date.toISOString().split('T')[0],
                item.price?.toFixed(2) || '',
                item.ttmEPS?.toFixed(4) || '',
                item.peRatio?.toFixed(2) || ''
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    /**
     * Main method to calculate historical PE ratios for a stock
     */
    async calculateHistoricalPEForStock(
        symbol: string,
        startDate: string,
        endDate: string,
        interval: '1d' | '1wk' | '1mo' = '1mo'
    ): Promise<PECalculationResult> {
        try {
            console.log(`\n=== Calculating Historical PE Ratios for ${symbol} ===`);
            console.log(`Period: ${startDate} to ${endDate}`);
            console.log(`Interval: ${interval}\n`);

            // Fetch price data
            await this.fetchHistoricalPrices(symbol, startDate, endDate, interval);

            // Try to fetch detailed earnings data first
            await this.fetchEarningsData(symbol);

            // If no earnings data was processed, try the fallback method
            if (this.earningsData.length === 0) {
                console.log('\nNo detailed earnings data available, trying fallback method...');
                const fallbackSuccess = await this.fetchCurrentEPSFallback(symbol);

                if (!fallbackSuccess) {
                    throw new Error('Could not obtain any EPS data for PE calculation');
                }
            }

            // Calculate PE ratios
            this.calculateHistoricalPE();

            // Display statistics
            const stats = this.getPEStatistics();
            if (stats) {
                console.log('\n=== PE Ratio Statistics ===');
                console.log(`Valid data points: ${stats.count}`);
                console.log(`Current PE: ${stats.current?.toFixed(2) || 'N/A'}`);
                console.log(`Average PE: ${stats.average.toFixed(2)}`);
                console.log(`Median PE: ${stats.median.toFixed(2)}`);
                console.log(`Min PE: ${stats.min.toFixed(2)}`);
                console.log(`Max PE: ${stats.max.toFixed(2)}`);
            }

            return {
                priceData: this.priceData,
                earningsData: this.earningsData,
                peRatios: this.peRatios,
                statistics: stats
            };
        } catch (error) {
            console.error('Error in calculateHistoricalPEForStock:', error);
            throw error;
        }
    }
}

export default HistoricalPECalculator;
