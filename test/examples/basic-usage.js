const HistoricalPECalculator = require('../pe');
const yahooFinance = require('yahoo-finance2').default;

/**
 * Basic usage example - Calculate P/E ratios for a single stock
 */
async function basicExample() {
    console.log('=== Basic Usage Example ===\n');

    // Suppress Yahoo Finance notices for cleaner output
    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

    const calculator = new HistoricalPECalculator();

    try {
        // Calculate historical P/E ratios for Apple
        const result = await calculator.calculateHistoricalPEForStock(
            'AAPL',           // Stock symbol
            '2023-01-01',     // Start date
            '2024-12-31',     // End date
            '1mo'             // Monthly intervals
        );

        // Display statistics
        if (result.statistics) {
            console.log('\n=== P/E Ratio Statistics for AAPL ===');
            console.log(`Current P/E:  ${result.statistics.current?.toFixed(2) || 'N/A'}`);
            console.log(`Average P/E:  ${result.statistics.average.toFixed(2)}`);
            console.log(`Median P/E:   ${result.statistics.median.toFixed(2)}`);
            console.log(`Min P/E:      ${result.statistics.min.toFixed(2)}`);
            console.log(`Max P/E:      ${result.statistics.max.toFixed(2)}`);
            console.log(`Data points:  ${result.statistics.count}`);
        }

        // Display recent P/E ratios
        console.log('\n=== Recent P/E Ratios (Last 6 months) ===');
        const recentPE = result.peRatios
            .filter(item => item.peRatio !== null)
            .slice(-6);

        recentPE.forEach(item => {
            console.log(
                `${item.date.toISOString().split('T')[0]}: ` +
                `Price=$${item.price.toFixed(2)}, ` +
                `TTM EPS=$${item.ttmEPS.toFixed(4)}, ` +
                `P/E=${item.peRatio.toFixed(2)}`
            );
        });

    } catch (error) {
        console.error('Error:', error.message);
        console.log('\nTroubleshooting tips:');
        console.log('1. Check your internet connection');
        console.log('2. Verify the stock symbol is correct');
        console.log('3. Try a different date range');
    }
}

// Run the example
if (require.main === module) {
    basicExample();
}

module.exports = basicExample;
