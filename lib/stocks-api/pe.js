const yahooFinance = require('yahoo-finance2').default;

class HistoricalPECalculator {
    constructor() {
        this.priceData = [];
        this.earningsData = [];
        this.peRatios = [];
    }

    /**
     * Fetch historical price data for a given symbol
     * @param {string} symbol - Stock symbol (e.g., 'AAPL')
     * @param {string} startDate - Start date in YYYY-MM-DD format
     * @param {string} endDate - End date in YYYY-MM-DD format
     * @param {string} interval - Data interval ('1d', '1wk', '1mo')
     */
    async fetchHistoricalPrices(symbol, startDate, endDate, interval = '1d') {
        try {
            console.log(`Fetching historical prices for ${symbol}...`);
            
            // Use chart() instead of historical() as recommended
            const queryOptions = {
                period1: startDate,
                period2: endDate,
                interval: interval
            };

            const result = await yahooFinance.chart(symbol, queryOptions);
            
            // Extract price data from chart response
            const quotes = result.quotes || [];
            this.priceData = quotes.map(item => ({
                date: new Date(item.date),
                close: item.close,
                adjClose: item.adjclose || item.close
            }));

            console.log(`Fetched ${this.priceData.length} price data points`);
            console.log(`Price data range: ${this.priceData[0]?.date.toISOString().split('T')[0]} to ${this.priceData[this.priceData.length-1]?.date.toISOString().split('T')[0]}`);
            return this.priceData;
        } catch (error) {
            console.error('Error fetching historical prices:', error);
            throw error;
        }
    }

    /**
     * Fetch earnings data for calculating TTM EPS
     * @param {string} symbol - Stock symbol
     */
    async fetchEarningsData(symbol) {
        try {
            console.log(`Fetching earnings data for ${symbol}...`);
            
            // First, let's try to get the current financial data to see the current EPS
            try {
                const currentData = await yahooFinance.quoteSummary(symbol, { 
                    modules: ['financialData', 'defaultKeyStatistics'] 
                });
                
                console.log('Current financial data available:');
                if (currentData.financialData?.currentPrice) {
                    console.log(`  Current Price: ${currentData.financialData.currentPrice.raw}`);
                }
                if (currentData.defaultKeyStatistics?.trailingEps) {
                    console.log(`  Current TTM EPS: ${currentData.defaultKeyStatistics.trailingEps.raw}`);
                }
                if (currentData.defaultKeyStatistics?.trailingPE) {
                    console.log(`  Current PE Ratio: ${currentData.defaultKeyStatistics.trailingPE.raw}`);
                }
            } catch (error) {
                console.log('Could not fetch current financial data');
            }
            
            // Try to get quarterly earnings data with detailed debugging
            let earningsData = null;
            
            try {
                console.log('Attempting to fetch quarterly earnings...');
                const quarterlyResult = await yahooFinance.quoteSummary(symbol, { 
                    modules: ['incomeStatementHistoryQuarterly'] 
                });
                
                console.log('Raw quarterly result structure:');
                console.log('Keys:', Object.keys(quarterlyResult || {}));
                
                if (quarterlyResult?.incomeStatementHistoryQuarterly) {
                    console.log('incomeStatementHistoryQuarterly keys:', Object.keys(quarterlyResult.incomeStatementHistoryQuarterly));
                    
                    // Check for different possible data locations
                    const quarterlyData = quarterlyResult.incomeStatementHistoryQuarterly.incomeStatementHistory || 
                                        quarterlyResult.incomeStatementHistoryQuarterly;
                    
                    console.log('Quarterly data type:', typeof quarterlyData);
                    console.log('Quarterly data is array:', Array.isArray(quarterlyData));
                    
                    if (Array.isArray(quarterlyData) && quarterlyData.length > 0) {
                        console.log(`Found ${quarterlyData.length} quarterly statements`);
                        console.log('First statement keys:', Object.keys(quarterlyData[0] || {}));
                        console.log('First statement sample:', JSON.stringify(quarterlyData[0], null, 2));
                        
                        earningsData = {
                            quarterly: quarterlyData,
                            type: 'quarterly'
                        };
                    }
                }
            } catch (error) {
                console.log('Quarterly earnings fetch error:', error.message);
            }
            
            // If quarterly fails, try annual with detailed debugging
            if (!earningsData) {
                try {
                    console.log('Attempting to fetch annual earnings...');
                    const annualResult = await yahooFinance.quoteSummary(symbol, { 
                        modules: ['incomeStatementHistory'] 
                    });
                    
                    console.log('Raw annual result structure:');
                    console.log('Keys:', Object.keys(annualResult || {}));
                    
                    if (annualResult?.incomeStatementHistory) {
                        console.log('incomeStatementHistory keys:', Object.keys(annualResult.incomeStatementHistory));
                        
                        const annualData = annualResult.incomeStatementHistory.incomeStatementHistory ||
                                         annualResult.incomeStatementHistory;
                        
                        console.log('Annual data type:', typeof annualData);
                        console.log('Annual data is array:', Array.isArray(annualData));
                        
                        if (Array.isArray(annualData) && annualData.length > 0) {
                            console.log(`Found ${annualData.length} annual statements`);
                            console.log('First annual statement keys:', Object.keys(annualData[0] || {}));
                            console.log('First annual statement sample:', JSON.stringify(annualData[0], null, 2));
                            
                            earningsData = {
                                annual: annualData,
                                type: 'annual'
                            };
                        }
                    }
                } catch (error) {
                    console.log('Annual earnings fetch error:', error.message);
                }
            }
            
            // Try earnings module as last resort
            if (!earningsData) {
                try {
                    console.log('Attempting to fetch earnings module...');
                    const earningsResult = await yahooFinance.quoteSummary(symbol, { 
                        modules: ['earnings'] 
                    });
                    
                    console.log('Raw earnings result structure:');
                    console.log('Keys:', Object.keys(earningsResult || {}));
                    
                    if (earningsResult?.earnings) {
                        console.log('Earnings keys:', Object.keys(earningsResult.earnings));
                        console.log('Earnings structure:', JSON.stringify(earningsResult.earnings, null, 2));
                        
                        earningsData = {
                            earnings: earningsResult.earnings,
                            type: 'earnings'
                        };
                    }
                } catch (error) {
                    console.log('Earnings module fetch error:', error.message);
                }
            }

            if (!earningsData) {
                throw new Error('Could not fetch earnings data from any module');
            }

            // Process earnings data based on the type
            this.earningsData = this.processEarningsData(earningsData);
            
            console.log(`Processed ${this.earningsData.length} earnings periods`);
            
            // Debug: Show earnings data
            if (this.earningsData.length > 0) {
                console.log('Earnings data sample:');
                this.earningsData.slice(0, 3).forEach(earning => {
                    console.log(`  ${earning.date.toISOString().split('T')[0]}: EPS=${earning.eps}, NetIncome=${earning.netIncome}`);
                });
            } else {
                console.log('WARNING: No earnings data was successfully processed!');
            }
            
            return this.earningsData;
        } catch (error) {
            console.error('Error fetching earnings data:', error);
            throw error;
        }
    }

