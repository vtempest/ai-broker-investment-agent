const HistoricalPECalculator = require('../pe');
const yahooFinance = require('yahoo-finance2').default;

/**
 * Custom date range example - Demonstrates different intervals and date ranges
 */
async function customDateRangeExample() {
    console.log('=== Custom Date Range Example ===\n');

    yahooFinance.suppressNotices(['ripHistorical', 'yahooSurvey']);

    const symbol = 'NVDA';

    // Example 1: Daily data for recent period
    console.log('Example 1: Daily data for Q1 2024');
    console.log('─'.repeat(50));

    try {
        const calculator1 = new HistoricalPECalculator();

        const result1 = await calculator1.calculateHistoricalPEForStock(
            symbol,
            '2024-01-01',
            '2024-03-31',
            '1d'  // Daily intervals
        );

        console.log(`Data points: ${result1.peRatios.length}`);
        console.log(`Average P/E: ${result1.statistics.average.toFixed(2)}`);

        // Show first and last week
        const validPE = result1.peRatios.filter(item => item.peRatio !== null);
        console.log('\nFirst 5 trading days:');
        validPE.slice(0, 5).forEach(item => {
            console.log(`  ${item.date.toISOString().split('T')[0]}: P/E=${item.peRatio.toFixed(2)}`);
        });

        console.log('\nLast 5 trading days:');
        validPE.slice(-5).forEach(item => {
            console.log(`  ${item.date.toISOString().split('T')[0]}: P/E=${item.peRatio.toFixed(2)}`);
        });

    } catch (error) {
        console.error('Error in Example 1:', error.message);
    }

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 2: Weekly data for 1 year
    console.log('\n\nExample 2: Weekly data for 2023');
    console.log('─'.repeat(50));

    try {
        const calculator2 = new HistoricalPECalculator();

        const result2 = await calculator2.calculateHistoricalPEForStock(
            symbol,
            '2023-01-01',
            '2023-12-31',
            '1wk'  // Weekly intervals
        );

        console.log(`Data points: ${result2.peRatios.length}`);
        console.log(`Average P/E: ${result2.statistics.average.toFixed(2)}`);
        console.log(`P/E Range: ${result2.statistics.min.toFixed(2)} - ${result2.statistics.max.toFixed(2)}`);

        // Calculate quarterly averages
        const validPE = result2.peRatios.filter(item => item.peRatio !== null);
        const quarters = [
            { name: 'Q1', start: new Date('2023-01-01'), end: new Date('2023-03-31') },
            { name: 'Q2', start: new Date('2023-04-01'), end: new Date('2023-06-30') },
            { name: 'Q3', start: new Date('2023-07-01'), end: new Date('2023-09-30') },
            { name: 'Q4', start: new Date('2023-10-01'), end: new Date('2023-12-31') }
        ];

        console.log('\nQuarterly Average P/E:');
        quarters.forEach(quarter => {
            const quarterData = validPE.filter(item =>
                item.date >= quarter.start && item.date <= quarter.end
            );

            if (quarterData.length > 0) {
                const avgPE = quarterData.reduce((sum, item) => sum + item.peRatio, 0) / quarterData.length;
                console.log(`  ${quarter.name}: ${avgPE.toFixed(2)}`);
            }
        });

    } catch (error) {
        console.error('Error in Example 2:', error.message);
    }

    // Add delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Example 3: Monthly data for long-term trend
    console.log('\n\nExample 3: Monthly data for 5-year trend');
    console.log('─'.repeat(50));

    try {
        const calculator3 = new HistoricalPECalculator();

        const result3 = await calculator3.calculateHistoricalPEForStock(
            symbol,
            '2020-01-01',
            '2024-12-31',
            '1mo'  // Monthly intervals
        );

        console.log(`Data points: ${result3.peRatios.length}`);
        console.log(`Average P/E: ${result3.statistics.average.toFixed(2)}`);

        // Calculate yearly averages
        const validPE = result3.peRatios.filter(item => item.peRatio !== null);
        const years = [2020, 2021, 2022, 2023, 2024];

        console.log('\nYearly Average P/E:');
        years.forEach(year => {
            const yearData = validPE.filter(item =>
                item.date.getFullYear() === year
            );

            if (yearData.length > 0) {
                const avgPE = yearData.reduce((sum, item) => sum + item.peRatio, 0) / yearData.length;
                console.log(`  ${year}: ${avgPE.toFixed(2)}`);
            }
        });

    } catch (error) {
        console.error('Error in Example 3:', error.message);
    }

    console.log('\n' + '='.repeat(50));
    console.log('Examples completed!');
}

// Run the example
if (require.main === module) {
    customDateRangeExample();
}

module.exports = customDateRangeExample;
