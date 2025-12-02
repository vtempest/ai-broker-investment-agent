const HistoricalPECalculator = require('../pe');
const yahooFinance = require('yahoo-finance2').default;

/**
 * Multiple stocks comparison example
 */
async function compareMultipleStocks() {
    console.log('=== Multiple Stocks P/E Comparison ===\n');

    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

    // Tech stocks to compare
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META'];
    const results = {};

    console.log('Fetching data for:', symbols.join(', '));
    console.log('This may take a moment...\n');

    for (const symbol of symbols) {
        const calculator = new HistoricalPECalculator();

        try {
            console.log(`Processing ${symbol}...`);

            const result = await calculator.calculateHistoricalPEForStock(
                symbol,
                '2023-01-01',
                '2024-12-31',
                '1mo'
            );

            results[symbol] = result.statistics;

            // Add a small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
            console.error(`Error processing ${symbol}:`, error.message);
            results[symbol] = null;
        }
    }

    // Display comparison table
    console.log('\n=== P/E Ratio Comparison Table ===\n');
    console.log('┌────────┬─────────┬─────────┬────────┬───────┬───────┐');
    console.log('│ Symbol │ Current │ Average │ Median │  Min  │  Max  │');
    console.log('├────────┼─────────┼─────────┼────────┼───────┼───────┤');

    for (const [symbol, stats] of Object.entries(results)) {
        if (stats) {
            console.log(
                `│ ${symbol.padEnd(6)} │ ` +
                `${(stats.current?.toFixed(2) || 'N/A').padStart(7)} │ ` +
                `${stats.average.toFixed(2).padStart(7)} │ ` +
                `${stats.median.toFixed(2).padStart(6)} │ ` +
                `${stats.min.toFixed(2).padStart(5)} │ ` +
                `${stats.max.toFixed(2).padStart(5)} │`
            );
        } else {
            console.log(`│ ${symbol.padEnd(6)} │ ${'ERROR'.padStart(7)} │ ${'---'.padStart(7)} │ ${'---'.padStart(6)} │ ${'---'.padStart(5)} │ ${'---'.padStart(5)} │`);
        }
    }

    console.log('└────────┴─────────┴─────────┴────────┴───────┴───────┘');

    // Find stock with lowest and highest average P/E
    const validResults = Object.entries(results).filter(([_, stats]) => stats !== null);

    if (validResults.length > 0) {
        const lowestPE = validResults.reduce((min, [symbol, stats]) =>
            stats.average < min[1].average ? [symbol, stats] : min
        );

        const highestPE = validResults.reduce((max, [symbol, stats]) =>
            stats.average > max[1].average ? [symbol, stats] : max
        );

        console.log('\n=== Analysis ===');
        console.log(`Lowest Average P/E:  ${lowestPE[0]} (${lowestPE[1].average.toFixed(2)})`);
        console.log(`Highest Average P/E: ${highestPE[0]} (${highestPE[1].average.toFixed(2)})`);
    }
}

// Run the example
if (require.main === module) {
    compareMultipleStocks();
}

module.exports = compareMultipleStocks;