    /**
     * Fallback method: Use current TTM EPS for all historical calculations
     * This provides approximate historical PE ratios using current earnings
     * @param {string} symbol - Stock symbol
     */
    async fetchCurrentEPSFallback(symbol) {
        try {
            console.log('\n=== Using Fallback Method: Current TTM EPS ===');
            const currentData = await yahooFinance.quoteSummary(symbol, { 
                modules: ['defaultKeyStatistics', 'financialData'] 
            });
            
            let currentTTMEPS = null;
            
            if (currentData.defaultKeyStatistics?.trailingEps?.raw) {
                currentTTMEPS = currentData.defaultKeyStatistics.trailingEps.raw;
                console.log(`Found current TTM EPS: ${currentTTMEPS}`);
            } else if (currentData.financialData?.earningsPerShare?.raw) {
                currentTTMEPS = currentData.financialData.earningsPerShare.raw;
                console.log(`Found EPS from financial data: ${currentTTMEPS}`);
            }
            
            if (currentTTMEPS && currentTTMEPS > 0) {
                // Create a simplified earnings data structure using current EPS
                this.earningsData = [{
                    date: new Date('2020-01-01'), // Use old date so it applies to all price data
                    eps: currentTTMEPS,
                    netIncome: null,
                    sharesOutstanding: null,
                    period: 'ttm_current'
                }];
                
                console.log(`Created fallback earnings data with TTM EPS: ${currentTTMEPS}`);
                console.log('Note: This uses current TTM EPS for all historical periods (approximation)');
                return true;
            }
            
            return false;
        } catch (error) {
            console.log('Fallback method also failed:', error.message);
            return false;
        }
    }
     /**
     * Process raw earnings data into a standardized format
     * @param {Object} rawData - Raw earnings data from Yahoo Finance
     */
    processEarningsData(rawData) {
        let processedData = [];

        if (rawData.type === 'quarterly' && rawData.quarterly) {
            // Handle quarterly data
            processedData = rawData.quarterly.map(statement => {
                const endDate = statement.endDate?.raw ? new Date(statement.endDate.raw * 1000) : null;
                const eps = statement.basicEPS?.raw || statement.dilutedEPS?.raw || null;
                const netIncome = statement.netIncome?.raw || null;
                const shares = statement.weightedAverageShsOut?.raw || statement.weightedAverageShsOutDil?.raw || null;
                
                // Calculate EPS if we have netIncome and shares but no direct EPS
                let calculatedEPS = eps;
                if (!calculatedEPS && netIncome && shares && shares > 0) {
                    calculatedEPS = netIncome / shares;
                }
                
                return {
                    date: endDate,
                    eps: calculatedEPS,
                    netIncome: netIncome,
                    sharesOutstanding: shares,
                    period: 'quarterly'
                };
            }).filter(item => item.date && item.eps !== null);
            
        } else if (rawData.type === 'annual' && rawData.annual) {
            // Handle annual data - we'll need to estimate quarterly values
            processedData = rawData.annual.map(statement => {
                const endDate = statement.endDate?.raw ? new Date(statement.endDate.raw * 1000) : null;
                const eps = statement.basicEPS?.raw || statement.dilutedEPS?.raw || null;
                const netIncome = statement.netIncome?.raw || null;
                const shares = statement.weightedAverageShsOut?.raw || statement.weightedAverageShsOutDil?.raw || null;
                
                // Calculate EPS if we have netIncome and shares but no direct EPS
                let calculatedEPS = eps;
                if (!calculatedEPS && netIncome && shares && shares > 0) {
                    calculatedEPS = netIncome / shares;
                }
                
                return {
                    date: endDate,
                    eps: calculatedEPS,
                    netIncome: netIncome,
                    sharesOutstanding: shares,
                    period: 'annual'
                };
            }).filter(item => item.date && item.eps !== null);
            
        } else if (rawData.type === 'earnings' && rawData.earnings) {
            // Handle earnings module data
            if (rawData.earnings.earningsChart?.quarterly) {
                processedData = rawData.earnings.earningsChart.quarterly.map(quarter => {
                    const date = quarter.date ? new Date(quarter.date) : null;
                    const eps = quarter.actual?.raw || quarter.estimate?.raw || null;
                    
                    return {
                        date: date,
                        eps: eps,
                        netIncome: null,
                        sharesOutstanding: null,
                        period: 'quarterly'
                    };
                }).filter(item => item.date && item.eps !== null);
            }
        }

        // Sort by date (oldest first) and add some debugging
        const sorted = processedData.sort((a, b) => a.date - b.date);
        
        console.log(`Processed earnings data structure:`);
        console.log(`  Total valid entries: ${sorted.length}`);
        if (sorted.length > 0) {
            console.log(`  Date range: ${sorted[0].date.toISOString().split('T')[0]} to ${sorted[sorted.length-1].date.toISOString().split('T')[0]}`);
            console.log(`  Period type: ${sorted[0].period}`);
        }
        
        return sorted;
    }

    /**
     * Process raw earnings data into a standardized format
     * @param {Object} rawData - Raw earnings data from Yahoo Finance
     *
     * @param {Date} targetDate - Date for which to calculate TTM EPS
     */
    calculateTTMEPS(targetDate) {
        // Find earnings data before or on the target date
        const relevantEarnings = this.earningsData
            .filter(earning => earning.date <= targetDate && earning.eps !== null)
            .sort((a, b) => b.date - a.date); // Sort newest first

        if (relevantEarnings.length === 0) {
            return null;
        }

        // If we have quarterly data, use the 4 most recent quarters
        if (relevantEarnings[0].period === 'quarterly') {
            if (relevantEarnings.length < 4) {
                // If we don't have 4 quarters, we can still try to estimate
                // by using available quarters and extrapolating
                if (relevantEarnings.length >= 2) {
                    const availableQuarters = relevantEarnings.slice(0, Math.min(4, relevantEarnings.length));
                    let ttmEPS = availableQuarters.reduce((sum, earning) => sum + earning.eps, 0);
                    
                    // If we have less than 4 quarters, extrapolate
                    if (availableQuarters.length < 4) {
                        const avgQuarterlyEPS = ttmEPS / availableQuarters.length;
                        ttmEPS = avgQuarterlyEPS * 4;
                    }
                    
                    return ttmEPS;
                }
                return null;
            }
            
            // Sum the EPS for the trailing 4 quarters
            const ttmEPS = relevantEarnings.slice(0, 4).reduce((sum, earning) => sum + earning.eps, 0);
            return ttmEPS;
        } 
        // If we have annual data, use the most recent annual EPS
        else if (relevantEarnings[0].period === 'annual') {
            return relevantEarnings[0].eps;
        }

        return null;
    }

    /**
     * Calculate historical PE ratios
     */
    calculateHistoricalPE() {
        console.log('Calculating historical PE ratios...');
        
        if (this.earningsData.length === 0) {
            console.log('No earnings data available for PE calculation');
            return [];
        }
        
        this.peRatios = this.priceData.map(pricePoint => {
            const ttmEPS = this.calculateTTMEPS(pricePoint.date);
            
            let peRatio = null;
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

        // Filter out null PE ratios for summary
        const validPERatios = this.peRatios.filter(item => item.peRatio !== null);
        console.log(`Calculated ${validPERatios.length} valid PE ratios out of ${this.peRatios.length} price points`);
        
        // Debug: Show a few examples
        if (validPERatios.length > 0) {
            console.log('Sample PE calculations:');
            validPERatios.slice(0, 3).forEach(item => {
                console.log(`  ${item.date.toISOString().split('T')[0]}: Price=${item.price.toFixed(2)}, TTM EPS=${item.ttmEPS.toFixed(4)}, PE=${item.peRatio.toFixed(2)}`);
            });
        } else {
            console.log('Debugging PE calculation issue...');
            console.log('Price data sample:', this.priceData.slice(0, 2));
            console.log('Earnings data sample:', this.earningsData.slice(0, 2));
            
            // Try calculating TTM EPS for the latest price point
            if (this.priceData.length > 0) {
                const latestPrice = this.priceData[this.priceData.length - 1];
                const testTTM = this.calculateTTMEPS(latestPrice.date);
                console.log(`Test TTM EPS for ${latestPrice.date.toISOString().split('T')[0]}: ${testTTM}`);
            }
        }
        
        return this.peRatios;
    }

    /**
     * Get statistics about the historical PE ratios
     */
    getPEStatistics() {
        const validPEs = this.peRatios
            .filter(item => item.peRatio !== null)
            .map(item => item.peRatio);

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
    exportToCSV() {
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
     * @param {string} symbol - Stock symbol
     * @param {string} startDate - Start date (YYYY-MM-DD)
     * @param {string} endDate - End date (YYYY-MM-DD)
     * @param {string} interval - Data interval ('1d', '1wk', '1mo')
     */
    async calculateHistoricalPEForStock(symbol, startDate, endDate, interval = '1mo') {
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

// Example usage
async function main() {
    const calculator = new HistoricalPECalculator();
    
    // Configuration
    const symbol = 'AAPL';  // Change this to any stock symbol
    const startDate = '2022-01-01';  // Extended date range for better data
    const endDate = '2024-12-31';
    const interval = '1mo';  // Monthly data points
    
    try {
        // Suppress Yahoo Finance notices for cleaner output
        yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);
        
        const result = await calculator.calculateHistoricalPEForStock(symbol, startDate, endDate, interval);
        
        // Display some recent PE ratios
        console.log('\n=== Recent PE Ratios ===');
        const recentData = result.peRatios
            .filter(item => item.peRatio !== null)
            .slice(-12);  // Last 12 valid data points
            
        if (recentData.length > 0) {
            recentData.forEach(item => {
                console.log(`${item.date.toISOString().split('T')[0]}: Price=${item.price.toFixed(2)}, TTM EPS=${item.ttmEPS.toFixed(4)}, PE=${item.peRatio.toFixed(2)}`);
            });
        } else {
            console.log('No valid PE ratios calculated. This might be due to:');
            console.log('1. Limited earnings data availability');
            console.log('2. Date range issues between price and earnings data');
            console.log('3. Data format changes in Yahoo Finance API');
            console.log('\nTry:');
            console.log('- Extending the date range further back (e.g., 2020-01-01)');
            console.log('- Using a different stock symbol');
            console.log('- Checking if the stock has sufficient earnings history');
        }

        // Optionally save to CSV
        if (result.peRatios.some(item => item.peRatio !== null)) {
            const csvData = calculator.exportToCSV();
            console.log('\n=== CSV Export (first 10 lines) ===');
            console.log(csvData.split('\n').slice(0, 11).join('\n'));
            
            // To save to file (uncomment if running in Node.js environment with fs access):
            // const fs = require('fs');
            // fs.writeFileSync(`${symbol}_historical_pe.csv`, csvData);
            // console.log(`\nData exported to ${symbol}_historical_pe.csv`);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nTroubleshooting tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify the stock symbol is correct');
        console.log('3. Try a different date range');
        console.log('4. Some stocks may have limited historical data');
    }
}

// Run the example
if (require.main === module) {
    main();
}

module.exports = HistoricalPECalculator;